# replace API variables or add it to OS

import os, base64, io, logging
import numpy as np
from PIL import Image, ImageFilter, ImageOps

logger = logging.getLogger(__name__)

CODE_EXTRACTION_PROMPT = """\
You are an expert at reading handwritten source code from images.
The code is written in {language}.
Extract ALL the code you see exactly as written — every line, every symbol.
Use your knowledge of {language} syntax to resolve ambiguous characters correctly:
  - # is always # (hash/pound), never H
  - << and >> are stream operators in C++
  - Header names like <iostream> must be preserved
  - $ prefixes variables in PHP
  - := is the short variable declaration in Go
Output ONLY the raw source code. No explanation. No markdown fences. No extra text."""

LANG_LABELS = {
    "c": "C", "cpp": "C++", "csharp": "C#",
    "java": "Java", "javascript": "JavaScript",
    "php": "PHP", "go": "Go",
}


# Image preprocessing (shared by Tesseract and PaddleOCR)
def _preprocess(image: Image.Image, scale: float = 2.5) -> Image.Image:
    """
    Upscale → grayscale → auto-contrast → sharpen → binarise.
    These steps dramatically improve both Tesseract and PaddleOCR on
    handwritten/photographed code images.
    """
    # 1. Upscale
    w, h = image.size
    image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # 2. Grayscale
    image = image.convert("L")

    # 3. Auto-contrast
    image = ImageOps.autocontrast(image, cutoff=2)

    # 4. Sharpen
    image = image.filter(ImageFilter.SHARPEN)
    image = image.filter(ImageFilter.SHARPEN)   # double-sharpen

    arr       = np.array(image, dtype=np.uint8)
    threshold = int(arr.mean() * 0.85)           # slightly below mean → keep ink
    binary    = np.where(arr < threshold, 0, 255).astype(np.uint8)
    image     = Image.fromarray(binary)

    return image.convert("RGB")

# Public entry point
def extract_text_from_image(
    image:      Image.Image,
    ocr_engine: str = "vision",
    ai_model:   str = "eboo",
    language:   str = "cpp",
) -> str:
    ocr_engine = ocr_engine.lower().strip()
    ai_model   = ai_model.lower().strip()

    dispatch = {
        "vision":    lambda: _vision_ocr(image, ai_model, language),
        "easyocr":   lambda: _easyocr_engine(image),
        "trocr":     lambda: _trocr_engine(image),
        "tesseract": lambda: _tesseract_engine(image),
        "paddleocr": lambda: _paddleocr_engine(image),
    }

    fn = dispatch.get(ocr_engine)
    if fn is None:
        logger.warning(f"Unknown ocr_engine '{ocr_engine}', defaulting to vision")
        fn = dispatch["vision"]

    return fn()

# Vision AI

def _vision_ocr(image: Image.Image, ai_model: str, language: str) -> str:
    b64    = _to_base64(image)
    label  = LANG_LABELS.get(language, language)
    prompt = CODE_EXTRACTION_PROMPT.format(language=label)
    
    groq_key   = os.getenv("groq_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("gemini_API_KEY")
    eboo_key = os.getenv("EBOO_API_KEY")
    
    order      = _build_order(ai_model, groq_key, openai_key, gemini_key,eboo_key)

    for name, key in order:
        logger.info(f"[Vision] Trying {name}")
        result = None
        try:
            if name == "groq":   result = _groq(b64, prompt, key)
            elif name == "openai": result = _openai(b64, prompt, key)
            elif name == "gemini": result = _gemini(b64, prompt, key)
            elif name == "eboo": result = _eboo(image,key)
        except Exception as e:
            logger.error(f"[Vision/{name}] Error: {e}")
        if result:
            return result

    logger.warning("[Vision] All APIs failed — falling back to Tesseract")
    return _tesseract_engine(image)


def _build_order(requested, groq_key, openai_key, gemini_key,eboo_key):
    available = {}
    if groq_key:   available["groq"]   = groq_key
    if openai_key: available["openai"] = openai_key
    if gemini_key: available["gemini"] = gemini_key
    if eboo_key: available["eboo"] = eboo_key
    order = []
    if requested in available:
        order.append((requested, available[requested]))
    for name, key in available.items():
        if name != requested:
            order.append((name, key))
    return order


def _to_base64(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=95)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _groq(b64, prompt, key):
    import requests
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": "meta-llama/llama-4-scout-17b-16e-instruct",
            "messages": [{"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                {"type": "text", "text": prompt},
            ]}],
            "max_tokens": 2048, "temperature": 0,
        }, timeout=60)
    data = r.json()
    if "choices" in data:
        return data["choices"][0]["message"]["content"].strip()
    logger.error(f"[Groq] {data}")
    return None


def _openai(b64, prompt, key):
    import requests
    r = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}},
                {"type": "text", "text": prompt},
            ]}],
            "max_tokens": 2048, "temperature": 0,
        }, timeout=60)
    data = r.json()
    if "choices" in data:
        return data["choices"][0]["message"]["content"].strip()
    logger.error(f"[OpenAI] {data}")
    return None


def _gemini(b64, prompt, key):
    import requests
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    
    payload = {
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": "image/jpeg", "data": b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 2048
        }
    }
    
    r = requests.post(url, json=payload, timeout=60)
    
    # Error handling IMPORTANT!
    if r.status_code != 200:
        return f"Error: {r.status_code} - {r.text}"
        
    data = r.json()
    
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        return "Error: Could not parse response. Check if the image was flagged or empty."

def _eboo(image,key):
    import requests
    import json
    url = "https://www.eboo.ir/api/ocr/getway"
    print("debug")

    # filename = image
    # upload = {'filehandle':(filename, open(filename, 'rb'), 'multipart/form-data')}
    
    fmt = image.format if image.format else 'JPEG'
    ext = fmt.lower()
    
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=fmt)
    img_byte_arr.seek(0)
    
    upload = {
        'filehandle': (f'image.{ext}', img_byte_arr, 'multipart/form-data')
    }
    
    payload = {
    "token": key,
    "command": "addfile",
    }
    r = requests.post(url, data=payload,files=upload)
    data = r.text
    print(data)
    json_data= json.loads(data)
    print(json_data)
    FileToken = json_data["FileToken"]
    
    payload2 = {
    "token": key,
    "command": "convert",
    "filetoken":FileToken,
    "method":4,
    "output":"txtraw",
    }
    response2 = requests.post(url=url,data=payload2)
    data2 = response2.text
    try:
        return data2
    except(KeyError,IndexError):
        return "Eboo - Error: Could not parse response. Check if the image was flagged or empty."
    


# EasyOCR
_easyocr_reader = None

def _get_easyocr():
    global _easyocr_reader
    if _easyocr_reader is None:
        import easyocr
        logger.info("[EasyOCR] Loading model (~200MB first run)...")
        _easyocr_reader = easyocr.Reader(["en"], gpu=False)
        logger.info("[EasyOCR] Ready")
    return _easyocr_reader

def _easyocr_engine(image: Image.Image) -> str:
    try:
        processed = _preprocess(image)
        reader    = _get_easyocr()
        arr       = np.array(processed)
        results   = reader.readtext(arr, detail=0, paragraph=False)
        return "\n".join(results)
    except Exception as e:
        logger.error(f"[EasyOCR] {e}")
        return ""


# TrOCR
_trocr_loaded    = False
_trocr_processor = None
_trocr_model     = None
_trocr_device    = None

def _load_trocr():
    global _trocr_loaded, _trocr_processor, _trocr_model, _trocr_device
    if _trocr_loaded:
        return
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    import torch
    logger.info("[TrOCR] Loading model")
    _trocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-large-handwritten")
    _trocr_model     = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-large-handwritten")
    _trocr_device    = "cuda" if torch.cuda.is_available() else "cpu"
    _trocr_model.to(_trocr_device)
    _trocr_model.eval()
    _trocr_loaded = True
    logger.info(f"[TrOCR] Ready on {_trocr_device}")

def _trocr_engine(image: Image.Image) -> str:
    import torch
    _load_trocr()
    lines   = _split_lines(image)
    results = []
    for line_img in (lines or [image]):
        pv   = _trocr_processor(images=line_img, return_tensors="pt").pixel_values.to(_trocr_device)
        with torch.no_grad():
            ids = _trocr_model.generate(pv, max_new_tokens=256)
        text = _trocr_processor.batch_decode(ids, skip_special_tokens=True)[0].strip()
        if text:
            results.append(text)
    return "\n".join(results)

def _split_lines(image: Image.Image, min_h: int = 15):
    arr     = np.array(image.convert("L"))
    dark    = (arr < 200).sum(axis=1)
    thresh  = max(1, arr.shape[1] * 0.01)
    content = dark > thresh
    lines, in_l, start = [], False, 0
    for i, has in enumerate(content):
        if has and not in_l:
            start, in_l = i, True
        elif not has and in_l:
            if i - start >= min_h:
                lines.append(image.crop((0, max(0, start-5), image.width, min(image.height, i+5))))
            in_l = False
    if in_l:
        lines.append(image.crop((0, max(0, start-5), image.width, image.height)))
    return lines


# Tesseract 5 (LSTM)

#   --oem 1 = LSTM neural net engine
#   --psm 6
#   -c

def _tesseract_engine(image: Image.Image) -> str:
    try:
        import pytesseract


        processed = _preprocess(image, scale=3.0)

        config = (
            "--oem 1 "
            "--psm 6 "
            "-c preserve_interword_spaces=1 "
            "-c tessedit_char_whitelist="
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            "0123456789 "
            r"!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"
        )

        text = pytesseract.image_to_string(processed, config=config, lang="eng")
        text = text.strip()

        if not text:
            logger.warning("[Tesseract] Empty result — trying without whitelist")
            text = pytesseract.image_to_string(
                processed,
                config="--oem 1 --psm 6",
                lang="eng"
            ).strip()

        logger.info(f"[Tesseract] Extracted {len(text)} chars")
        return text

    except ImportError:
        logger.error("[Tesseract] pytesseract not installed.")
        return ""
    except Exception as e:
        logger.error(f"[Tesseract] Error: {e}")
        return ""


# PaddleOCR
# use_gpu=False => CPU-only

_paddle_reader = None

def _get_paddle():
    global _paddle_reader
    if _paddle_reader is None:
        from paddleocr import PaddleOCR
        logger.info("[PaddleOCR] Loading model")
        _paddle_reader = PaddleOCR(
            use_angle_cls=True,
            lang="en",
            # use_gpu=False,
            # show_log=False,
        )
        logger.info("[PaddleOCR] Ready")
    return _paddle_reader

def _paddleocr_engine(image: Image.Image) -> str:
    try:
        processed = _preprocess(image, scale=2.0)
        arr       = np.array(processed)
        ocr       = _get_paddle()
        result    = ocr.predict(arr)

        lines = []
        if result and result[0]:
            detections = sorted(result[0], key=lambda x: x[0][0][1])
            for detection in detections:
                text, confidence = detection[1]
                if confidence > 0.3 and text.strip():   # filter low-confidence noise
                    lines.append(text.strip())

        full_text = "\n".join(lines)
        logger.info(f"[PaddleOCR] Extracted {len(lines)} lines, {len(full_text)} chars")
        return full_text

    except ImportError:
        logger.error("[PaddleOCR] Not installed")
        return ""
    except Exception as e:
        logger.error(f"[PaddleOCR] Error: {e}")
        return ""
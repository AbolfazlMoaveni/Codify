from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
from PIL import Image
import io
import logging

from ocr_engine import extract_text_from_image
from postprocessor import postprocess_code

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Codify-Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = "output_files"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map language value => file extension
EXTENSION_MAP = {
    "c":          "c",
    "cpp":        "cpp",
    "csharp":     "cs",
    "java":       "java",
    "javascript": "js",
    "php":        "php",
    "go":         "go",
}


@app.get("/")
def root():
    return {"status": "running", "version": "2.0.0"}


@app.post("/ocr")
async def ocr_endpoint(
    file:       UploadFile = File(...),
    language:   str        = Form(default="cpp"),
    ai_model:   str        = Form(default="groq"),
    ocr_engine: str        = Form(default="vision"),
):
    logger.info(f"Request → language={language}, ai_model={ai_model}, ocr_engine={ocr_engine}")
    logger.info(f"File: name={file.filename}, type={file.content_type}")

    image_bytes = await file.read()
    logger.info(f"File size: {len(image_bytes)} bytes")

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        logger.info(f"Image opened: {image.size}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not open image: {e}")

    # OCR
    logger.info(f"Running OCR with engine={ocr_engine}, model={ai_model}")
    raw_text = extract_text_from_image(
        image=image,
        ocr_engine=ocr_engine,
        ai_model=ai_model,
        language=language,
    )
    logger.info(f"OCR raw output:\n{raw_text[:300]}")

    # Post-process
    formatted_code = postprocess_code(raw_text, language=language)

    # Save file with with right extension
    ext = EXTENSION_MAP.get(language, "txt")
    file_id = str(uuid.uuid4())
    out_filename = f"{file_id}.{ext}"
    out_path = os.path.join(OUTPUT_DIR, out_filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(formatted_code)

    logger.info(f"Saved: {out_filename}")

    return JSONResponse({
        "raw":          raw_text,
        "formatted":    formatted_code,
        "language":     language,
        "ocr_engine":   ocr_engine,
        "ai_model":     ai_model,
        "download_url": f"/download/{out_filename}",
        "filename":     out_filename,
    })


@app.get("/download/{filename}")
def download_file(filename: str):
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(path=filepath, filename=filename, media_type="text/plain")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

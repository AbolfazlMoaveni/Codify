"""
postprocessor.py  v2
Language-aware post-processing pipeline.
Each language has its own symbol fix table, structural rules, and AI prompt.
"""

import re, os, logging
logger = logging.getLogger(__name__)


# Universal symbol fixes
UNIVERSAL_FIXES = [
    (r'[""„]',     '"'),
    (r"[''`]",     "'"),
    (r'[；]',       ';'),
    (r'[（]',       '('),
    (r'[）]',       ')'),
    (r'[，]',       ','),
    (r'-\s*>',     '->'),
    (r'\+\s*\+',   '++'),
    (r'-\s*-',     '--'),
]


# Per-language Fixes

LANGUAGE_CONFIG = {

    "c": {
        "symbol_fixes": [
            (r'[{\[（]', '{'), (r'[}\]）]', '}'),
            (r'::',      ''),
        ],
        "word_fixes": [
            (r'\b[il]nclude\b',    'include'),
            (r'\bstd[io]\.h\b',    'stdio.h'),
            (r'\bstd[l]ib\.h\b',   'stdlib.h'),
            (r'\bprtntf\b',        'printf'),
            (r'\bscanf\b',         'scanf'),
            (r'\bretum\b',         'return'),
            (r'\bmai\s*n\b',       'main'),
            (r'\bvoi\s*d\b',       'void'),
            (r'\bf[o0]r\b',        'for'),
            (r'\bwhi[il]e\b',      'while'),
            (r'\b< <\b' , '<<'),
            (r'\b> >\b', '>>'),
        ],
        "file_header": "",
    },

    "cpp": {
        "symbol_fixes": [
            (r'[{\[（]', '{'), (r'[}\]）]', '}'),
        ],
        "word_fixes": [
            (r'\b[il]nclude\b','include'),
            (r'BincludeSiostrean7','#include <iostream>'),
            (r'\bstd\s*::\s*c[o0]ut\b','std::cout'),
            (r'\bstd\s*::\s*c[il]n\b','std::cin'),
            (r'\bstd\s*::\s*endl\b','std::endl'),
            (r'\bretum\b','return'),
            (r'\bmai\s*n\b','main'),
            (r'\bf[o0]r\b','for'),
            (r'\bwhi[il]e\b','while'),
            (r'\bprtntf\b','printf'),
            (r'\b< <\b' ,'<<'),
            (r'\b> >\b','>>'),
            (r'\b#Include\b',"#include"),
            (r'\b<tostream?\b',"<iostream>"),
            (r'\bustng\b',"using"),
            (r'\bdnt\b',"int"),
            # (r'\bmatl\({n\b',"main(){"),
            (r'\bretur\b',"return"),
            (r'\b#ilicluide\b','#include'),
            (r'\b#iuclude\b','#include'),
            (r'\b#iucluide\b','#include'),
            (r'\b#incluide\b','#include'),
            (r'\b#illchide\b','#include'),
            (r'\b#iuicluide\b','#include'),
            (r'\b#iulclude\b','#include'),
            (r'\b#inchude\b','#include'),
            # (r'\b<wildowsh>\b','<windows.h>'),
            (r'\bcOust\b','const'),
            (r'\busig\b','using'),
            (r'\!latllespace\b','namespace'),
            (r"<iostreal>", "<iostream>"),
            (r"\#iuicluide", "#include"),
            (r'\beturn\b', "return"),
            (r"maino", "main(){"),
            (r"00;", "0;"),
            (r"<timeh>", "<time.h>"),
            (r"<stdltbab>", "<stdlib.h>"),
            (r"scdssthreadsshardware", "std::thread::hardware_concurrency();"),
            (r"ustog", "using"),
            (r"<windowsh>", "<windows.h>"),
            (r"<tdme\-h>", "<time.h>"),
            (r"<sstreana>", "<sstream>"),
            (r"<bbeam>", "<fstream>"),
            (r"<sstreal>", "<sstream>"),
            (r"<wtndowzs\-h>", "<windows.h>"),
            (r"auco", "auto"),
            (r"<string\?", "<string>"),
            (r"<cltollo>", "<chrono>"),
            (r"<tindowuh>", "<windows.h>"),
            (r"<iostreams", "<iostream>"),
            (r"\#iucluide", "#include"),
            (r"\#ilicluide", "#include"),
            (r"\#iuclude", "#include"),
            (r"kogical_", "logical_cores"),
            (r"ciostream", "<iostream>"),
            (r"matln\(\{", "main(){"),
            (r"\#include:", "#include"),
            (r"maino\{", "main(){"),
            (r"<strulg\?", "<string>"),
            (r"std:thread:hardware_", "std::thread::hardware_concurrency();"),
            (r"\bendl\b", "endl;"),
            (r"\#illchide", "#include"),
            (r"Hineluda", "#include"),
            (r"<thread_", "<thread>"),
            (r"\#inclade", "#include"),
            (r"<tiule\.lv>", "<time.h>"),
            (r"\#indu5", "#include"),
            (r"Ilcpu", "//cpu"),
            (r"<estrean>", "<fstream>"),
            (r"Iogteal_cores", "logical_cores"),
            (r"std;;threadalardware_colcurrelcy\(\);", "std::thread::hardware_concurrency();"),
            (r"<wildowsh>", "<windows.h>"),
            (r"<stdlibh>", "<stdlib.h>"),
            (r"nanespace", "namespace"),
            (r"\b< <\b", "<<"),
            (r"\b< \b", "<< "),
            (r"\#inchude", "#include"),
            (r"std:;", "std;"),
            (r"uuoina", "using"),
            (r"pamespace", "namespace"),
            (r"\#incluide", "#include"),
            (r"\#bdlud", "#include"),
            (r"std:thread\-hardware_concurrencyO;", "std::thread::hardware_concurrency();"),
            (r"<tostream\?", "<iostream>"),
            (r"\#iulclude", "#include"),
            (r"<cbrono>", "<chrono>"),
            (r"coqt", "cout"),
            (r"<strdng>", "<string>"),
            (r"<tostrean>", "<iostream>"),
            (r"Jogtcal", "logical"),
            (r"<fstreal>", "<fstream>"),
            (r"\#idud", "#include"),
        ],
        "file_header": "",
    },

    "csharp": {
        "symbol_fixes": [
            (r'[{\[（]', '{'), (r'[}\]）]', '}'),
        ],
        "word_fixes": [
            (r'\bConsol[e3]\b',    'Console'),
            (r'\bWriteL[il]ne\b',  'WriteLine'),
            (r'\bWrite[l1]ine\b',  'WriteLine'),
            (r'\bname\s*space\b',  'namespace'),
            (r'\bpubl[il]c\b',     'public'),
            (r'\bstat[il]c\b',     'static'),
            (r'\bvoi\s*d\b',      'void'),
            (r'\bstr[il]ng\b',     'string'),
            (r'\bretum\b',        'return'),
            (r'\bMa[il]n\b',      'Main'),
        ],
        "file_header": "",
    },

    "java": {
        "symbol_fixes": [
            (r'[{\[（]', '{'), (r'[}\]）]', '}'),
        ],
        "word_fixes": [
            (r'\bSystem\s*\.\s*out\s*\.\s*pr[il]nt[l1]n\b', 'System.out.println'),
            (r'\bpubl[il]c\b',    'public'),
            (r'\bstat[il]c\b',    'static'),
            (r'\bvoi\s*d\b',     'void'),
            (r'\bstr[il]ng\b',    'String'),
            (r'\bretum\b',       'return'),
            (r'\bma[il]n\b',     'main'),
            (r'\bimpo[r]t\b',    'import'),
        ],
        "file_header": "",
    },

    "javascript": {
        "symbol_fixes": [
            (r'=>\s*',  '=> '),
        ],
        "word_fixes": [
            (r'\bconso[il]e\b',              'console'),
            (r'\bconsole\s*\.\s*[il]og\b',   'console.log'),
            (r'\bfunct[il]on\b',             'function'),
            (r'\bretum\b',                   'return'),
            (r'\btr[u]e\b',                  'true'),
            (r'\bfa[il]se\b',                'false'),
        ],
        "file_header": "",
    },

    "php": {
        "symbol_fixes": [
            (r'[{\[（]', '{'), (r'[}\]）]', '}'),
            (r'\$\s+(\w)',  r'$\1'),
        ],
        "word_fixes": [
            (r'\bech[o0]\b',     'echo'),
            (r'\bpr[il]nt\b',    'print'),
            (r'\bfunct[il]on\b', 'function'),
            (r'\bretum\b',       'return'),
            (r'\bnul[il]\b',     'null'),
            (r'\btr[u]e\b',      'true'),
            (r'\bfa[il]se\b',    'false'),
        ],
        "file_header": "<?php\n",
    },
}



# Structural fixers

def _fix_includes(code: str, language: str) -> str:
    if language in ("c", "cpp"):
        def _fix_line(m):
            h = re.sub(r'\s+', '', m.group(1).strip())
            if not (h.startswith('<') or h.startswith('"')):
                h = f'<{h}>'
            return f'#include {h}'
        code = re.sub(r'#\s*include\s+([^\n]+)', _fix_line, code)
        code = re.sub(r'#\s*include\s+([a-zA-Z][a-zA-Z0-9_.]*)\b', r'#include <\1>', code)
    elif language == "csharp":
        code = re.sub(r'us[il]ng\s+([A-Za-z.]+)\s*;', r'using \1;', code)
    elif language == "java":
        code = re.sub(r'[il]mport\s+([a-zA-Z][a-zA-Z0-9_.]+)\s*;', r'import \1;', code)
    return code


def _ensure_file_header(code: str, config: dict) -> str:
    header = config.get("file_header", "")
    if header and not code.startswith(header.strip()):
        code = header + code
    return code


def _fix_indentation(code: str) -> str:
    lines = code.split('\n')
    result, depth = [], 0
    for line in lines:
        stripped = line.strip()
        if not stripped:
            result.append('')
            continue
        if stripped.startswith('}'):
            depth = max(0, depth - 1)
        result.append('    ' * depth + stripped)
        depth += stripped.count('{') - stripped.count('}')
        depth = max(0, depth)
    return '\n'.join(result)


def _strip_markdown_fences(code: str) -> str:
    code = re.sub(r'^```[a-zA-Z]*\n?', '', code.strip())
    code = re.sub(r'\n?```$', '', code.strip())
    return code.strip()


def _ai_final_fix(code: str, language: str) -> str:
    """Optional AI cleanup pass — uses text model (not vision), runs after OCR."""
    lang_names = {
        "c": "C", "cpp": "C++", "csharp": "C#",
        "java": "Java", "javascript": "JavaScript",
        "php": "PHP", "go": "Go",
    }
    lang_label = lang_names.get(language, language)
    prompt = (
        f"The following is {lang_label} code extracted via OCR from a handwritten image. "
        f"Fix ALL syntax errors, OCR misreads, and formatting issues. "
        f"Return ONLY the corrected {lang_label} code — no explanation, no markdown fences:\n\n"
        + code
    )

    groq_key   = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    def _call_groq(p):
        import requests
        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile",
                  "messages": [{"role": "user", "content": p}],
                  "temperature": 0, "max_tokens": 2048}, timeout=30)
        return r.json()["choices"][0]["message"]["content"].strip()

    def _call_openai(p):
        import requests
        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
            json={"model": "gpt-4o-mini",
                  "messages": [{"role": "user", "content": p}],
                  "temperature": 0, "max_tokens": 2048}, timeout=30)
        return r.json()["choices"][0]["message"]["content"].strip()

    try:
        if groq_key:
            return _strip_markdown_fences(_call_groq(prompt))
        elif openai_key:
            return _strip_markdown_fences(_call_openai(prompt))
    except Exception as e:
        logger.warning(f"[AI final fix] {e}")

    return code


# Main pipeline

def postprocess_code(raw_text: str, language: str = "cpp") -> str:
    config = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["cpp"])
    code   = _strip_markdown_fences(raw_text)

    for pattern, repl in UNIVERSAL_FIXES:
        code = re.sub(pattern, repl, code)

    for pattern, repl in config.get("symbol_fixes", []):
        code = re.sub(pattern, repl, code)

    for pattern, repl in config.get("word_fixes", []):
        code = re.sub(pattern, repl, code, flags=re.IGNORECASE)

    code = _fix_includes(code, language)
    code = _ensure_file_header(code, config)
    code = _fix_indentation(code)
    code = _ai_final_fix(code, language)
    code = _strip_markdown_fences(code)

    return code.strip() + '\n'

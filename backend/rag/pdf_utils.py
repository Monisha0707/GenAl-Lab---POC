# backend/rag/pdf_utils.py
import fitz  # PyMuPDF

def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Accepts PDF bytes and returns a single string (all pages concatenated)
    and a list of per-page strings.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page in doc:
        text = page.get_text("text")
        pages.append(text)
    full_text = "\n\n".join(pages)
    return full_text, pages

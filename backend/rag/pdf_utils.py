import fitz  # PyMuPDF

def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Extract text from a PDF byte stream using PyMuPDF (fitz).
    """
    text = ""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text("text") or ""
    return text

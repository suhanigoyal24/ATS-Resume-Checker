import pdfplumber
from pathlib import Path
import pytest

# Resolve paths relative to THIS test file, not the terminal's CWD
TEST_DATA_DIR = Path(__file__).parent / "test_data"
SAMPLE_PDF = TEST_DATA_DIR / "sample_resume.pdf"

@pytest.fixture
def sample_pdf():
    if not SAMPLE_PDF.exists():
        pytest.fail(f"Missing test PDF. Place 'sample_resume.pdf' in:\n{TEST_DATA_DIR}")
    return SAMPLE_PDF

def test_extract_text_from_pdf(sample_pdf):
    with pdfplumber.open(sample_pdf) as pdf:
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        assert text is not None
        assert isinstance(text, str)
        assert len(text.strip()) > 0

def test_pdf_has_expected_metadata(sample_pdf):
    with pdfplumber.open(sample_pdf) as pdf:
        metadata = pdf.metadata
        assert metadata is not None  # pdfplumber returns dict or None
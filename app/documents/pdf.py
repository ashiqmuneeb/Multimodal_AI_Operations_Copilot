from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import pymupdf  # PyMuPDF
from app.observability.logging import get_logger

logger = get_logger(__name__)


class ExtractedPage:
    """Represents text and metadata extracted from a single PDF page."""
    def __init__(self, page_number: int, text: str, section_hint: Optional[str] = None):
        self.page_number = page_number
        self.text = text
        self.section_hint = section_hint

    def to_dict(self) -> Dict[str, Any]:
        return {
            "page_number": self.page_number,
            "text": self.text,
            "section_hint": self.section_hint
        }


class PDFProcessor:
    """Extracts page-by-page text, structural sections, and metadata from PDF manuals."""

    def extract_pdf(self, file_path: Path) -> Tuple[Dict[str, Any], List[ExtractedPage]]:
        """
        Parses a PDF file and returns document metadata and a list of ExtractedPage objects.
        """
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found at: {file_path}")

        try:
            doc = pymupdf.open(str(file_path))
        except Exception as e:
            logger.error(f"Failed to open PDF {file_path}: {e}")
            raise ValueError(f"Corrupted or invalid PDF file: {e}")

        total_pages = len(doc)
        metadata = {
            "filename": file_path.name,
            "total_pages": total_pages,
            "title": doc.metadata.get("title") or file_path.stem,
            "author": doc.metadata.get("author") or "Unknown"
        }

        pages: List[ExtractedPage] = []
        current_section = "General Overview"

        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_num = page_idx + 1
            raw_text = page.get_text("text")

            # Clean and normalize lines
            cleaned_lines = []
            for line in raw_text.splitlines():
                trimmed = line.strip()
                if not trimmed:
                    continue
                # Simple heading heuristic: short uppercase or numbered heading
                if len(trimmed) < 60 and (
                    trimmed.isupper()
                    or trimmed.startswith("Section")
                    or trimmed.startswith("CHAPTER")
                    or (trimmed[0].isdigit() and "." in trimmed[:4])
                ):
                    current_section = trimmed
                cleaned_lines.append(trimmed)

            page_text = "\n".join(cleaned_lines)
            pages.append(ExtractedPage(
                page_number=page_num,
                text=page_text,
                section_hint=current_section
            ))

        doc.close()
        logger.info(f"Extracted {len(pages)} pages from {file_path.name}")
        return metadata, pages


Tuple_Document_Data = tuple[Dict[str, Any], List[ExtractedPage]]

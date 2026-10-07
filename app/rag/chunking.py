import uuid
from typing import List, Dict, Any
from app.documents.pdf import ExtractedPage
from app.rag.schemas import DocumentChunk


class SectionChunker:
    """
    Chunks document text into semantic passages while strictly preserving 
    page numbers and section headers for accurate citation grounding.
    """

    def __init__(self, target_chunk_chars: int = 800, overlap_chars: int = 150):
        self.target_chunk_chars = target_chunk_chars
        self.overlap_chars = overlap_chars

    def chunk_document(
        self,
        document_id: str,
        filename: str,
        pages: List[ExtractedPage]
    ) -> List[DocumentChunk]:
        """
        Splits extracted pages into overlapping chunks, tracking exact provenance.
        """
        chunks: List[DocumentChunk] = []
        chunk_counter = 0

        for page in pages:
            text = page.text.strip()
            if not text:
                continue

            # If page text is within target size, keep as single chunk
            if len(text) <= self.target_chunk_chars:
                chunk_counter += 1
                chunks.append(DocumentChunk(
                    chunk_id=f"{document_id}_{chunk_counter}",
                    document_id=document_id,
                    filename=filename,
                    page_number=page.page_number,
                    section_hint=page.section_hint or "General",
                    chunk_index=chunk_counter,
                    text=text,
                    metadata={"char_count": len(text)}
                ))
                continue

            # Sliding window chunking with overlap for longer pages
            start = 0
            while start < len(text):
                end = min(start + self.target_chunk_chars, len(text))

                # Try to break cleanly at sentence or newline
                if end < len(text):
                    last_period = text.rfind(".", start + 200, end)
                    last_newline = text.rfind("\n", start + 200, end)
                    split_point = max(last_period, last_newline)
                    if split_point != -1:
                        end = split_point + 1

                chunk_text = text[start:end].strip()
                if chunk_text:
                    chunk_counter += 1
                    chunks.append(DocumentChunk(
                        chunk_id=f"{document_id}_{chunk_counter}",
                        document_id=document_id,
                        filename=filename,
                        page_number=page.page_number,
                        section_hint=page.section_hint or "General",
                        chunk_index=chunk_counter,
                        text=chunk_text,
                        metadata={"char_count": len(chunk_text)}
                    ))

                if end >= len(text):
                    break

                start = max(end - self.overlap_chars, start + 1)

        return chunks

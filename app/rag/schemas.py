from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    """Atomic text chunk preserving manual provenance and page citations."""
    chunk_id: str
    document_id: str
    filename: str
    page_number: int
    section_hint: str = "General"
    chunk_index: int
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentRecord(BaseModel):
    """Metadata tracking an uploaded and indexed maintenance document."""
    document_id: str
    filename: str
    total_pages: int
    total_chunks: int = 0
    is_indexed: bool = False
    storage_path: str
    created_at: str


class RAGSearchResult(BaseModel):
    """Single retrieved chunk with grounded citation and similarity score."""
    chunk_id: str
    document_id: str
    filename: str
    page_number: int
    section: str
    text: str
    similarity_score: float
    citation: str = Field(..., description="Standard citation format e.g. 'manual.pdf:p37'")


class SearchRequest(BaseModel):
    """Query payload for knowledge base search."""
    query: str = Field(..., min_length=2, description="Technician question or query symptom")
    top_k: int = Field(default=4, ge=1, le=20, description="Number of relevant chunks to retrieve")
    document_id: Optional[str] = Field(None, description="Optional filter to search specific manual only")


class SearchResponse(BaseModel):
    """Response containing retrieved excerpts and citations."""
    query: str
    total_found: int
    search_time_ms: float
    results: List[RAGSearchResult]

"""RAG package for document chunking, embeddings, and FAISS vector retrieval."""
from .schemas import DocumentChunk, DocumentRecord, RAGSearchResult, SearchRequest, SearchResponse
from .chunking import SectionChunker
from .embeddings import EmbeddingEngine
from .retriever import FAISSRetriever

__all__ = [
    "DocumentChunk",
    "DocumentRecord",
    "RAGSearchResult",
    "SearchRequest",
    "SearchResponse",
    "SectionChunker",
    "EmbeddingEngine",
    "FAISSRetriever"
]

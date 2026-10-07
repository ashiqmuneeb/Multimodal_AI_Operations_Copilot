import json
import time
from pathlib import Path
from typing import List, Dict, Optional, Any
import numpy as np
import faiss

from app.config import get_settings
from app.rag.schemas import DocumentChunk, DocumentRecord, RAGSearchResult
from app.rag.embeddings import EmbeddingEngine
from app.observability.logging import get_logger

logger = get_logger(__name__)


class FAISSRetriever:
    """
    Production-grade Vector Retrieval engine using FAISS and local embeddings.
    Provides semantic search, document filtering, and citation-grounded excerpts.
    """

    def __init__(self, store_dir: Optional[Path] = None):
        settings = get_settings()
        self.store_dir = store_dir or (settings.upload_path / "vector_store")
        self.store_dir.mkdir(parents=True, exist_ok=True)

        self.index_path = self.store_dir / "faiss.index"
        self.chunks_path = self.store_dir / "chunks.json"
        self.docs_registry_path = self.store_dir / "registry.json"

        self.embedder = EmbeddingEngine()
        self.dimension = self.embedder.dimension

        self.index: faiss.IndexFlatIP = faiss.IndexFlatIP(self.dimension)
        self.chunks: List[DocumentChunk] = []
        self.documents: Dict[str, DocumentRecord] = {}

        self._load_from_disk()

    def _load_from_disk(self):
        """Loads index and metadata from disk if available."""
        if self.index_path.exists() and self.chunks_path.exists():
            try:
                self.index = faiss.read_index(str(self.index_path))
                with open(self.chunks_path, "r", encoding="utf-8") as f:
                    raw_chunks = json.load(f)
                    self.chunks = [DocumentChunk.model_validate(c) for c in raw_chunks]
                logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors from {self.index_path}")
            except Exception as e:
                logger.error(f"Error loading existing index: {e}. Reinitializing empty index.")
                self.index = faiss.IndexFlatIP(self.dimension)
                self.chunks = []

        if self.docs_registry_path.exists():
            try:
                with open(self.docs_registry_path, "r", encoding="utf-8") as f:
                    raw_docs = json.load(f)
                    self.documents = {k: DocumentRecord.model_validate(v) for k, v in raw_docs.items()}
            except Exception as e:
                logger.error(f"Error loading document registry: {e}")
                self.documents = {}

    def _save_to_disk(self):
        """Persists current vector index and metadata state to disk."""
        try:
            faiss.write_index(self.index, str(self.index_path))
            with open(self.chunks_path, "w", encoding="utf-8") as f:
                json.dump([c.model_dump() for c in self.chunks], f, indent=2)
            with open(self.docs_registry_path, "w", encoding="utf-8") as f:
                json.dump({k: v.model_dump() for k, v in self.documents.items()}, f, indent=2)
            logger.info(f"Persisted vector store with {self.index.ntotal} chunks.")
        except Exception as e:
            logger.error(f"Failed to persist vector index to disk: {e}")

    def register_document(self, record: DocumentRecord):
        """Registers metadata for an uploaded document."""
        self.documents[record.document_id] = record
        self._save_to_disk()

    def list_documents(self) -> List[DocumentRecord]:
        """Returns all registered documents."""
        return list(self.documents.values())

    def index_document_chunks(self, document_id: str, new_chunks: List[DocumentChunk]) -> int:
        """
        Embeds and appends new document chunks to the FAISS index.
        """
        if not new_chunks:
            return 0

        texts = [c.text for c in new_chunks]
        embeddings = self.embedder.embed_texts(texts)

        # Normalize vectors for cosine similarity with IndexFlatIP
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        self.chunks.extend(new_chunks)

        # Update document record
        if document_id in self.documents:
            doc = self.documents[document_id]
            doc.total_chunks = len(new_chunks)
            doc.is_indexed = True

        self._save_to_disk()
        logger.info(f"Successfully indexed {len(new_chunks)} chunks for document {document_id}")
        return len(new_chunks)

    def search(
        self,
        query: str,
        top_k: int = 4,
        document_id: Optional[str] = None
    ) -> List[RAGSearchResult]:
        """
        Performs semantic search over indexed manuals, returning ranked results with citations.
        """
        if self.index.ntotal == 0 or not self.chunks:
            return []

        query_vec = self.embedder.embed_query(query)
        faiss.normalize_L2(query_vec)

        # Fetch candidates (broad pool if filtering by document_id)
        fetch_k = min(max(top_k * 20, 500), self.index.ntotal) if document_id else min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_vec, fetch_k)


        results: List[RAGSearchResult] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk = self.chunks[idx]

            # Filter by document_id if requested
            if document_id and chunk.document_id != document_id:
                continue

            # Grounded citation format: "manual_name.pdf:p37"
            citation = f"{chunk.filename}:p{chunk.page_number}"

            results.append(RAGSearchResult(
                chunk_id=chunk.chunk_id,
                document_id=chunk.document_id,
                filename=chunk.filename,
                page_number=chunk.page_number,
                section=chunk.section_hint,
                text=chunk.text,
                similarity_score=round(float(score), 4),
                citation=citation
            ))

            if len(results) >= top_k:
                break

        return results

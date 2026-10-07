import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status

from app.config import get_settings
from app.utils.file_handler import FileStorageService
from app.documents.pdf import PDFProcessor
from app.rag.schemas import DocumentRecord, SearchRequest, SearchResponse
from app.rag.chunking import SectionChunker
from app.rag.retriever import FAISSRetriever
from app.observability.logging import get_logger

logger = get_logger(__name__)


class DocumentService:
    """
    Enterprise Document & Technical Knowledge Service.
    Encapsulates PDF parsing, chunking, vector indexing, and citation search.
    Follows Hodoor Service-Layer pattern.
    """

    def __init__(self, retriever: Optional[FAISSRetriever] = None):
        self.settings = get_settings()
        self.storage = FileStorageService()
        self.processor = PDFProcessor()
        self.chunker = SectionChunker(
            chunk_size=self.settings.RAG_CHUNK_SIZE,
            chunk_overlap=self.settings.RAG_CHUNK_OVERLAP
        )
        self.retriever = retriever or FAISSRetriever()

    async def save_and_inspect_document(self, file: UploadFile) -> Tuple[DocumentRecord, Path]:
        """Validates, stores uploaded PDF, and extracts structural metadata."""
        if file.content_type != "application/pdf" and not (file.filename and file.filename.lower().endswith(".pdf")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents are supported for technical manual RAG."
            )

        file_id, file_path, _ = await self.storage.save_upload(file, subfolder="documents")

        try:
            metadata, pages = self.processor.extract_pdf(file_path)
        except Exception as e:
            logger.error(f"Error inspecting PDF {file.filename}: {e}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to parse uploaded PDF: {str(e)}"
            )

        record = DocumentRecord(
            document_id=file_id,
            filename=file.filename or "manual.pdf",
            total_pages=len(pages),
            total_chunks=0,
            is_indexed=False,
            storage_path=str(file_path),
            created_at=datetime.utcnow().isoformat()
        )
        return record, file_path

    async def index_document(self, document_id: str, file_path: Path, filename: str) -> DocumentRecord:
        """Parses, chunks, embeds, and registers PDF into FAISS vector index."""
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document file not found at {file_path}"
            )

        try:
            metadata, pages = self.processor.extract_pdf(file_path)
            chunks = self.chunker.chunk_pages(pages, document_id=document_id, source_name=filename)
            self.retriever.index_chunks(chunks)

            record = DocumentRecord(
                document_id=document_id,
                filename=filename,
                total_pages=len(pages),
                total_chunks=len(chunks),
                is_indexed=True,
                storage_path=str(file_path),
                created_at=datetime.utcnow().isoformat()
            )
            logger.info(f"Indexed document {filename} ({document_id}) with {len(chunks)} chunks.")
            return record
        except Exception as e:
            logger.error(f"Indexing failed for {document_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to index document: {str(e)}"
            )

    def search_knowledge_base(self, request: SearchRequest) -> SearchResponse:
        """Performs semantic search with ground citations."""
        t0 = time.perf_counter()
        results = self.retriever.search(
            query=request.query,
            top_k=request.top_k,
            document_id=request.document_id,
            score_threshold=request.score_threshold
        )
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        return SearchResponse(
            query=request.query,
            total_hits=len(results),
            results=results,
            latency_ms=latency_ms
        )

    def list_documents(self) -> List[DocumentRecord]:
        """Returns all documents indexed in the vector store."""
        docs_map = {}
        for chunk in self.retriever.chunks:
            doc_id = chunk.document_id
            if doc_id not in docs_map:
                docs_map[doc_id] = {
                    "document_id": doc_id,
                    "filename": chunk.source_name,
                    "max_page": chunk.page_number,
                    "chunk_count": 1
                }
            else:
                docs_map[doc_id]["chunk_count"] += 1
                if chunk.page_number > docs_map[doc_id]["max_page"]:
                    docs_map[doc_id]["max_page"] = chunk.page_number

        return [
            DocumentRecord(
                document_id=d["document_id"],
                filename=d["filename"],
                total_pages=d["max_page"],
                total_chunks=d["chunk_count"],
                is_indexed=True,
                storage_path="",
                created_at=datetime.utcnow().isoformat()
            )
            for d in docs_map.values()
        ]

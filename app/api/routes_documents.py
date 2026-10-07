import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends

from app.config import Settings, get_settings
from app.utils.file_handler import FileStorageService
from app.documents.pdf import PDFProcessor
from app.rag.schemas import DocumentRecord, SearchRequest, SearchResponse
from app.rag.chunking import SectionChunker
from app.rag.retriever import FAISSRetriever
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents & Knowledge RAG"])

# Singleton retriever instance
_retriever: Optional[FAISSRetriever] = None


def get_retriever() -> FAISSRetriever:
    global _retriever
    if _retriever is None:
        _retriever = FAISSRetriever()
    return _retriever


@router.post(
    "/upload",
    response_model=DocumentRecord,
    summary="Upload an equipment maintenance manual (PDF)"
)
async def upload_document(
    file: UploadFile = File(..., description="PDF maintenance manual or operational SOP"),
    settings: Settings = Depends(get_settings),
    retriever: FAISSRetriever = Depends(get_retriever)
):
    """
    Uploads a PDF manual, extracts document metadata, and registers it in the catalog.
    """
    if file.content_type != "application/pdf" and not (file.filename and file.filename.lower().endswith(".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are supported for technical manual RAG."
        )

    storage = FileStorageService()
    file_id, file_path, size_bytes = await storage.save_upload(file, subfolder="documents")

    # Read PDF metadata and page count
    processor = PDFProcessor()
    try:
        metadata, pages = processor.extract_pdf(file_path)
    except Exception as e:
        logger.error(f"Error inspecting PDF: {e}")
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

    retriever.register_document(record)
    return record


@router.get(
    "",
    response_model=List[DocumentRecord],
    summary="List all uploaded maintenance manuals"
)
async def list_documents(retriever: FAISSRetriever = Depends(get_retriever)):
    """Returns the list of uploaded and indexed maintenance manuals."""
    return retriever.list_documents()


@router.post(
    "/{document_id}/index",
    summary="Index document pages into the FAISS vector database"
)
async def index_document(
    document_id: str,
    retriever: FAISSRetriever = Depends(get_retriever)
):
    """
    Parses, chunks, embeds, and indexes an uploaded document into the FAISS vector store.
    """
    docs = {d.document_id: d for d in retriever.list_documents()}
    if document_id not in docs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    doc_record = docs[document_id]
    file_path = Path(doc_record.storage_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Underlying PDF file was removed from storage."
        )

    # Ingest pages
    processor = PDFProcessor()
    _, pages = processor.extract_pdf(file_path)

    # Chunk with section tracking
    chunker = SectionChunker(target_chunk_chars=800, overlap_chars=150)
    chunks = chunker.chunk_document(
        document_id=document_id,
        filename=doc_record.filename,
        pages=pages
    )

    # Embed and add to FAISS
    indexed_count = retriever.index_document_chunks(document_id, chunks)

    return {
        "success": True,
        "document_id": document_id,
        "filename": doc_record.filename,
        "total_pages": len(pages),
        "chunks_indexed": indexed_count,
        "status": "ready_for_search"
    }


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Semantic search over technical manuals returning grounded citations"
)
async def search_manuals(
    request: SearchRequest,
    retriever: FAISSRetriever = Depends(get_retriever)
):
    """
    Searches the FAISS vector store using semantic similarity, returning
    the most relevant manual sections along with citation metadata (e.g. manual.pdf:p37).
    """
    start_time = time.perf_counter()
    results = retriever.search(
        query=request.query,
        top_k=request.top_k,
        document_id=request.document_id
    )
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return SearchResponse(
        query=request.query,
        total_found=len(results),
        search_time_ms=duration_ms,
        results=results
    )

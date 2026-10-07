from typing import List, Optional
from app.rag.retriever import FAISSRetriever
from app.rag.schemas import RAGSearchResult
from app.observability.logging import get_logger

logger = get_logger(__name__)


class RAGTool:
    """Agent tool for searching indexed maintenance manuals and SOPs."""

    def __init__(self, retriever: FAISSRetriever):
        self.retriever = retriever

    @property
    def name(self) -> str:
        return "search_knowledge_base"

    @property
    def description(self) -> str:
        return "Searches technical equipment manuals for maintenance procedures, specifications, and troubleshooting steps."

    def execute(
        self,
        query: str,
        top_k: int = 4,
        document_id: Optional[str] = None
    ) -> List[RAGSearchResult]:
        logger.info(f"RAGTool executing search for query: '{query}' (top_k={top_k})")
        return self.retriever.search(query=query, top_k=top_k, document_id=document_id)

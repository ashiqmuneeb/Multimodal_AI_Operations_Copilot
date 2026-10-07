import time
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends

from app.config import Settings, get_settings
from app.utils.file_handler import FileStorageService
from app.agents.orchestrator import AgentOrchestrator
from app.agents.state import AgentState
from app.llm.base import MultimodalProvider
from app.llm.factory import get_multimodal_provider
from app.rag.retriever import FAISSRetriever
from app.api.routes_documents import get_retriever
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/agent", tags=["AI Operations Agent"])


@router.post(
    "/inspect",
    response_model=AgentState,
    summary="Run full end-to-end multimodal agentic inspection"
)
async def run_agent_inspection(
    user_request: str = Form(..., description="Technician field question or observed machine symptom"),
    file: Optional[UploadFile] = File(None, description="Optional machinery photo or frame"),
    document_id: Optional[str] = Form(None, description="Optional specific manual document ID"),
    client_id: Optional[str] = Form(None, description="Optional client ID for real-time WebSocket telemetry"),
    settings: Settings = Depends(get_settings),
    provider: MultimodalProvider = Depends(get_multimodal_provider),
    retriever: FAISSRetriever = Depends(get_retriever)
):
    """
    End-to-End Multimodal Agent Orchestration:
    1. Ingests technician symptom notes and optional equipment image.
    2. Vision Tool extracts structured non-diagnostic visual observations.
    3. RAG Tool cross-references observed symptoms against indexed maintenance manuals.
    4. Calculator Tool computes engineering differences/tolerances if applicable.
    5. Report Tool compiles an evidence-grounded operational report with exact citations.
    6. Returns complete auditable state machine with tool execution traces.
    """
    start_time = time.perf_counter()

    from app.services.websocket_service import get_websocket_service
    ws_service = get_websocket_service()
    if client_id:
        await ws_service.broadcast_to_client(client_id, "agent_step", {"message": "Agent analyzing symptoms & visual evidence..."})

    image_path: Optional[Path] = None
    image_filename: Optional[str] = None

    if file and file.filename:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{file.content_type}'. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
            )
        storage = FileStorageService()
        _, image_path, _ = await storage.save_upload(file, subfolder="images")
        image_filename = file.filename

    if client_id:
        await ws_service.broadcast_to_client(client_id, "agent_step", {"message": "Cross-referencing technical manual SOPs..."})

    orchestrator = AgentOrchestrator(provider=provider, retriever=retriever)
    agent_state = await orchestrator.run(
        user_request=user_request,
        image_path=image_path,
        image_filename=image_filename,
        document_id=document_id
    )

    if client_id:
        await ws_service.broadcast_to_client(client_id, "agent_step", {"message": "Final report generated with citations!"})

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"Agent inspection pipeline finished in {duration_ms}ms")
    return agent_state

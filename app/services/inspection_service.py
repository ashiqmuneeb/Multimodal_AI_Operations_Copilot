from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status

from app.config import get_settings
from app.utils.file_handler import FileStorageService
from app.agents.orchestrator import AgentOrchestrator
from app.agents.state import AgentState
from app.llm.base import MultimodalProvider
from app.vision.analyzer import ImageAnalyzer
from app.vision.schemas import InspectionResult
from app.services.websocket_service import get_websocket_service
from app.observability.logging import get_logger

logger = get_logger(__name__)


class InspectionService:
    """
    Enterprise Field Inspection & Agent Orchestration Service.
    Coordinates image preprocessing, multi-tool agent execution,
    and real-time WebSocket telemetry dispatches.
    """

    def __init__(self):
        self.settings = get_settings()
        self.storage = FileStorageService()
        self.analyzer = ImageAnalyzer(max_dimension=self.settings.VISION_MAX_IMAGE_DIMENSION)
        self.ws_service = get_websocket_service()

    async def save_image(self, file: UploadFile) -> tuple[str, Path, int]:
        """Validates and stores inspection photograph."""
        if file.content_type not in self.settings.ALLOWED_IMAGE_TYPES and not (
            file.filename and any(file.filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file.content_type}'. Allowed types: {self.settings.ALLOWED_IMAGE_TYPES}"
            )
        return await self.storage.save_upload(file, subfolder="images")

    async def run_single_vision_inspection(
        self,
        image_path: Path,
        provider: MultimodalProvider,
        notes: Optional[str] = None
    ) -> InspectionResult:
        """Preprocesses image and executes multimodal visual analysis."""
        with open(image_path, "rb") as f:
            raw_bytes = f.read()
        processed_bytes, _ = self.analyzer.preprocess_image(raw_bytes, filename=image_path.name)
        return await provider.analyze_image(
            image_bytes=processed_bytes,
            mime_type="image/jpeg",
            user_notes=notes or "Conduct visual inspection of machinery/equipment."
        )

    async def run_agent_orchestration(
        self,
        user_request: str,
        image_path: Optional[Path] = None,
        image_filename: Optional[str] = None,
        document_id: Optional[str] = None,
        provider: Optional[MultimodalProvider] = None,
        client_id: Optional[str] = None
    ) -> AgentState:
        """
        Orchestrates perception, RAG document search, tolerance calculations,
        and evidence-grounded report synthesis with real-time WebSocket telemetry.
        """
        if client_id:
            await self.ws_service.broadcast_to_client(
                client_id=client_id,
                event_type="agent_step",
                data={"step": "perception", "message": "Analyzing visual evidence..."}
            )

        orchestrator = AgentOrchestrator(provider=provider)

        try:
            state = await orchestrator.run(
                user_request=user_request,
                image_path=image_path,
                image_filename=image_filename,
                document_id=document_id
            )

            if client_id:
                await self.ws_service.broadcast_to_client(
                    client_id=client_id,
                    event_type="agent_completed",
                    data={
                        "step": "completed",
                        "summary": state.final_report.summary if state.final_report else "Inspection completed",
                        "tool_traces_count": len(state.tool_traces)
                    }
                )
            return state
        except Exception as e:
            logger.error(f"Agent Orchestrator failed in InspectionService: {e}", exc_info=True)
            if client_id:
                await self.ws_service.broadcast_to_client(
                    client_id=client_id,
                    event_type="agent_error",
                    data={"message": f"Agent reasoning failed: {str(e)}"}
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Agent reasoning failed: {str(e)}"
            )

from pathlib import Path
from typing import Optional, Callable
from fastapi import UploadFile, HTTPException, status

from app.config import get_settings
from app.utils.file_handler import FileStorageService
from app.video.pipeline import VideoOptimizationPipeline
from app.video.schemas import VideoInspectionResponse
from app.llm.base import MultimodalProvider
from app.services.websocket_service import get_websocket_service
from app.observability.logging import get_logger

logger = get_logger(__name__)


class VideoService:
    """
    Enterprise Video Processing & Multimodal Analysis Service.
    Coordinates keyframe extraction, blur filtering, deduplication,
    multimodal frame inference, and real-time WebSocket progress broadcasts.
    """

    def __init__(self):
        self.settings = get_settings()
        self.storage = FileStorageService()
        self.ws_service = get_websocket_service()
        self.pipeline = VideoOptimizationPipeline(
            sample_fps=self.settings.VIDEO_SAMPLE_FPS,
            blur_threshold=self.settings.VIDEO_BLUR_THRESHOLD,
            similarity_threshold=0.92
        )

    async def save_upload(self, file: UploadFile) -> tuple[str, Path, int]:
        """Validates and stores uploaded inspection video."""
        if file.content_type not in self.settings.ALLOWED_VIDEO_TYPES and not (
            file.filename and any(file.filename.lower().endswith(ext) for ext in [".mp4", ".mov", ".avi"])
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported video format '{file.content_type}'. Allowed types: {self.settings.ALLOWED_VIDEO_TYPES}"
            )
        return await self.storage.save_upload(file, subfolder="videos")

    async def inspect_video(
        self,
        video_path: Path,
        file_id: str,
        provider: MultimodalProvider,
        user_notes: Optional[str] = None,
        client_id: Optional[str] = None
    ) -> VideoInspectionResponse:
        """
        Executes optimization pipeline and dispatches real-time WebSocket progress events.
        """
        if client_id:
            await self.ws_service.broadcast_to_client(
                client_id=client_id,
                event_type="video_progress",
                data={"step": "sampling", "progress": 20, "message": "Downsampling video to 1 FPS..."}
            )

        try:
            response = await self.pipeline.process_video(
                video_path=video_path,
                file_id=file_id,
                provider=provider,
                user_notes=user_notes
            )

            if client_id:
                await self.ws_service.broadcast_to_client(
                    client_id=client_id,
                    event_type="video_completed",
                    data={
                        "step": "completed",
                        "progress": 100,
                        "keyframe_count": len(response.selected_keyframes),
                        "cost_savings": response.stats.cost_reduction_pct,
                        "summary": response.observations_summary
                    }
                )
            return response
        except Exception as e:
            logger.error(f"Error in VideoService.inspect_video: {e}", exc_info=True)
            if client_id:
                await self.ws_service.broadcast_to_client(
                    client_id=client_id,
                    event_type="video_error",
                    data={"message": f"Processing failed: {str(e)}"}
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Video optimization pipeline failed: {str(e)}"
            )

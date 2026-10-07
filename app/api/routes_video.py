from typing import Optional
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends

from app.config import Settings, get_settings
from app.utils.file_handler import FileStorageService
from app.video.pipeline import VideoOptimizationPipeline
from app.video.schemas import VideoInspectionResponse
from app.llm.base import MultimodalProvider
from app.llm.factory import get_multimodal_provider
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/video", tags=["Smart Video Inspection"])


@router.post(
    "/inspect",
    response_model=VideoInspectionResponse,
    summary="Upload and optimize operational machine video for multimodal inspection"
)
async def inspect_machine_video(
    file: UploadFile = File(..., description="Machine inspection video file (MP4, MOV, AVI)"),
    notes: Optional[str] = Form(None, description="Optional technician symptoms or observation notes"),
    client_id: Optional[str] = Form(None, description="Optional client ID for real-time WebSocket telemetry"),
    settings: Settings = Depends(get_settings),
    provider: MultimodalProvider = Depends(get_multimodal_provider)
):
    """
    Smart Video Inspection Endpoint:
    1. Enforces upload size (<= 50MB) and format boundaries.
    2. Samples video at 1 FPS.
    3. Runs Laplacian variance quality filter to drop blurry/unfocused frames.
    4. Computes 3D color histogram correlation to discard near-duplicates.
    5. Submits only distinct, high-value keyframes to the Multimodal Vision Model.
    6. Returns frame-level telemetry, keyframe URLs, and temporal inspection report.
    """
    if file.content_type not in settings.ALLOWED_VIDEO_TYPES and not (
        file.filename and any(file.filename.lower().endswith(ext) for ext in [".mp4", ".mov", ".avi"])
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video format '{file.content_type}'. Allowed types: {settings.ALLOWED_VIDEO_TYPES}"
        )

    storage = FileStorageService()
    file_id, video_path, size_bytes = await storage.save_upload(file, subfolder="videos")

    from app.services.websocket_service import get_websocket_service
    ws_service = get_websocket_service()
    if client_id:
        await ws_service.broadcast_to_client(client_id, "video_progress", {"message": "Sampling video at 1 FPS..."})

    pipeline = VideoOptimizationPipeline(
        sample_fps=settings.VIDEO_SAMPLE_FPS,
        blur_threshold=settings.VIDEO_BLUR_THRESHOLD,
        similarity_threshold=0.92
    )

    try:
        response = await pipeline.process_video(
            video_path=video_path,
            file_id=file_id,
            provider=provider,
            user_notes=notes,
            original_filename=file.filename
        )
        if client_id:
            await ws_service.broadcast_to_client(client_id, "video_progress", {"message": "Inference complete!"})
        return response
    except ValueError as ve:
        logger.warning(f"Video validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Video processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process video: {str(e)}"
        )

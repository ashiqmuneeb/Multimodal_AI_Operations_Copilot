import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from app.config import Settings, get_settings
from app.utils.file_handler import FileStorageService
from app.vision.analyzer import ImageAnalyzer
from app.vision.schemas import ImageAnalysisResponse, InspectionResult
from app.llm.base import MultimodalProvider
from app.llm.factory import get_multimodal_provider
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/vision", tags=["Vision Inspection"])


@router.post(
    "/analyze",
    response_model=ImageAnalysisResponse,
    summary="Upload and inspect machinery/equipment image"
)
async def analyze_equipment_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WEBP) of equipment or component"),
    notes: Optional[str] = Form(None, description="Optional technician notes or observations"),
    settings: Settings = Depends(get_settings),
    provider: MultimodalProvider = Depends(get_multimodal_provider)
):
    """
    Multimodal Vision Inspection Endpoint:
    1. Validates file type and size boundaries.
    2. Securely saves the uploaded image.
    3. Preprocesses and normalizes image orientation/resolution.
    4. Submits to Multimodal Provider (Gemini / Local).
    5. Returns Pydantic-validated structured observations, possible causes, and checks.
    """
    start_time = time.perf_counter()

    # Verify content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type '{file.content_type}'. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
        )

    storage = FileStorageService()
    file_id, file_path, size_bytes = await storage.save_upload(file, subfolder="images")

    # Read bytes for preprocessing
    with open(file_path, "rb") as f:
        raw_bytes = f.read()

    analyzer = ImageAnalyzer()
    try:
        processed_bytes, meta = analyzer.preprocess_image(raw_bytes, filename=file.filename or "")
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to process image data: {str(e)}"
        )

    # Perform Multimodal Inference
    try:
        inspection_result: InspectionResult = await provider.analyze_image(
            image_bytes=processed_bytes,
            mime_type="image/jpeg",
            user_notes=notes
        )
    except Exception as e:
        logger.error(f"Multimodal inference failed via {provider.provider_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Vision model inference failed: {str(e)}"
        )

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return ImageAnalysisResponse(
        success=True,
        image_filename=file.filename or "uploaded_image.jpg",
        file_id=file_id,
        processing_time_ms=duration_ms,
        provider_used=provider.provider_name,
        result=inspection_result
    )

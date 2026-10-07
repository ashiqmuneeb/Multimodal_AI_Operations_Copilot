from pathlib import Path
from typing import Optional
from app.vision.analyzer import ImageAnalyzer
from app.vision.schemas import InspectionResult
from app.llm.base import MultimodalProvider
from app.observability.logging import get_logger

logger = get_logger(__name__)


class VisionTool:
    """Agent tool for analyzing equipment images and extracting structured visual observations."""

    def __init__(self, provider: MultimodalProvider):
        self.provider = provider
        self.analyzer = ImageAnalyzer()

    @property
    def name(self) -> str:
        return "analyze_image"

    @property
    def description(self) -> str:
        return "Inspects an equipment image to identify visible anomalies, components, and conditions."

    async def execute(self, image_path: Path, user_notes: Optional[str] = None) -> InspectionResult:
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found at {image_path}")

        with open(image_path, "rb") as f:
            raw_bytes = f.read()

        processed_bytes, _ = self.analyzer.preprocess_image(raw_bytes, filename=image_path.name)
        result = await self.provider.analyze_image(
            image_bytes=processed_bytes,
            mime_type="image/jpeg",
            user_notes=user_notes
        )
        return result

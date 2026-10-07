from pathlib import Path
from typing import Optional
from app.video.pipeline import VideoOptimizationPipeline
from app.video.schemas import VideoInspectionResponse
from app.llm.base import MultimodalProvider
from app.observability.logging import get_logger

logger = get_logger(__name__)


class VideoTool:
    """Agent tool for sampling, filtering, and analyzing equipment videos."""

    def __init__(self, provider: MultimodalProvider):
        self.provider = provider
        self.pipeline = VideoOptimizationPipeline()

    @property
    def name(self) -> str:
        return "analyze_video"

    @property
    def description(self) -> str:
        return "Extracts keyframes from equipment video, filters blur and duplicates, and detects temporal anomalies."

    async def execute(
        self,
        video_path: Path,
        file_id: str,
        user_notes: Optional[str] = None
    ) -> VideoInspectionResponse:
        logger.info(f"VideoTool executing on {video_path}")
        return await self.pipeline.process_video(
            video_path=video_path,
            file_id=file_id,
            provider=self.provider,
            user_notes=user_notes
        )

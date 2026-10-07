from typing import List, Optional
from pydantic import BaseModel, Field
from app.vision.schemas import InspectionResult


class FrameMetadata(BaseModel):
    """Metadata for an individual sampled video frame."""
    frame_index: int
    timestamp_sec: float
    blur_score: float = Field(..., description="Laplacian variance score. Higher means sharper.")
    is_blurry: bool
    is_duplicate: bool
    similarity_to_prev: Optional[float] = Field(None, description="Correlation to previous keyframe (0.0 to 1.0)")
    keyframe_url: Optional[str] = None


class VideoProcessingStats(BaseModel):
    """Telemetry metrics tracking frame reduction and inference cost savings."""
    video_duration_sec: float
    original_fps: float
    total_frames_sampled: int
    frames_discarded_blurry: int
    frames_discarded_duplicate: int
    useful_keyframes_count: int
    inference_reduction_pct: float = Field(
        ...,
        description="Percentage of frames filtered out before LLM multimodal inference"
    )


class VideoInspectionResponse(BaseModel):
    """API response envelope for smart video inspection."""
    video_filename: str
    file_id: str
    stats: VideoProcessingStats
    keyframes: List[FrameMetadata]
    inspection_result: InspectionResult
    processing_time_ms: float

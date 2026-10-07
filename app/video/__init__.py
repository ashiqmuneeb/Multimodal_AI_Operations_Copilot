"""Video processing and optimization package."""
from .schemas import FrameMetadata, VideoProcessingStats, VideoInspectionResponse
from .sampler import VideoSampler, SampledFrame
from .quality_filter import QualityFilter
from .deduplicator import Deduplicator
from .pipeline import VideoOptimizationPipeline

__all__ = [
    "FrameMetadata",
    "VideoProcessingStats",
    "VideoInspectionResponse",
    "VideoSampler",
    "SampledFrame",
    "QualityFilter",
    "Deduplicator",
    "VideoOptimizationPipeline"
]

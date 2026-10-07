from pathlib import Path
from typing import List, Tuple, Dict, Any
import cv2
import numpy as np
from app.config import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)


class SampledFrame:
    """Container for a raw sampled video frame with timestamp."""
    def __init__(self, frame_index: int, timestamp_sec: float, image_bgr: np.ndarray):
        self.frame_index = frame_index
        self.timestamp_sec = timestamp_sec
        self.image_bgr = image_bgr


class VideoSampler:
    """Extracts frames at a controlled sampling rate (default 1 FPS) from operational videos."""

    def __init__(self, sample_fps: int = 1, max_duration_sec: int = 60):
        self.sample_fps = sample_fps
        self.max_duration_sec = max_duration_sec

    def sample_video(self, video_path: Path) -> Tuple[Dict[str, Any], List[SampledFrame]]:
        """
        Validates video duration and extracts frames evenly at sample_fps rate.
        Returns: (video_metadata, list_of_sampled_frames)
        """
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"OpenCV could not open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = round(total_frames / fps, 2)

        if duration_sec > self.max_duration_sec:
            cap.release()
            raise ValueError(
                f"Video duration ({duration_sec}s) exceeds maximum permitted limit of {self.max_duration_sec}s."
            )

        metadata = {
            "duration_sec": duration_sec,
            "fps": fps,
            "total_frames": total_frames,
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        }

        # Calculate frame step interval (e.g., 30 FPS / 1 sample_fps = every 30th frame)
        frame_interval = max(1, int(round(fps / self.sample_fps)))
        sampled_frames: List[SampledFrame] = []

        current_frame_idx = 0
        while cap.isOpened() and current_frame_idx < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame_idx)
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            timestamp_sec = round(current_frame_idx / fps, 2)
            sampled_frames.append(SampledFrame(
                frame_index=current_frame_idx,
                timestamp_sec=timestamp_sec,
                image_bgr=frame
            ))

            current_frame_idx += frame_interval

        cap.release()
        logger.info(
            f"Sampled {len(sampled_frames)} frames from {video_path.name} "
            f"({duration_sec}s at {self.sample_fps} FPS, original {fps:.1f} FPS)"
        )
        return metadata, sampled_frames

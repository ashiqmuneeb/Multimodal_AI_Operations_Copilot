import time
from pathlib import Path
from typing import List, Tuple, Optional
import cv2
import numpy as np

from app.config import get_settings
from app.video.sampler import VideoSampler, SampledFrame
from app.video.quality_filter import QualityFilter
from app.video.deduplicator import Deduplicator
from app.video.schemas import FrameMetadata, VideoProcessingStats, VideoInspectionResponse
from app.vision.schemas import InspectionResult
from app.llm.base import MultimodalProvider
from app.observability.logging import get_logger

logger = get_logger(__name__)


class VideoOptimizationPipeline:
    """
    End-to-End Smart Video Optimization Pipeline:
    1. Samples video at 1 FPS.
    2. Drops blurry frames via Laplacian variance.
    3. Drops static/near-duplicate frames via histogram correlation.
    4. Submits only high-value, distinct keyframes to Multimodal Provider.
    """

    def __init__(
        self,
        sample_fps: int = 1,
        blur_threshold: float = 100.0,
        similarity_threshold: float = 0.92,
        keyframe_dir: Optional[Path] = None
    ):
        settings = get_settings()
        self.sampler = VideoSampler(sample_fps=sample_fps, max_duration_sec=settings.VIDEO_MAX_DURATION_SEC)
        self.quality_filter = QualityFilter(blur_threshold=blur_threshold)
        self.deduplicator = Deduplicator(similarity_threshold=similarity_threshold)
        self.keyframe_dir = keyframe_dir or (settings.upload_path / "videos" / "keyframes")
        self.keyframe_dir.mkdir(parents=True, exist_ok=True)

    async def process_video(
        self,
        video_path: Path,
        file_id: str,
        provider: MultimodalProvider,
        user_notes: Optional[str] = None,
        original_filename: Optional[str] = None
    ) -> VideoInspectionResponse:
        start_time = time.perf_counter()
        display_name = original_filename or video_path.name

        # Step 1: Sample frames at target FPS
        meta, sampled_frames = self.sampler.sample_video(video_path)

        # Step 2: Quality Filtering & Deduplication
        frame_metas: List[FrameMetadata] = []
        useful_frames_bgr: List[np.ndarray] = []
        useful_frames_bytes: List[bytes] = []
        last_accepted_hist = None

        blurry_count = 0
        duplicate_count = 0

        for sf in sampled_frames:
            # Check blur
            blur_score, is_blurry = self.quality_filter.evaluate_blur(sf.image_bgr)
            if is_blurry:
                blurry_count += 1
                frame_metas.append(FrameMetadata(
                    frame_index=sf.frame_index,
                    timestamp_sec=sf.timestamp_sec,
                    blur_score=blur_score,
                    is_blurry=True,
                    is_duplicate=False,
                    similarity_to_prev=None
                ))
                continue

            # Check duplicate against last accepted keyframe
            current_hist = self.deduplicator.compute_histogram(sf.image_bgr)
            sim_score, is_duplicate = self.deduplicator.compare_frames(current_hist, last_accepted_hist)

            if is_duplicate:
                duplicate_count += 1
                frame_metas.append(FrameMetadata(
                    frame_index=sf.frame_index,
                    timestamp_sec=sf.timestamp_sec,
                    blur_score=blur_score,
                    is_blurry=False,
                    is_duplicate=True,
                    similarity_to_prev=sim_score
                ))
                continue

            # Accepted Keyframe
            last_accepted_hist = current_hist
            useful_frames_bgr.append(sf.image_bgr)

            # Save keyframe image to disk
            keyframe_name = f"{file_id}_f{sf.frame_index}.jpg"
            keyframe_path = self.keyframe_dir / keyframe_name
            cv2.imwrite(str(keyframe_path), sf.image_bgr)

            # Encode to JPEG bytes for multimodal inference
            ret, buf = cv2.imencode(".jpg", sf.image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            frame_bytes = buf.tobytes() if ret else b""
            useful_frames_bytes.append(frame_bytes)

            frame_metas.append(FrameMetadata(
                frame_index=sf.frame_index,
                timestamp_sec=sf.timestamp_sec,
                blur_score=blur_score,
                is_blurry=False,
                is_duplicate=False,
                similarity_to_prev=sim_score,
                keyframe_url=f"/static/uploads/videos/keyframes/{keyframe_name}"
            ))

        # Graceful rescue: If all frames were discarded, rescue the sharpest sampled frame
        if not useful_frames_bytes and sampled_frames:
            best_idx = 0
            best_score = -1.0
            for idx, fm in enumerate(frame_metas):
                if fm.blur_score > best_score:
                    best_score = fm.blur_score
                    best_idx = idx

            sf = sampled_frames[best_idx]
            keyframe_name = f"{file_id}_f{sf.frame_index}.jpg"
            keyframe_path = self.keyframe_dir / keyframe_name
            cv2.imwrite(str(keyframe_path), sf.image_bgr)
            ret, buf = cv2.imencode(".jpg", sf.image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            if ret:
                useful_frames_bytes.append(buf.tobytes())
                frame_metas[best_idx].is_blurry = False
                frame_metas[best_idx].is_duplicate = False
                frame_metas[best_idx].keyframe_url = f"/static/uploads/videos/keyframes/{keyframe_name}"
                if blurry_count > 0:
                    blurry_count -= 1

        total_sampled = len(sampled_frames)
        useful_count = len(useful_frames_bytes)
        discarded_total = max(0, total_sampled - useful_count)
        reduction_pct = round((discarded_total / total_sampled * 100) if total_sampled > 0 else 0.0, 1)

        stats = VideoProcessingStats(
            video_duration_sec=meta["duration_sec"],
            original_fps=meta["fps"],
            total_frames_sampled=total_sampled,
            frames_discarded_blurry=blurry_count,
            frames_discarded_duplicate=duplicate_count,
            useful_keyframes_count=useful_count,
            inference_reduction_pct=reduction_pct
        )

        logger.info(
            f"Video optimization finished: {total_sampled} sampled -> {useful_count} keyframes "
            f"({reduction_pct}% inference reduction)"
        )

        # Step 3: Multimodal Vision-Language Inference on Keyframes
        inspection_result = await provider.analyze_frames(
            frames=useful_frames_bytes,
            user_notes=user_notes
        )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return VideoInspectionResponse(
            video_filename=display_name,
            file_id=file_id,
            stats=stats,
            keyframes=frame_metas,
            inspection_result=inspection_result,
            processing_time_ms=duration_ms
        )

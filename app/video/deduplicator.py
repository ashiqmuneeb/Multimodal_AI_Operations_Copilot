from typing import Tuple, Optional
import cv2
import numpy as np
from app.observability.logging import get_logger

logger = get_logger(__name__)


class Deduplicator:
    """
    Detects and eliminates near-duplicate frames using 3D color histogram correlation.
    Reduces redundant LLM inference when the camera is stationary and scene is static.
    """

    def __init__(self, similarity_threshold: float = 0.92):
        self.similarity_threshold = similarity_threshold

    def compute_histogram(self, frame_bgr: np.ndarray) -> np.ndarray:
        """Computes a normalized 3D color histogram for fast structural comparison."""
        # 8 bins per BGR channel = 512-dim compact representation
        hist = cv2.calcHist([frame_bgr], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        return hist

    def compare_frames(
        self,
        current_hist: np.ndarray,
        previous_hist: Optional[np.ndarray]
    ) -> Tuple[Optional[float], bool]:
        """
        Calculates correlation between two frame histograms.
        Returns: (similarity_score, is_duplicate)
        """
        if previous_hist is None:
            # First keyframe is always kept
            return None, False

        # cv2.HISTCMP_CORREL ranges from -1.0 to 1.0 (1.0 = identical)
        similarity = float(cv2.compareHist(previous_hist, current_hist, cv2.HISTCMP_CORREL))
        is_duplicate = similarity >= self.similarity_threshold

        return round(similarity, 4), is_duplicate

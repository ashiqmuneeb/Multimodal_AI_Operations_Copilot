from typing import Tuple
import cv2
import numpy as np
from app.observability.logging import get_logger

logger = get_logger(__name__)


class QualityFilter:
    """
    Computes Laplacian variance on video frames to detect and discard motion blur
    and out-of-focus frames before submitting to multimodal models.
    """

    def __init__(self, blur_threshold: float = 100.0):
        self.blur_threshold = blur_threshold

    def evaluate_blur(self, frame_bgr: np.ndarray) -> Tuple[float, bool]:
        """
        Calculates the variance of the Laplacian filter.
        Returns: (blur_score, is_blurry)
        """
        if frame_bgr is None or frame_bgr.size == 0:
            return 0.0, True

        # Convert to grayscale
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

        # Compute the Laplacian of the image and return the focus measure (variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < self.blur_threshold

        return round(laplacian_var, 2), is_blurry

import io
from pathlib import Path
from typing import Tuple, Dict, Any
from PIL import Image, ImageOps
from app.observability.logging import get_logger

logger = get_logger(__name__)


class ImageAnalyzer:
    """Preprocesses and extracts metadata from inspection images prior to LLM submission."""

    def __init__(self, max_dimension: int = 1600):
        self.max_dimension = max_dimension

    def preprocess_image(self, file_bytes: bytes, filename: str = "") -> Tuple[bytes, Dict[str, Any]]:
        """
        Validates, corrects orientation, optionally resizes large images to conserve tokens/bandwidth,
        and extracts key metadata.
        """
        try:
            image = Image.open(io.BytesIO(file_bytes))
            # Auto-orient based on EXIF tag if available
            image = ImageOps.exif_transpose(image)
        except Exception as e:
            logger.error(f"Failed to decode image {filename}: {e}")
            raise ValueError(f"Invalid image content: {e}")

        orig_width, orig_height = image.size
        orig_format = image.format or "JPEG"

        # Resize if dimensions exceed threshold
        resized = False
        if max(orig_width, orig_height) > self.max_dimension:
            scale = self.max_dimension / float(max(orig_width, orig_height))
            new_size = (int(orig_width * scale), int(orig_height * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            resized = True
            logger.info(f"Image {filename} resized from ({orig_width}, {orig_height}) to {new_size}")

        # Convert RGBA to RGB for standard JPEG/PNG
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        output_buffer = io.BytesIO()
        image.save(output_buffer, format="JPEG", quality=90)
        processed_bytes = output_buffer.getvalue()

        metadata = {
            "original_dimensions": (orig_width, orig_height),
            "final_dimensions": image.size,
            "was_resized": resized,
            "original_format": orig_format,
            "size_bytes": len(processed_bytes)
        }

        return processed_bytes, metadata

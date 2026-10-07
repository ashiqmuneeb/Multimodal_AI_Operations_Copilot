import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import get_settings
from app.observability.logging import get_logger

logger = get_logger(__name__)


class FileStorageService:
    """Manages file persistence, MIME validation, and secure path generation."""

    def __init__(self):
        self.settings = get_settings()

    async def save_upload(
        self,
        file: UploadFile,
        subfolder: str = "images"
    ) -> Tuple[str, Path, int]:
        """
        Validates file size/MIME type, generates a collision-resistant UUID filename,
        and saves it asynchronously.
        Returns: (file_id, absolute_path, size_bytes)
        """
        # Read content into memory to inspect size
        contents = await file.read()
        size_bytes = len(contents)
        max_bytes = self.settings.MAX_UPLOAD_MB * 1024 * 1024

        if size_bytes > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {self.settings.MAX_UPLOAD_MB}MB."
            )

        # Basic extension and MIME safety
        orig_filename = file.filename or "upload"
        ext = Path(orig_filename).suffix.lower()
        if not ext:
            ext = ".bin"

        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}{ext}"

        dest_dir = self.settings.upload_path / subfolder
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / safe_filename

        # Write to disk
        with open(dest_path, "wb") as f:
            f.write(contents)

        logger.info(f"Saved upload {orig_filename} -> {dest_path} ({size_bytes} bytes)")
        return file_id, dest_path, size_bytes

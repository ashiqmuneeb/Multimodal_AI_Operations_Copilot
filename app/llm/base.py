from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.vision.schemas import InspectionResult


class MultimodalProvider(ABC):
    """Abstract Base Class for Multimodal LLM Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Identifier for the provider (e.g., 'gemini', 'mock', 'local')."""
        pass

    @abstractmethod
    async def generate_text(self, prompt: str, context: Optional[str] = None) -> str:
        """Generate textual completion given an optional grounding context."""
        pass

    @abstractmethod
    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        """
        Analyze an inspection image and return structured Pydantic InspectionResult.
        Adheres to strict observation vs diagnosis boundaries.
        """
        pass

    @abstractmethod
    async def analyze_frames(
        self,
        frames: List[bytes],
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        """Analyze sampled video frames and generate temporal inspection findings."""
        pass

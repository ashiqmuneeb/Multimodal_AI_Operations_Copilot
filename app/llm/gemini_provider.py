import json
import re
from typing import List, Optional
import google.generativeai as genai
from PIL import Image
import io

from app.llm.base import MultimodalProvider
from app.vision.schemas import InspectionResult
from app.observability.logging import get_logger

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are an expert Industrial & Facilities AI Operations Copilot.
Your job is to inspect machinery, tools, electrical cabinets, mechanical assemblies, and operational equipment.

CRITICAL SAFETY & RELIABILITY RULES:
1. STRICTLY SEPARATE VISUAL OBSERVATIONS FROM FINAL DIAGNOSES.
   - Use 'visible indication', 'appears offset', 'possible surface discoloration', etc.
   - Never declare a confirmed mechanical failure without physical internal evidence.
2. List detected machinery objects and components.
3. Provide actionable physical checks for the on-site technician.
4. Always state explicit limitations (e.g., visual inspection cannot determine internal bearing tolerance).
5. You MUST return ONLY valid JSON matching this exact structure:
{
  "device_or_machinery_type": "string or null",
  "objects": ["component1", "component2"],
  "observations": [
    {
      "text": "description of visible condition",
      "confidence": 0.85,
      "location_hint": "center / top-left / etc",
      "severity": "informational" | "low" | "medium" | "high" | "critical"
    }
  ],
  "possible_causes": ["potential cause 1", "potential cause 2"],
  "recommended_checks": ["step 1 for technician", "step 2 for technician"],
  "limitations": ["limitation 1", "limitation 2"]
}
"""


class GeminiProvider(MultimodalProvider):
    """Google Gemini 1.5 / 2.0 Flash implementation."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please obtain a free key from https://aistudio.google.com/ "
                "and set it in your .env file, or configure LLM_PROVIDER=mock for offline testing."
            )
        self.api_key = api_key
        self.model_name = model_name
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=SYSTEM_PROMPT
        )
        logger.info(f"Initialized GeminiProvider using model '{self.model_name}'")

    @property
    def provider_name(self) -> str:
        return f"gemini ({self.model_name})"

    async def generate_text(self, prompt: str, context: Optional[str] = None) -> str:
        full_prompt = prompt
        if context:
            full_prompt = f"Context:\n{context}\n\nTask:\n{prompt}"

        # Async generation in Gemini SDK
        response = await self.model.generate_content_async(full_prompt)
        return response.text

    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        pil_image = Image.open(io.BytesIO(image_bytes))

        prompt_text = "Perform a thorough visual equipment inspection on this image."
        if user_notes:
            prompt_text += f"\nTechnician Operator Notes: '{user_notes}'"

        contents = [prompt_text, pil_image]

        logger.info(f"Sending image to {self.model_name} for multimodal inspection...")
        response = await self.model.generate_content_async(
            contents=contents,
            generation_config={"response_mime_type": "application/json"}
        )

        raw_text = response.text.strip()
        # Clean any markdown codefence wrapping if present
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed_data = json.loads(raw_text)
        validated_result = InspectionResult.model_validate(parsed_data)
        logger.info(
            f"Successfully validated inspection: {len(validated_result.observations)} observations, "
            f"{len(validated_result.objects)} objects"
        )
        return validated_result

    async def analyze_frames(
        self,
        frames: List[bytes],
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        pil_frames = [Image.open(io.BytesIO(fb)) for fb in frames]

        prompt_text = (
            f"Here are {len(frames)} chronologically ordered keyframes extracted from an operational video. "
            "Analyze the machine's condition across these keyframes, identifying any motion anomalies, "
            "vibrations, smoke, alignment drift, or physical damage."
        )
        if user_notes:
            prompt_text += f"\nTechnician Operator Notes: '{user_notes}'"

        contents = [prompt_text] + pil_frames
        logger.info(f"Sending {len(frames)} keyframes to {self.model_name}...")

        response = await self.model.generate_content_async(
            contents=contents,
            generation_config={"response_mime_type": "application/json"}
        )

        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed_data = json.loads(raw_text)
        return InspectionResult.model_validate(parsed_data)

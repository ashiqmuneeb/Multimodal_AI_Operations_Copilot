from typing import List, Optional
from app.llm.base import MultimodalProvider
from app.vision.schemas import InspectionResult, VisualObservation


class MockProvider(MultimodalProvider):
    """
    Deterministic Mock Provider for unit testing, offline development,
    and fast CI without requiring API keys or incurring costs.
    """

    @property
    def provider_name(self) -> str:
        return "mock-offline-provider"

    async def generate_text(self, prompt: str, context: Optional[str] = None) -> str:
        return f"[Mock Response] Analyzed request with {len(context or '')} chars context."

    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        note_text = f" (User noted: '{user_notes}')" if user_notes else ""
        return InspectionResult(
            device_or_machinery_type="Industrial Centrifugal Pump / Motor Assembly",
            objects=["electric motor", "drive pulley", "V-belt", "mounting bracket", "pressure gauge"],
            observations=[
                VisualObservation(
                    text="Drive belt shows visible lateral slack and slight offset from primary pulley track." + note_text,
                    confidence=0.89,
                    location_hint="center-left drive assembly",
                    severity="medium"
                ),
                VisualObservation(
                    text="Minor lubricant/fluid residue observed around lower mounting flange seal.",
                    confidence=0.78,
                    location_hint="lower casing bottom flange",
                    severity="low"
                )
            ],
            possible_causes=[
                "Drive belt tension loss or uneven wear on pulley groove.",
                "Primary seal degradation due to prolonged vibration."
            ],
            recommended_checks=[
                "Verify belt deflection with tension gauge per OEM specification.",
                "Inspect lower mounting bolts for specified torque rating (approx 45 Nm).",
                "Check bearing temperature using infrared thermometer after 15 mins run."
            ],
            limitations=[
                "Visual inspection cannot detect internal rotor unbalance or bearing race micro-cracks.",
                "Ensure machine lock-out/tag-out (LOTO) is completed before manual belt deflection test."
            ]
        )

    async def analyze_frames(
        self,
        frames: List[bytes],
        user_notes: Optional[str] = None
    ) -> InspectionResult:
        return InspectionResult(
            device_or_machinery_type="Conveyor Drive Roller Assembly",
            objects=["conveyor belt", "idler roller", "drive motor", "safety guard"],
            observations=[
                VisualObservation(
                    text=f"Analyzed {len(frames)} keyframes: observed periodic oscillatory vibration during operation.",
                    confidence=0.86,
                    location_hint="drive roller pivot shaft",
                    severity="high"
                )
            ],
            possible_causes=[
                "Drive shaft eccentric misalignment or bearing sleeve play."
            ],
            recommended_checks=[
                "Perform dial indicator runout check on drive shaft.",
                "Inspect roller bearing play with stroboscope."
            ],
            limitations=[
                "Video frame sampling rate (1 FPS) cannot capture high-frequency acoustic harmonics."
            ]
        )

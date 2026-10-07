"""Vision schemas for structured observation extraction and validation."""
from typing import List, Optional
from pydantic import BaseModel, Field


class VisualObservation(BaseModel):
    """Specific observation detected in an image/frame with confidence rating."""
    text: str = Field(..., description="Objective description of visible condition or anomaly")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score between 0.0 and 1.0")
    location_hint: Optional[str] = Field(None, description="Optional relative location e.g. 'top-right quadrant', 'center'")
    severity: str = Field(
        default="informational",
        description="Severity level: 'informational', 'low', 'medium', 'high', 'critical'"
    )


class InspectionResult(BaseModel):
    """Pydantic-validated structured output for image & visual inspection."""
    device_or_machinery_type: Optional[str] = Field(
        None, description="Inferred category/name of the inspected machinery or component"
    )
    objects: List[str] = Field(
        default_factory=list,
        description="List of detected machinery components, tools, or physical parts"
    )
    observations: List[VisualObservation] = Field(
        default_factory=list,
        description="Strictly visual, non-diagnostic observations from the image"
    )
    possible_causes: List[str] = Field(
        default_factory=list,
        description="Hypothesized potential mechanical/electrical causes (subject to confirmation)"
    )
    recommended_checks: List[str] = Field(
        default_factory=list,
        description="Actionable physical steps or inspections recommended for the technician"
    )
    limitations: List[str] = Field(
        default_factory=lambda: [
            "Visual inspection cannot confirm internal structural integrity or hidden wear.",
            "All physical maintenance should strictly adhere to OEM safety guidelines."
        ],
        description="Explicit boundaries and limitations of this visual analysis"
    )


class ImageAnalysisResponse(BaseModel):
    """API response envelope for image inspection endpoint."""
    success: bool = True
    image_filename: str
    file_id: str
    processing_time_ms: float
    provider_used: str
    result: InspectionResult

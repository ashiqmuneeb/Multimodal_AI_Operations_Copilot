from typing import List, Dict, Any, Optional
from app.agents.state import OperationalReport
from app.vision.schemas import InspectionResult
from app.rag.schemas import RAGSearchResult


class ReportTool:
    """Tool for synthesizing multimodal observations and retrieved manual citations into a validated report."""

    @property
    def name(self) -> str:
        return "create_report"

    @property
    def description(self) -> str:
        return "Compiles evidence-grounded operational maintenance report with strict observation vs diagnosis boundaries."

    def build_report(
        self,
        machinery_type: Optional[str],
        visual_inspection: Optional[InspectionResult],
        evidence: List[RAGSearchResult],
        user_notes: str,
        image_name: str = "equipment_image.jpg"
    ) -> OperationalReport:
        device_label = machinery_type or (visual_inspection.device_or_machinery_type if visual_inspection else "Industrial Machinery")

        # Compile Observations
        observations = []
        if visual_inspection:
            for obs in visual_inspection.observations:
                observations.append({
                    "observation": obs.text,
                    "evidence": [f"image:{image_name}"],
                    "confidence": obs.confidence,
                    "severity": obs.severity,
                    "location": obs.location_hint or "unspecified"
                })

        # Compile Possible Causes with Grounded Manual Citations
        possible_causes = []
        if visual_inspection and visual_inspection.possible_causes:
            for idx, cause in enumerate(visual_inspection.possible_causes):
                # Associate top evidence citation if available
                citation = evidence[idx].citation if idx < len(evidence) else (evidence[0].citation if evidence else "manual_reference_pending")
                possible_causes.append({
                    "cause": cause,
                    "support": [citation],
                    "status": "hypothesis_pending_physical_test"
                })

        # Compile Recommended Checks backed by SOP citations
        recommended_checks = []
        if evidence:
            for item in evidence:
                recommended_checks.append({
                    "step": f"Inspect per {item.section}: '{item.text[:140]}...'",
                    "source": item.citation
                })
        elif visual_inspection and visual_inspection.recommended_checks:
            for check in visual_inspection.recommended_checks:
                recommended_checks.append({
                    "step": check,
                    "source": "visual_heuristic"
                })

        # Safe Limitations
        limitations = [
            "Visual inspection cannot confirm internal component fatigue, micro-cracks, or sub-surface bearing failure.",
            "De-energize system and follow Lock-Out / Tag-Out (LOTO) protocols prior to any manual physical inspection.",
            "All torque and deflection values must be verified with calibrated physical instruments per OEM tolerances."
        ]

        summary_text = (
            f"Inspection of {device_label} completed. "
            f"Identified {len(observations)} visible condition(s) and cross-referenced "
            f"{len(evidence)} technical manual excerpt(s). "
            f"Field note context: '{user_notes}'."
        )

        return OperationalReport(
            title=f"Operations Inspection Report: {device_label}",
            summary=summary_text,
            observations=observations,
            possible_causes=possible_causes,
            recommended_checks=recommended_checks,
            limitations=limitations
        )

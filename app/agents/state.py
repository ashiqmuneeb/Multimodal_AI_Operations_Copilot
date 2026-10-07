from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from app.vision.schemas import VisualObservation, InspectionResult
from app.rag.schemas import RAGSearchResult


class ToolExecutionTrace(BaseModel):
    """Logs individual tool executions by the agent for auditability and transparency."""
    tool_name: str
    arguments: Dict[str, Any]
    output_summary: str
    duration_ms: float
    status: str = "success"  # "success" | "error"


class OperationalReport(BaseModel):
    """Final, grounded inspection report synthesizing visual evidence and manual citations."""
    title: str = Field(..., description="Operational Inspection & Maintenance Report")
    summary: str = Field(..., description="High-level executive summary of findings")
    observations: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of observations tied to frame/image evidence"
    )
    possible_causes: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Hypothesized causes with supporting manual citations e.g. manual.pdf:p37"
    )
    recommended_checks: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Step-by-step physical actions backed by cited SOP sections"
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Explicit boundaries preventing premature mechanical diagnosis"
    )


class AgentState(BaseModel):
    """
    Explicit, auditable state machine for the AI Operations Agent.
    Maintains all intermediate reasoning, tool calls, and observations.
    """
    user_request: str
    image_file_path: Optional[str] = None
    image_filename: Optional[str] = None
    target_document_id: Optional[str] = None

    # Intermediate Tool Outputs
    visual_inspection: Optional[InspectionResult] = None
    retrieved_evidence: List[RAGSearchResult] = Field(default_factory=list)
    calculated_results: Dict[str, Any] = Field(default_factory=dict)
    
    # Audit Trail
    tool_traces: List[ToolExecutionTrace] = Field(default_factory=list)
    open_questions: List[str] = Field(default_factory=list)
    
    # Final Synthesized Report
    final_report: Optional[OperationalReport] = None

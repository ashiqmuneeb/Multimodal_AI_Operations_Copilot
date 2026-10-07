import time
from pathlib import Path
from typing import Optional, Dict, Any
from app.config import get_settings
from app.agents.state import AgentState, ToolExecutionTrace, OperationalReport
from app.llm.base import MultimodalProvider
from app.llm.factory import get_multimodal_provider
from app.rag.retriever import FAISSRetriever
from app.tools.vision_tool import VisionTool
from app.tools.rag_tool import RAGTool
from app.tools.calculator import CalculatorTool
from app.tools.report_tool import ReportTool
from app.observability.logging import get_logger

logger = get_logger(__name__)


class AgentOrchestrator:
    """
    Multimodal AI Operations Orchestrator:
    Coordinates perception, manual retrieval, reasoning, and evidence grounding.
    """

    def __init__(
        self,
        provider: Optional[MultimodalProvider] = None,
        retriever: Optional[FAISSRetriever] = None
    ):
        self.provider = provider or get_multimodal_provider()
        self.retriever = retriever or FAISSRetriever()

        # Initialize agent tools
        self.vision_tool = VisionTool(self.provider)
        self.rag_tool = RAGTool(self.retriever)
        self.calculator_tool = CalculatorTool()
        self.report_tool = ReportTool()

    async def run(
        self,
        user_request: str,
        image_path: Optional[Path] = None,
        image_filename: Optional[str] = None,
        document_id: Optional[str] = None
    ) -> AgentState:
        """
        Executes multi-step reasoning over visual evidence and technical documentation.
        Returns full AgentState including tool execution trace and final grounded report.
        """
        state = AgentState(
            user_request=user_request,
            image_file_path=str(image_path) if image_path else None,
            image_filename=image_filename,
            target_document_id=document_id
        )

        logger.info(f"Agent Orchestrator starting task: '{user_request}'")

        # Step 1: Multimodal Perception (Vision Tool)
        if image_path and image_path.exists():
            t0 = time.perf_counter()
            try:
                inspection = await self.vision_tool.execute(image_path, user_notes=user_request)
                state.visual_inspection = inspection
                duration = round((time.perf_counter() - t0) * 1000, 2)
                state.tool_traces.append(ToolExecutionTrace(
                    tool_name=self.vision_tool.name,
                    arguments={"image": image_filename or str(image_path)},
                    output_summary=f"Detected {len(inspection.objects)} objects, {len(inspection.observations)} observations",
                    duration_ms=duration,
                    status="success"
                ))
            except Exception as e:
                logger.error(f"Vision tool failed: {e}")
                state.tool_traces.append(ToolExecutionTrace(
                    tool_name=self.vision_tool.name,
                    arguments={"image": str(image_path)},
                    output_summary=f"Failed: {str(e)}",
                    duration_ms=0.0,
                    status="error"
                ))

        # Step 2: Formulate Search Query & Retrieve Technical Documentation (RAG Tool)
        search_terms = [user_request]
        if state.visual_inspection:
            # Augment search with observed objects and symptoms
            for obs in state.visual_inspection.observations[:2]:
                search_terms.append(obs.text)
            if state.visual_inspection.objects:
                search_terms.append(" ".join(state.visual_inspection.objects[:3]))

        combined_query = " ".join(search_terms)
        t0 = time.perf_counter()
        try:
            evidence = self.rag_tool.execute(
                query=combined_query,
                top_k=3,
                document_id=document_id
            )
            state.retrieved_evidence = evidence
            duration = round((time.perf_counter() - t0) * 1000, 2)
            state.tool_traces.append(ToolExecutionTrace(
                tool_name=self.rag_tool.name,
                arguments={"query": combined_query[:100], "top_k": 3},
                output_summary=f"Retrieved {len(evidence)} manual chunks with citations",
                duration_ms=duration,
                status="success"
            ))
        except Exception as e:
            logger.error(f"RAG tool failed: {e}")
            state.tool_traces.append(ToolExecutionTrace(
                tool_name=self.rag_tool.name,
                arguments={"query": combined_query[:100]},
                output_summary=f"Failed: {str(e)}",
                duration_ms=0.0,
                status="error"
            ))

        # Step 3: Numerical Checks (Calculator Tool if tolerances / math are involved)
        # Check if expressions or tolerance comparisons exist in user request
        if any(c in user_request for c in ["+", "-", "*", "/", "%"]) and any(char.isdigit() for char in user_request):
            t0 = time.perf_counter()
            try:
                # Extract simple mathematical expression e.g. "12.5 - 8"
                import re
                match = re.search(r"(\d+(?:\.\d+)?\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)", user_request)
                if match:
                    expr = match.group(1)
                    val = self.calculator_tool.calculate(expr)
                    state.calculated_results[expr] = val
                    duration = round((time.perf_counter() - t0) * 1000, 2)
                    state.tool_traces.append(ToolExecutionTrace(
                        tool_name=self.calculator_tool.name,
                        arguments={"expression": expr},
                        output_summary=f"Calculated {expr} = {val}",
                        duration_ms=duration,
                        status="success"
                    ))
            except Exception as e:
                logger.warning(f"Calculator check skipped: {e}")

        # Step 4: Synthesize Evidence Grounded Report (Report Tool)
        t0 = time.perf_counter()
        report = self.report_tool.build_report(
            machinery_type=state.visual_inspection.device_or_machinery_type if state.visual_inspection else None,
            visual_inspection=state.visual_inspection,
            evidence=state.retrieved_evidence,
            user_notes=user_request,
            image_name=image_filename or "inspected_component.jpg"
        )
        duration = round((time.perf_counter() - t0) * 1000, 2)
        state.final_report = report
        state.tool_traces.append(ToolExecutionTrace(
            tool_name=self.report_tool.name,
            arguments={"sections": ["summary", "observations", "causes", "checks", "limitations"]},
            output_summary=f"Compiled report with {len(report.observations)} observations and {len(report.possible_causes)} causes",
            duration_ms=duration,
            status="success"
        ))

        logger.info(f"Agent Orchestrator completed task in {len(state.tool_traces)} steps.")
        return state

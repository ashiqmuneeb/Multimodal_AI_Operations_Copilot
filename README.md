# SYNAPSE OPS ⚡
> Production-grade Autonomous Machine Health, Field Inspection & Digital Twin Platform. Accepts images, maintenance manuals, and videos to generate evidence-grounded operational inspection reports.

---

## 🏗️ Architecture Overview

```
                      [ Industrial Technician / Web UI ]
                                       │
                                       ▼
                       [ FastAPI Gateway (/api/v1) ]
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
         [ Static / File Store ]                 [ Provider Abstraction ]
       (Uploads, Frames, PDFs)                 (Gemini 1.5/2.0 Flash / Mock)
                                                            │
               ┌────────────────────────────────────────────┼────────────────────────┐
               ▼                                            ▼                        ▼
      [ Vision Analyzer ]                          [ Document RAG Engine ]     [ Video Pipeline ]
    • Orientation & Resize                       • PyMuPDF page chunking     • FPS downsampling
    • Pydantic Schema Validation                 • FAISS Vector store        • Laplacian blur filter
    • Non-diagnostic observations                • Reranking & Citations     • SSIM deduplication
               │                                            │                        │
               └────────────────────────────────────────────┴────────────────────────┘
                                       │
                                       ▼
                          [ Structured Pydantic JSON ]
                         • Visual Observations (Frame #)
                         • Grounded Citations (Page #)
                         • Recommended Physical Checks
                         • Strict Limitations & Safety
```

---

## 🚀 Quickstart & Setup Guide

### 1. Conda Environment
A dedicated Conda environment named **`ops-copilot-env`** (Python 3.11) is configured for this project.

```powershell
# Activate the environment
conda activate ops-copilot-env
```

### 2. Dependencies
To update or verify installed dependencies:
```powershell
pip install -r requirements.txt
```

### 3. Environment Variables (.env)
Copy `.env.example` to `.env` and configure your keys:
```powershell
copy .env.example .env
```
Key variables:
- `LLM_PROVIDER`: Set to `gemini` for live Multimodal AI, or `mock` for instant offline testing without an API key.
- `GEMINI_API_KEY`: Your Google AI Studio API key (get free at [aistudio.google.com](https://aistudio.google.com/)).
- `GEMINI_MODEL`: `gemini-1.5-flash` or `gemini-2.0-flash`.

---

## 🏃 Running the Application

### Start the FastAPI Dev Server:
```powershell
conda activate ops-copilot-env
uvicorn app.main:app --reload --port 8000
```

- **Interactive UI Dashboard**: Open [http://localhost:8000/](http://localhost:8000/) in your browser.
- **Interactive Swagger API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs).
- **Alternative ReDoc**: Open [http://localhost:8000/redoc](http://localhost:8000/redoc).
- **Health Check**: Open [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health).

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```powershell
conda run -n ops-copilot-env pytest -v
```

---

## 📁 Repository Structure

```
d:/Research/ASHIQ/xtra/agentic_AI/
├── app/
│   ├── main.py                  # FastAPI Application Entrypoint (CORS, Lifespan, Routing)
│   ├── config.py                # Pydantic Settings loaded from .env
│   ├── api/
│   │   ├── router.py            # API Router Aggregator (/api/v1) & Health
│   │   ├── routes_vision.py     # Image Upload & Multimodal Inspection Endpoints
│   │   ├── routes_documents.py  # PDF Manual Upload, Vector Indexing & Semantic Search
│   │   ├── routes_agent.py      # End-to-End Multimodal Agent Orchestration Endpoints
│   │   └── routes_video.py      # Smart Video Sampling, Blur Filter & Inference Optimization
│   ├── video/
│   │   ├── __init__.py
│   │   ├── schemas.py           # FrameMetadata, VideoProcessingStats & Response Models
│   │   ├── sampler.py           # OpenCV Controlled FPS Downsampling (1 FPS)
│   │   ├── quality_filter.py    # Laplacian Variance Blur Detection
│   │   ├── deduplicator.py      # 3D Color Histogram Correlation Deduplication
│   │   └── pipeline.py          # End-to-End Video Optimization & Inference Pipeline
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── state.py             # AgentState, ToolExecutionTrace & OperationalReport
│   │   └── orchestrator.py      # Multi-Tool Reasoning & Multimodal Orchestrator
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── calculator.py        # Safe AST Numerical & Tolerance Calculator
│   │   ├── vision_tool.py       # Vision Preprocessing & Multimodal Inspection Tool
│   │   ├── video_tool.py        # Video Sampling, Deduplication & Temporal Tool
│   │   ├── rag_tool.py          # Semantic Knowledge Base & SOP Retrieval Tool
│   │   └── report_tool.py       # Grounded Citation Report Synthesizer Tool
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py           # Async SQLAlchemy Engine & Session Generator
│   │   └── models.py            # ORM Models (User, Document, DocumentChunk, Job, Analysis, Report)
│   ├── auth/
│   │   ├── __init__.py
│   │   └── security.py          # Bcrypt Password Hashing, JWT Bearer Auth & User Dep
│   ├── jobs/
│   │   ├── __init__.py
│   │   └── worker.py            # Async Background Job Lifecycle Manager
│   ├── documents/
│   │   ├── __init__.py
│   │   └── pdf.py               # PyMuPDF Document Extractor & Section Detector
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── schemas.py           # DocumentChunk, Record & SearchResult Schemas
│   │   ├── chunking.py          # Section-Aware Citation Preserving Chunker
│   │   ├── embeddings.py        # Local Sentence Transformers (all-MiniLM-L6-v2)
│   │   └── retriever.py         # FAISS Vector Index & Citation Search Engine
│   ├── llm/
│   │   ├── base.py              # Provider Abstraction Interface (MultimodalProvider)
│   │   ├── gemini_provider.py   # Google Gemini 1.5/2.0 Flash Multimodal Implementation
│   │   ├── mock_provider.py     # Deterministic Mock Provider for offline/testing
│   │   └── factory.py           # Model Provider Factory
│   ├── vision/
│   │   ├── schemas.py           # Pydantic Models: Observations, Results, Response
│   │   └── analyzer.py          # Image orientation, validation, and resizing
│   ├── observability/
│   │   └── logging.py           # Enterprise Structured Logging
│   └── utils/
│       └── file_handler.py      # Secure File Uploads & MIME validation
├── frontend/
│   └── index.html               # Industrial Dashboard with Agent, Video, and RAG Tabs
├── evaluation/
│   ├── dataset.json             # 10 Industrial Inspection Test Cases & Ground Truth Citations
│   ├── evaluate.py              # Automated RAG Recall@K, Groundedness & Video Benchmark
│   └── benchmark_report.json    # Persisted SLA Metrics & Verification Scorecard
├── tests/
│   ├── test_health.py           # API Health & Root Tests
│   ├── test_vision.py           # Vision Upload & Safety Validation Tests
│   ├── test_rag.py              # PDF Parsing, Indexing & Semantic Citation Search Tests
│   ├── test_agent.py            # Agent Orchestration, Tool Traces & Report Tests
│   ├── test_video.py            # Video Sampling, Blur Filter, Dedup & Endpoint Tests
│   ├── test_production.py       # JWT Auth, User Lifecycle & Background Job Manager Tests
│   └── test_evaluation.py       # Benchmark Evaluation Dataset & Pipeline Tests
├── uploads/                     # Local storage for images, videos, documents
│   ├── vector_store/            # Persisted FAISS index & metadata registry
│   └── videos/keyframes/        # Extracted high-value operational keyframes
├── Dockerfile                   # Multi-stage production container specification
├── docker-compose.yml           # Persistent volumes & service configuration
├── DEPLOYMENT_GUIDE.md          # Cloud, Hugging Face Spaces & VPS Deployment Guide
├── requirements.txt             # Pinned project dependencies
├── .env.example                 # Environment variables template
├── .env                         # Local environment settings
└── .gitignore                   # Production git ignore rules
```

---

## 📊 Benchmark & Evaluation Scorecard

Run the automated evaluation suite against the 10 real industrial benchmark cases:

```powershell
conda run -n ops-copilot-env python evaluation/evaluate.py
```

| Operational Metric | Enterprise SLA Target | Benchmark Result | Status |
| :--- | :--- | :--- | :--- |
| **RAG Retrieval Recall@1** | $\ge 80.0\%$ | **100.0%** | ✅ PASSED |
| **RAG Retrieval Recall@3** | $\ge 90.0\%$ | **100.0%** | ✅ PASSED |
| **Groundedness & Citation Rate** | $\ge 90.0\%$ | **100.0%** | ✅ PASSED |
| **Agent Trace Adherence** | $\ge 95.0\%$ | **100.0%** | ✅ PASSED |
| **Video Inference Cost Savings** | $\ge 80.0\%$ | **99.89%** | ✅ PASSED |
| **Retrieval Latency (Warm)** | $< 50\text{ ms}$ | **~6.0 ms** | ✅ PASSED |

---

## 🐳 Docker & Cloud Deployment

- **Docker Local Run**: `docker-compose up --build -d`
- **Cloud & Hugging Face Spaces Guide**: See detailed instructions in [DEPLOYMENT_GUIDE.md](file:///d:/Research/ASHIQ/xtra/agentic_AI/DEPLOYMENT_GUIDE.md).

---

## 🧭 Roadmap & Phases

- [x] **Phase 1: Multimodal MVP Foundation** (FastAPI, Conda env, Provider Abstraction, Image Preprocessing, Pydantic Schema, Interactive Dark UI Dashboard, Unit Tests).
- [x] **Phase 2: Documents & RAG Engine** (PyMuPDF ingestion, section chunking, sentence-transformers, FAISS vector index, citation grounding).
- [x] **Phase 3: Agent Orchestration & Tools** (State Machine, multi-tool reasoning: `search_knowledge_base`, `analyze_image`, `calculator`, `create_report`).
- [x] **Phase 4: Smart Video Optimization Pipeline** (OpenCV keyframe extraction, blur filtering, SSIM deduplication, inference cost reduction).
- [x] **Phase 5: Production Hardening** (SQLAlchemy Async ORM, SQLite/PostgreSQL, JWT Authentication, Async Background Job Manager, Dockerfile & docker-compose containerization, 11/11 tests passing).
- [x] **Phase 6: Benchmark Evaluation & Deployment** (10-case evaluation benchmark dataset, automated evaluation metrics for Recall@K, Groundedness, Video Optimization, 14/14 automated tests passing, Hugging Face Spaces & Docker deployment guide).



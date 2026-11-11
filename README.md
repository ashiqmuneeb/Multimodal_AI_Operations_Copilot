# ⚡ SYNAPSE OPS: Multimodal AI Operations Copilot

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Gemini](https://img.shields.io/badge/LLM-Gemini%20Flash-4285F4)
![FAISS](https://img.shields.io/badge/Vector%20Store-FAISS-purple)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)
![Tests](https://img.shields.io/badge/Tests-14%20passing-brightgreen)

An autonomous machine health and field inspection copilot. It accepts **images, videos and maintenance manuals** and generates **evidence-grounded inspection reports** with citations, visual observations and recommended physical checks.

## 🎥 Demo
<!-- Drag a screenshot or GIF of the dashboard here -->
![Dashboard](docs/images/dashboard.png)

## ✨ Key Features
- 🖼️ **Vision analysis:** image validation, orientation fix, resizing and schema-validated, non-diagnostic observations
- 📚 **Document RAG:** PyMuPDF page chunking, local embeddings, FAISS search with page-level citations
- 🎞️ **Smart video pipeline:** FPS downsampling, blur filtering and duplicate-frame removal to cut inference cost
- 🤖 **Agent orchestration:** multi-tool reasoning with execution traces (knowledge search, image analysis, calculator, report writer)
- 🔌 **Provider abstraction:** switch between Gemini and an offline mock provider with one setting
- 🛡️ **Safety by design:** structured output with explicit limitations; recommendations are physical checks, not diagnoses
- 🔐 **Production features:** JWT authentication, async SQLAlchemy ORM, background job manager
- 🐳 **Containerized:** Dockerfile and docker-compose included

## 🏗️ Architecture

```
                [ Industrial Technician / Web UI ]
                               │
                               ▼
                [ FastAPI Gateway (/api/v1) ]
                               │
          ┌────────────────────┴────────────────────┐
          ▼                                         ▼
 [ Static / File Store ]                [ Provider Abstraction ]
 (Uploads, Frames, PDFs)                (Gemini Flash / Mock)
                                                    │
     ┌──────────────────────────────┬───────────────┴──────────────┐
     ▼                              ▼                              ▼
[ Vision Analyzer ]        [ Document RAG Engine ]        [ Video Pipeline ]
• Orientation & resize     • PyMuPDF page chunking        • FPS downsampling
• Pydantic validation      • FAISS vector store           • Laplacian blur filter
• Non-diagnostic output    • Retrieval & citations        • Frame deduplication
     │                              │                              │
     └──────────────────────────────┴──────────────────────────────┘
                               │
                               ▼
                  [ Structured Pydantic JSON ]
                  • Visual observations (frame #)
                  • Grounded citations (page #)
                  • Recommended physical checks
                  • Limitations & safety notes
```

## 🛠️ Tech Stack
| Area | Tools |
|---|---|
| LLM / Multimodal | Google Gemini Flash (with mock provider for offline use) |
| Backend | Python, FastAPI, Pydantic |
| RAG | PyMuPDF, Sentence Transformers (all-MiniLM-L6-v2), FAISS |
| Video / Vision | OpenCV |
| Database & Auth | SQLAlchemy (async), SQLite / PostgreSQL, JWT, bcrypt |
| Deployment | Docker, docker-compose |
| Testing | pytest |

## 🚀 Quickstart

### 1. Clone and create the environment
```bash
git clone https://github.com/ashiqmuneeb/Multimodal_AI_Operations_Copilot.git
cd Multimodal_AI_Operations_Copilot

conda create -n ops-copilot-env python=3.11 -y
conda activate ops-copilot-env
pip install -r requirements.txt
```

### 2. Configure environment variables
```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | `gemini` for live multimodal AI, or `mock` for offline testing with no API key |
| `GEMINI_API_KEY` | Free key from [aistudio.google.com](https://aistudio.google.com) |
| `GEMINI_MODEL` | A current Gemini Flash model ID |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

### 3. Run the application
```bash
uvicorn app.main:app --reload --port 8000
```

- Dashboard: http://localhost:8000/
- Swagger docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/api/v1/health

### 4. Run with Docker
```bash
docker-compose up --build -d
```
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for cloud, Hugging Face Spaces and VPS deployment.

## 🧪 Tests
```bash
pytest -v
```

## 📊 Benchmark & Evaluation
Evaluated on a **small internal benchmark of 10 industrial inspection cases** with ground-truth citations:

```bash
python evaluation/evaluate.py
```

| Metric | Target | Result | Status |
|---|---|---|---|
| RAG Retrieval Recall@1 | ≥ 80% | 100% | ✅ |
| RAG Retrieval Recall@3 | ≥ 90% | 100% | ✅ |
| Groundedness & Citation Rate | ≥ 90% | 100% | ✅ |
| Agent Trace Adherence | ≥ 95% | 100% | ✅ |
| Video Inference Cost Savings | ≥ 80% | 99.89% | ✅ |
| Retrieval Latency (warm) | < 50 ms | ~6 ms | ✅ |

> These results come from a small dataset and are meant as a regression check, not a general accuracy claim.

## 📁 Repository Structure
```
Multimodal_AI_Operations_Copilot/
├── app/
│   ├── main.py            # FastAPI entrypoint (CORS, lifespan, routing)
│   ├── config.py          # Pydantic settings from .env
│   ├── api/               # Routes: vision, documents, agent, video
│   ├── agents/            # Agent state and multi-tool orchestrator
│   ├── tools/             # Calculator, vision, video, RAG, report tools
│   ├── rag/               # Chunking, embeddings, FAISS retriever
│   ├── documents/         # PyMuPDF extractor and section detector
│   ├── video/             # Sampler, blur filter, deduplicator, pipeline
│   ├── vision/            # Image validation and analysis schemas
│   ├── llm/               # Provider interface, Gemini, mock, factory
│   ├── db/                # Async SQLAlchemy engine and ORM models
│   ├── auth/              # JWT and password hashing
│   ├── jobs/              # Background job manager
│   ├── observability/     # Structured logging
│   └── utils/             # Secure file upload handling
├── frontend/index.html    # Dashboard with Agent, Video and RAG tabs
├── evaluation/            # Benchmark dataset, evaluation script, report
├── tests/                 # pytest suite (health, vision, RAG, agent, video, auth, eval)
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT_GUIDE.md
├── requirements.txt
└── .env.example
```

## 🧭 Development Phases
- [x] **Phase 1:** Multimodal MVP (FastAPI, provider abstraction, image preprocessing, Pydantic schemas, dashboard)
- [x] **Phase 2:** Documents & RAG (PyMuPDF ingestion, section chunking, FAISS, citation grounding)
- [x] **Phase 3:** Agent orchestration (state machine, multi-tool reasoning)
- [x] **Phase 4:** Video optimization (keyframes, blur filter, deduplication, cost reduction)
- [x] **Phase 5:** Production hardening (async ORM, JWT, background jobs, Docker)
- [x] **Phase 6:** Evaluation & deployment (benchmark, automated metrics, deployment guide)

## 🔮 Future Work
- Digital twin integration with live sensor data
- Multi-user workspaces and role-based access
- Larger evaluation dataset and human review of reports

## ⚠️ Disclaimer
Outputs are decision-support observations, not diagnoses. Always verify with a qualified technician before taking maintenance action.

## 📄 License
Add a `LICENSE` file (MIT recommended) and link it here.

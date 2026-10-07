from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.observability.logging import setup_logging, get_logger
from app.api.router import api_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle hook for startup and teardown routines."""
    setup_logging()
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    logger.info(f"Active LLM Provider: {settings.LLM_PROVIDER}")
    logger.info(f"Uploads Directory: {settings.upload_path.resolve()}")
    
    # Initialize SQLite / PostgreSQL database tables
    from app.db.session import init_db
    await init_db()
    
    yield
    logger.info("Gracefully shutting down Multimodal Operations Agent...")


def create_application() -> FastAPI:
    """Factory function to instantiate and configure FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "Production-grade Multimodal AI Operations Agent for industrial equipment "
            "inspection, document-grounded RAG, and automated operational reporting."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # Enable Cross-Origin Resource Sharing (CORS) for React / Web frontends
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API Routers under /api/v1
    app.include_router(api_router, prefix="/api/v1")

    # Static files mounting for inspection images/frames
    app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    from pathlib import Path
    from fastapi.responses import FileResponse

    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    frontend_assets = frontend_dist / "assets"
    frontend_index = frontend_dist / "index.html"

    if frontend_assets.exists():
        app.mount("/assets", StaticFiles(directory=frontend_assets), name="frontend_assets")

    @app.get("/", tags=["Root"])
    async def root():
        if frontend_index.exists():
            return FileResponse(frontend_index)
        return {
            "name": settings.APP_NAME,
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/api/v1/health"
        }

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred.", "error_type": type(exc).__name__}
        )

    return app


app = create_application()

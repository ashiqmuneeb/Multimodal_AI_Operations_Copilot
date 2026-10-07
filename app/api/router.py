from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.api.routes_vision import router as vision_router
from app.api.routes_documents import router as documents_router
from app.api.routes_agent import router as agent_router
from app.api.routes_video import router as video_router
from app.api.routes_auth import router as auth_router
from app.api.routes_jobs import router as jobs_router
from app.api.routes_ws import router as ws_router

api_router = APIRouter()

# Register sub-routes
api_router.include_router(ws_router)
api_router.include_router(auth_router)
api_router.include_router(jobs_router)
api_router.include_router(vision_router)
api_router.include_router(documents_router)
api_router.include_router(agent_router)
api_router.include_router(video_router)


@api_router.get("/health", tags=["System Health"])
async def health_check(settings: Settings = Depends(get_settings)):
    """Health check endpoint indicating service uptime, active model provider, and environment."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "configured_provider": settings.LLM_PROVIDER,
        "has_api_key": bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your-"))
    }

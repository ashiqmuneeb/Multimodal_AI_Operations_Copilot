from app.config import get_settings
from app.llm.base import MultimodalProvider
from app.llm.gemini_provider import GeminiProvider
from app.llm.mock_provider import MockProvider
from app.observability.logging import get_logger

logger = get_logger(__name__)


def get_multimodal_provider() -> MultimodalProvider:
    """
    Factory function returning the configured MultimodalProvider instance.
    Gracefully falls back to MockProvider if API keys are not supplied.
    """
    settings = get_settings()
    provider_name = settings.LLM_PROVIDER.lower().strip()

    if provider_name == "gemini":
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("your-"):
            logger.warning(
                "GEMINI_API_KEY is not configured in .env. Falling back gracefully to MockProvider. "
                "Set GEMINI_API_KEY in .env to use live Gemini 1.5/2.0 Flash."
            )
            return MockProvider()
        return GeminiProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.GEMINI_MODEL
        )
    elif provider_name == "mock":
        return MockProvider()
    else:
        logger.warning(f"Unknown LLM_PROVIDER '{provider_name}'. Defaulting to MockProvider.")
        return MockProvider()

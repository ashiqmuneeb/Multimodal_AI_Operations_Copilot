from typing import List, Optional
import numpy as np
from app.observability.logging import get_logger

logger = get_logger(__name__)


class EmbeddingEngine:
    """
    Generates dense vector embeddings using local sentence-transformers (all-MiniLM-L6-v2).
    Runs 100% locally on CPU with zero external API fees.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._dimension = 384

    @property
    def dimension(self) -> int:
        return self._dimension

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading local embedding model '{self.model_name}'...")
                self._model = SentenceTransformer(self.model_name)
                logger.info("Embedding model loaded successfully.")
            except Exception as e:
                logger.warning(f"Could not load sentence_transformers ({e}). Using deterministic fallback.")
                self._model = "fallback"

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Embeds a list of texts and returns a normalized (N, D) float32 numpy array.
        """
        if not texts:
            return np.empty((0, self._dimension), dtype=np.float32)

        self._load_model()

        if self._model != "fallback":
            embeddings = self._model.encode(
                texts,
                batch_size=32,
                show_progress_bar=False,
                normalize_embeddings=True
            )
            return np.asarray(embeddings, dtype=np.float32)

        # Fallback deterministic pseudo-embeddings for offline/test environments
        embeddings = []
        for text in texts:
            vec = np.zeros(self._dimension, dtype=np.float32)
            for i, word in enumerate(text.lower().split()[:self._dimension]):
                h = hash(word) % self._dimension
                vec[h] += 1.0 / (i + 1)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            embeddings.append(vec)
        return np.asarray(embeddings, dtype=np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """Embeds a single search query returning (1, D) normalized vector."""
        return self.embed_texts([query])

import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, Callable
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session_maker
from app.db.models import Job
from app.observability.logging import get_logger

logger = get_logger(__name__)


class JobManager:
    """Manages asynchronous background job execution, status updates, and progress tracking."""

    @staticmethod
    async def create_job(job_type: str, user_id: Optional[str] = None) -> str:
        """Creates a pending job record and returns the job ID."""
        session_maker = get_session_maker()
        job_id = str(uuid.uuid4())
        async with session_maker() as session:
            job = Job(
                id=job_id,
                user_id=user_id,
                job_type=job_type,
                status="pending",
                progress=0
            )
            session.add(job)
            await session.commit()
        logger.info(f"Created background job [{job_id}] of type '{job_type}'")
        return job_id

    @staticmethod
    async def update_progress(job_id: str, progress: int, status: str = "running"):
        """Updates job progress percentage and status."""
        session_maker = get_session_maker()
        async with session_maker() as session:
            await session.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(progress=progress, status=status)
            )
            await session.commit()

    @staticmethod
    async def complete_job(job_id: str, result: Dict[str, Any]):
        """Marks job as successfully completed with serialized output payload."""
        session_maker = get_session_maker()
        async with session_maker() as session:
            await session.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(
                    status="completed",
                    progress=100,
                    result_json=json.dumps(result),
                    completed_at=datetime.utcnow()
                )
            )
            await session.commit()
        logger.info(f"Job [{job_id}] completed successfully.")

    @staticmethod
    async def fail_job(job_id: str, error_message: str):
        """Marks job as failed with error trace."""
        session_maker = get_session_maker()
        async with session_maker() as session:
            await session.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(
                    status="failed",
                    error=error_message,
                    completed_at=datetime.utcnow()
                )
            )
            await session.commit()
        logger.error(f"Job [{job_id}] failed: {error_message}")

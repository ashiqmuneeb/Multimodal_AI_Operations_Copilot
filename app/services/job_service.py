from typing import Optional, Dict, Any, List
from app.jobs.worker import JobManager
from app.db.session import get_session_maker
from app.db.models import Job
from sqlalchemy import select
from app.observability.logging import get_logger

logger = get_logger(__name__)


class JobService:
    """
    Enterprise Background Job Management Service.
    Wraps asynchronous job scheduling, status polling, and result handling.
    """

    @staticmethod
    async def create_job(job_type: str, user_id: Optional[str] = None) -> str:
        """Enqueues an asynchronous background job."""
        return await JobManager.create_job(job_type=job_type, user_id=user_id)

    @staticmethod
    async def update_progress(job_id: str, progress: int, status: str = "running"):
        await JobManager.update_progress(job_id, progress, status)

    @staticmethod
    async def complete_job(job_id: str, result: Dict[str, Any]):
        await JobManager.complete_job(job_id, result)

    @staticmethod
    async def fail_job(job_id: str, error_message: str):
        await JobManager.fail_job(job_id, error_message)

    @staticmethod
    async def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves current execution status, progress, and result."""
        session_maker = get_session_maker()
        async with session_maker() as session:
            result = await session.execute(select(Job).where(Job.id == job_id))
            job = result.scalar_one_or_none()
            if not job:
                return None
            return {
                "job_id": job.id,
                "job_type": job.job_type,
                "status": job.status,
                "progress": job.progress,
                "error": job.error,
                "result": job.result_json,
                "created_at": str(job.created_at),
                "completed_at": str(job.completed_at) if job.completed_at else None
            }

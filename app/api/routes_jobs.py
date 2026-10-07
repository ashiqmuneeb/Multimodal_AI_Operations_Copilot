import json
from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Job
from app.observability.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/jobs", tags=["Background Jobs"])


class JobResponse(BaseModel):
    id: str
    job_type: str
    status: str
    progress: int
    error: Optional[str] = None
    result: Optional[Any] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


@router.get("", response_model=List[JobResponse], summary="List all background operational jobs")
async def list_jobs(db: AsyncSession = Depends(get_db)):
    """Returns list of recent background processing tasks."""
    result = await db.execute(select(Job).order_by(Job.created_at.desc()).limit(50))
    jobs = result.scalars().all()

    response = []
    for j in jobs:
        parsed_result = json.loads(j.result_json) if j.result_json else None
        response.append(JobResponse(
            id=j.id,
            job_type=j.job_type,
            status=j.status,
            progress=j.progress,
            error=j.error,
            result=parsed_result,
            created_at=j.created_at,
            completed_at=j.completed_at
        ))
    return response


@router.get("/{job_id}", response_model=JobResponse, summary="Get status and progress of a background job")
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Polls progress and retrieves completed results of an asynchronous task."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )

    parsed_result = json.loads(job.result_json) if job.result_json else None
    return JobResponse(
        id=job.id,
        job_type=job.job_type,
        status=job.status,
        progress=job.progress,
        error=job.error,
        result=parsed_result,
        created_at=job.created_at,
        completed_at=job.completed_at
    )

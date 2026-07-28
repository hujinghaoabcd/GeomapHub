from __future__ import annotations

from celery import shared_task
from django.utils import timezone

from .models import Job


def _run_placeholder(job_id: str, result: dict) -> dict:
    job = Job.objects.get(id=job_id)
    job.status = Job.Status.RUNNING
    job.started_at = timezone.now()
    job.progress = 10
    job.save(update_fields=("status", "started_at", "progress"))

    job.status = Job.Status.SUCCEEDED
    job.progress = 100
    job.result = result
    job.finished_at = timezone.now()
    job.save(update_fields=("status", "progress", "result", "finished_at"))
    return result


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def run_import_job(self, job_id: str) -> dict:
    return _run_placeholder(job_id, {"message": "Import pipeline placeholder completed"})


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def run_raster_job(self, job_id: str) -> dict:
    return _run_placeholder(job_id, {"message": "Raster pipeline placeholder completed"})


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def run_vector_job(self, job_id: str) -> dict:
    return _run_placeholder(job_id, {"message": "Vector pipeline placeholder completed"})

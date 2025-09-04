"""
Background worker for processing audit jobs.
"""

import asyncio
import signal
import sys
from datetime import datetime, timedelta
from typing import Optional
import structlog

from sqlalchemy.orm import Session
from db import SessionLocal, engine
from models import Job, JobStatus, Audit, AuditStatus
from config import settings

logger = structlog.get_logger(__name__)


class WorkerRunner:
    """Background worker for processing audit jobs."""
    
    def __init__(self):
        self.running = False
        self.db = SessionLocal()
    
    async def start(self):
        """Start the worker."""
        self.running = True
        logger.info("Starting audit worker", poll_interval=settings.queue_poll_interval)
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        try:
            while self.running:
                await self._process_jobs()
                await asyncio.sleep(settings.queue_poll_interval)
        except KeyboardInterrupt:
            logger.info("Worker interrupted by user")
        except Exception as e:
            logger.error("Worker error", error=str(e), exc_info=True)
        finally:
            await self._cleanup()
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logger.info("Received shutdown signal", signal=signum)
        self.running = False
    
    async def _process_jobs(self):
        """Process pending jobs."""
        try:
            # Get pending jobs
            jobs = self.db.query(Job).filter(
                Job.status == JobStatus.PENDING
            ).order_by(Job.priority.desc(), Job.created_at.asc()).limit(10).all()
            
            if not jobs:
                return
            
            logger.info("Processing jobs", count=len(jobs))
            
            for job in jobs:
                try:
                    await self._process_job(job)
                except Exception as e:
                    logger.error(
                        "Job processing failed",
                        job_id=str(job.id),
                        error=str(e),
                        exc_info=True
                    )
                    await self._handle_job_failure(job, str(e))
        
        except Exception as e:
            logger.error("Job processing error", error=str(e), exc_info=True)
    
    async def _process_job(self, job: Job):
        """Process a single job."""
        logger.info("Processing job", job_id=str(job.id), job_type=job.job_type)
        
        # Update job status
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        self.db.commit()
        
        try:
            # Process based on job type
            if job.job_type == "audit":
                result = await self._process_audit_job(job)
            else:
                raise ValueError(f"Unknown job type: {job.job_type}")
            
            # Mark job as completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.result = result
            self.db.commit()
            
            logger.info("Job completed", job_id=str(job.id))
            
        except Exception as e:
            await self._handle_job_failure(job, str(e))
    
    async def _process_audit_job(self, job: Job) -> dict:
        """Process an audit job."""
        from audit.audit_engine import AuditEngine
        
        payload = job.payload or {}
        url = payload.get("url")
        options = payload.get("options", {})
        
        if not url:
            raise ValueError("No URL provided in job payload")
        
        # Get audit record
        audit = self.db.query(Audit).filter(Audit.id == job.audit_id).first()
        if not audit:
            raise ValueError(f"Audit not found: {job.audit_id}")
        
        # Update audit status
        audit.status = AuditStatus.RUNNING
        audit.started_at = datetime.utcnow()
        self.db.commit()
        
        # Run audit
        audit_engine = AuditEngine()
        result = await audit_engine.run_audit(url, options)
        
        # Update audit with results
        audit.status = AuditStatus.COMPLETED
        audit.completed_at = datetime.utcnow()
        audit.scores = result.get("scores")
        audit.rules = result.get("rules")
        audit.top_fixes = result.get("top_fixes")
        audit.page_metadata = result.get("metadata")
        audit.detected_tools = result.get("detected_tools")
        self.db.commit()
        
        return result
    
    async def _handle_job_failure(self, job: Job, error_message: str):
        """Handle job failure with retry logic."""
        job.retry_count += 1
        
        if job.retry_count >= job.max_retries:
            # Max retries reached, mark as failed
            job.status = JobStatus.FAILED
            job.completed_at = datetime.utcnow()
            job.error_message = error_message
            job.error_details = {"retry_count": job.retry_count}
            
            # Update audit status if it's an audit job
            if job.job_type == "audit":
                audit = self.db.query(Audit).filter(Audit.id == job.audit_id).first()
                if audit:
                    audit.status = AuditStatus.FAILED
                    audit.completed_at = datetime.utcnow()
                    audit.error_message = error_message
                    audit.error_details = {"job_id": str(job.id)}
            
            logger.error(
                "Job failed permanently",
                job_id=str(job.id),
                retry_count=job.retry_count,
                error=error_message
            )
        else:
            # Schedule retry
            job.status = JobStatus.RETRY
            job.next_retry_at = datetime.utcnow() + timedelta(
                seconds=settings.queue_retry_delay * job.retry_count
            )
            
            logger.warning(
                "Job scheduled for retry",
                job_id=str(job.id),
                retry_count=job.retry_count,
                next_retry=job.next_retry_at.isoformat(),
                error=error_message
            )
        
        self.db.commit()
    
    async def _cleanup(self):
        """Cleanup resources."""
        logger.info("Cleaning up worker resources")
        self.db.close()
        engine.dispose()


async def main():
    """Main entry point for the worker."""
    worker = WorkerRunner()
    await worker.start()


if __name__ == "__main__":
    asyncio.run(main())

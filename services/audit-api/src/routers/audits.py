"""
Audit endpoints for SEO Audit API.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl, validator
import structlog

from db import get_db
from models import Audit, AuditStatus, Job, JobStatus
from audit.audit_engine import AuditEngine

logger = structlog.get_logger(__name__)
router = APIRouter()


class AuditRequest(BaseModel):
    """Request model for creating a new audit."""
    
    url: HttpUrl
    options: Optional[Dict[str, Any]] = None
    
    @validator("url")
    def validate_url(cls, v):
        """Validate URL format and protocol."""
        if not str(v).startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com",
                "options": {
                    "include_sitemap": True,
                    "max_sitemap_urls": 5,
                    "timeout": 300,
                }
            }
        }


class AuditResponse(BaseModel):
    """Response model for audit data."""
    
    id: str
    url: str
    status: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    options: Optional[Dict[str, Any]] = None
    scores: Optional[Dict[str, int]] = None
    rules: Optional[List[Dict[str, Any]]] = None
    top_fixes: Optional[List[Dict[str, Any]]] = None
    top_keywords: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    detected_tools: Optional[List[Dict[str, Any]]] = None
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None


class AuditListResponse(BaseModel):
    """Response model for audit list."""
    
    audits: List[AuditResponse]
    total: int
    page: int
    per_page: int


@router.post("/", response_model=AuditResponse, status_code=201)
async def create_audit(
    request: AuditRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    http_request: Request = None,
) -> AuditResponse:
    """
    Create a new SEO audit.
    
    Args:
        request: Audit request data
        background_tasks: FastAPI background tasks
        db: Database session
        http_request: HTTP request object for logging
        
    Returns:
        AuditResponse: Created audit data
        
    Raises:
        HTTPException: If audit creation fails
    """
    try:
        # Create audit record
        audit = Audit(
            url=str(request.url),
            status=AuditStatus.PENDING,
            options=request.options or {},
        )
        
        db.add(audit)
        db.commit()
        db.refresh(audit)
        
        # Create initial job
        job = Job(
            audit_id=audit.id,
            job_type="audit",
            status=JobStatus.PENDING,
            payload={
                "url": str(request.url),
                "options": request.options or {},
            },
        )
        
        db.add(job)
        db.commit()
        
        # Start audit in background
        background_tasks.add_task(
            run_audit_task,
            str(audit.id),
            str(request.url),
            request.options or {},
        )
        
        logger.info(
            "Audit created",
            audit_id=str(audit.id),
            url=str(request.url),
            request_id=getattr(http_request.state, "request_id", None),
        )
        
        return AuditResponse(**audit.to_dict())
        
    except Exception as e:
        logger.error(
            "Failed to create audit",
            error=str(e),
            url=str(request.url),
            request_id=getattr(http_request.state, "request_id", None),
            exc_info=True,
        )
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create audit: {str(e)}"
        )


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    db: Session = Depends(get_db),
    http_request: Request = None,
) -> AuditResponse:
    """
    Get audit by ID.
    
    Args:
        audit_id: Audit UUID
        db: Database session
        http_request: HTTP request object for logging
        
    Returns:
        AuditResponse: Audit data
        
    Raises:
        HTTPException: If audit not found
    """
    try:
        audit_uuid = uuid.UUID(audit_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid audit ID format")
    
    audit = db.query(Audit).filter(Audit.id == audit_uuid).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    logger.info(
        "Audit retrieved",
        audit_id=audit_id,
        status=audit.status.value,
        request_id=getattr(http_request.state, "request_id", None),
    )
    
    return AuditResponse(**audit.to_dict())


@router.get("/", response_model=AuditListResponse)
async def list_audits(
    page: int = 1,
    per_page: int = 20,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    http_request: Request = None,
) -> AuditListResponse:
    """
    List audits with pagination and filtering.
    
    Args:
        page: Page number (1-based)
        per_page: Number of items per page
        status: Filter by audit status
        db: Database session
        http_request: HTTP request object for logging
        
    Returns:
        AuditListResponse: Paginated list of audits
    """
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    # Build query
    query = db.query(Audit)
    
    if status:
        try:
            status_enum = AuditStatus(status)
            query = query.filter(Audit.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status value")
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    audits = query.order_by(Audit.created_at.desc()).offset(offset).limit(per_page).all()
    
    logger.info(
        "Audits listed",
        page=page,
        per_page=per_page,
        total=total,
        status=status,
        request_id=getattr(http_request.state, "request_id", None),
    )
    
    return AuditListResponse(
        audits=[AuditResponse(**audit.to_dict()) for audit in audits],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.delete("/{audit_id}", status_code=204)
async def delete_audit(
    audit_id: str,
    db: Session = Depends(get_db),
    http_request: Request = None,
) -> None:
    """
    Delete audit by ID.
    
    Args:
        audit_id: Audit UUID
        db: Database session
        http_request: HTTP request object for logging
        
    Raises:
        HTTPException: If audit not found
    """
    try:
        audit_uuid = uuid.UUID(audit_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid audit ID format")
    
    audit = db.query(Audit).filter(Audit.id == audit_uuid).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    db.delete(audit)
    db.commit()
    
    logger.info(
        "Audit deleted",
        audit_id=audit_id,
        request_id=getattr(http_request.state, "request_id", None),
    )


async def run_audit_task(audit_id: str, url: str, options: Dict[str, Any]) -> None:
    """
    Background task to run SEO audit.
    
    Args:
        audit_id: Audit UUID string
        url: URL to audit
        options: Audit options
    """
    from db import SessionLocal
    
    db = SessionLocal()
    try:
        audit_uuid = uuid.UUID(audit_id)
        audit = db.query(Audit).filter(Audit.id == audit_uuid).first()
        
        if not audit:
            logger.error("Audit not found for task", audit_id=audit_id)
            return
        
        # Update status to running
        audit.status = AuditStatus.RUNNING
        audit.started_at = datetime.utcnow()
        db.commit()
        
        logger.info("Starting audit task", audit_id=audit_id, url=url)
        
        # Run audit
        audit_engine = AuditEngine()
        result = await audit_engine.run_audit(url, options)
        
        # Update audit with results
        audit.status = AuditStatus.COMPLETED
        audit.completed_at = datetime.utcnow()
        audit.scores = result.get("scores")
        audit.rules = result.get("rules")
        audit.top_fixes = result.get("top_fixes")
        audit.top_keywords = result.get("top_keywords")
        audit.metadata = result.get("metadata")
        audit.detected_tools = result.get("detected_tools")
        
        logger.info(
            "Audit results saved",
            audit_id=audit_id,
            detected_tools_count=len(result.get("detected_tools", [])),
            detected_tools=result.get("detected_tools", [])[:3]  # Log first 3 tools
        )
        
        db.commit()
        
        logger.info("Audit completed successfully", audit_id=audit_id)
        
    except Exception as e:
        logger.error(
            "Audit task failed",
            audit_id=audit_id,
            error=str(e),
            exc_info=True,
        )
        
        # Update audit with error
        if audit:
            audit.status = AuditStatus.FAILED
            audit.completed_at = datetime.utcnow()
            audit.error_message = str(e)
            audit.error_details = {"exception_type": type(e).__name__}
            db.commit()
    
    finally:
        db.close()

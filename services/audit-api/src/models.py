"""
Database models for SEO Audit API.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from db import Base


class AuditStatus(str, enum.Enum):
    """Audit status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class JobStatus(str, enum.Enum):
    """Job status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"


class Audit(Base):
    """Audit model for storing audit results."""
    
    __tablename__ = "audits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String(2048), nullable=False, index=True)
    status = Column(Enum(AuditStatus), nullable=False, default=AuditStatus.PENDING)
    
    # User tracking
    user_id = Column(String(255), nullable=True, index=True)  # User ID from frontend
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Audit options
    options = Column(JSON, nullable=True)
    
    # Results
    scores = Column(JSON, nullable=True)  # {"overall": 85, "on_page": 90, "technical": 80}
    rules = Column(JSON, nullable=True)   # List of rule results
    top_fixes = Column(JSON, nullable=True)  # List of top priority fixes
    top_keywords = Column(JSON, nullable=True)  # List of top ranking keywords
    page_metadata = Column(JSON, nullable=True)   # Page metadata (title, description, etc.)
    detected_tools = Column(JSON, nullable=True)  # List of detected tools and platforms
    
    # Error information
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    
    # Relationships
    jobs = relationship("Job", back_populates="audit", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Audit(id={self.id}, url={self.url}, status={self.status})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert audit to dictionary."""
        return {
            "id": str(self.id),
            "url": self.url,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "options": self.options,
            "scores": self.scores,
            "rules": self.rules,
            "top_fixes": self.top_fixes,
            "top_keywords": self.top_keywords,
            "metadata": self.page_metadata,
            "detected_tools": self.detected_tools,
            "error_message": self.error_message,
            "error_details": self.error_details,
        }


class Job(Base):
    """Job model for background task processing."""
    
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audit_id = Column(UUID(as_uuid=True), ForeignKey('audits.id'), nullable=False, index=True)
    job_type = Column(String(100), nullable=False)  # "audit", "sitemap", "crawl", etc.
    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.PENDING)
    priority = Column(Integer, nullable=False, default=0)  # Higher number = higher priority
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Job data
    payload = Column(JSON, nullable=True)  # Job-specific data
    result = Column(JSON, nullable=True)   # Job result data
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    
    # Retry configuration
    retry_count = Column(Integer, nullable=False, default=0)
    max_retries = Column(Integer, nullable=False, default=3)
    next_retry_at = Column(DateTime, nullable=True)
    
    # Relationships
    audit = relationship("Audit", back_populates="jobs")
    
    def __repr__(self) -> str:
        return f"<Job(id={self.id}, audit_id={self.audit_id}, type={self.job_type}, status={self.status})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert job to dictionary."""
        return {
            "id": str(self.id),
            "audit_id": str(self.audit_id),
            "job_type": self.job_type,
            "status": self.status.value,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "payload": self.payload,
            "result": self.result,
            "error_message": self.error_message,
            "error_details": self.error_details,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "next_retry_at": self.next_retry_at.isoformat() if self.next_retry_at else None,
        }

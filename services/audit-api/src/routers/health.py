"""
Health check endpoints for SEO Audit API.
"""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import structlog

from db import get_db
from config import settings

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint.
    
    Returns:
        Dict containing health status and basic information
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Readiness check endpoint that verifies database connectivity.
    
    Args:
        db: Database session dependency
        
    Returns:
        Dict containing readiness status
        
    Raises:
        HTTPException: If database is not ready
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "healthy",
            },
        }
    except Exception as e:
        logger.error("Readiness check failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "timestamp": datetime.utcnow().isoformat(),
                "checks": {
                    "database": "unhealthy",
                },
                "error": str(e),
            }
        )


@router.get("/live")
async def liveness_check() -> Dict[str, Any]:
    """
    Liveness check endpoint for container orchestration.
    
    Returns:
        Dict containing liveness status
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": "running",
    }


@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with system information.
    
    Args:
        db: Database session dependency
        
    Returns:
        Dict containing detailed health information
    """
    health_info = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": {
            "name": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment,
            "debug": settings.debug,
        },
        "checks": {},
    }
    
    # Database check
    try:
        db.execute(text("SELECT 1"))
        health_info["checks"]["database"] = {
            "status": "healthy",
            "connection": "active",
        }
    except Exception as e:
        health_info["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e),
        }
        health_info["status"] = "unhealthy"
    
    # Configuration check
    try:
        health_info["checks"]["configuration"] = {
            "status": "healthy",
            "database_url_configured": bool(settings.database_url),
            "secret_key_configured": bool(settings.secret_key),
            "cors_origins": len(settings.cors_origins),
        }
    except Exception as e:
        health_info["checks"]["configuration"] = {
            "status": "unhealthy",
            "error": str(e),
        }
        health_info["status"] = "unhealthy"
    
    return health_info

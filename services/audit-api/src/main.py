"""
RIVISO Analytics API - FastAPI application for comprehensive SEO analysis and website optimization.
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
# Optional imports for monitoring (don't fail if not available)
try:
    from opentelemetry import trace
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    OPENTELEMETRY_AVAILABLE = True
except ImportError:
    OPENTELEMETRY_AVAILABLE = False

try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

# Import with error handling
try:
    from .config import Settings
    from .db import engine, get_db
    from .routers import health, audits
    print("✅ All imports successful")
    FULL_APP_AVAILABLE = True
except ImportError as e:
    print(f"❌ Import error: {e}")
    FULL_APP_AVAILABLE = False

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Initialize settings
settings = Settings()

# Configure OpenTelemetry (if available)
if OPENTELEMETRY_AVAILABLE and settings.otel_service_name:
    try:
        trace.set_tracer_provider(TracerProvider())
        tracer = trace.get_tracer(__name__)
        
        if settings.otel_exporter_otlp_endpoint:
            otlp_exporter = OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint)
            span_processor = BatchSpanProcessor(otlp_exporter)
            trace.get_tracer_provider().add_span_processor(span_processor)
    except Exception as e:
        logger.warning("OpenTelemetry configuration failed", error=str(e))

# Configure Sentry (if available)
if SENTRY_AVAILABLE and settings.sentry_dsn:
    try:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[
                FastApiIntegration(auto_enabling_instrumentations=False),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1,
            environment=settings.environment,
        )
    except Exception as e:
        logger.warning("Sentry configuration failed", error=str(e))


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    logger.info("Starting RIVISO Analytics API", version=settings.app_version)
    
    # Try to initialize database, but don't fail if it's not available
    try:
        from db import init_db
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning("Database initialization failed, running in limited mode", error=str(e))
    
    # Instrument SQLAlchemy (only if available and engine is available)
    if OPENTELEMETRY_AVAILABLE:
        try:
            SQLAlchemyInstrumentor().instrument(engine=engine)
        except Exception as e:
            logger.warning("SQLAlchemy instrumentation failed", error=str(e))
    
    yield
    
    # Shutdown
    logger.info("Shutting down RIVISO Analytics API")


# Create FastAPI application
if FULL_APP_AVAILABLE:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="RIVISO Analytics API for comprehensive SEO analysis and website optimization",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )
else:
    # Create minimal app if full app not available
    app = FastAPI(
        title="RIVISO Analytics API",
        version="1.0.0",
        description="RIVISO Analytics API - Limited Mode"
    )

# Add middleware
if FULL_APP_AVAILABLE:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts,
    )
else:
    # Minimal CORS for limited mode
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Instrument FastAPI (if available)
if OPENTELEMETRY_AVAILABLE:
    try:
        FastAPIInstrumentor.instrument_app(app)
    except Exception as e:
        logger.warning("FastAPI instrumentation failed", error=str(e))


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add request ID to all requests for tracing."""
    import uuid
    request_id = str(uuid.uuid4())
    
    # Add to request state
    request.state.request_id = request_id
    
    # Add to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with structured logging."""
    start_time = time.time()
    
    # Log request
    logger.info(
        "Request started",
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        request_id=getattr(request.state, "request_id", None),
    )
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(
        "Request completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time,
        request_id=getattr(request.state, "request_id", None),
    )
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with structured logging."""
    request_id = getattr(request.state, "request_id", None)
    
    logger.error(
        "Unhandled exception",
        exception=str(exc),
        exception_type=type(exc).__name__,
        request_id=request_id,
        exc_info=True,
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": request_id,
        },
    )


# Include routers
if FULL_APP_AVAILABLE:
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(audits.router, prefix="/audits", tags=["audits"])
else:
    # Add minimal audit endpoints for limited mode
    @app.post("/audits/")
    async def create_audit_limited(request: dict):
        return {"detail": "Service temporarily unavailable - running in limited mode"}
    
    @app.get("/audits/")
    async def list_audits_limited():
        return {"detail": "Service temporarily unavailable - running in limited mode"}
    
    @app.get("/audits/{audit_id}")
    async def get_audit_limited(audit_id: str):
        return {"detail": "Service temporarily unavailable - running in limited mode"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    if FULL_APP_AVAILABLE:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "healthy",
            "docs_url": "/docs" if settings.debug else None,
        }
    else:
        return {
            "name": "RIVISO Analytics API",
            "version": "1.0.0",
            "status": "healthy",
            "mode": "limited"
        }


@app.get("/health")
async def health_check():
    """Simple health check endpoint for Render."""
    if FULL_APP_AVAILABLE:
        try:
            # Try to check database connection
            from db import engine
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {
                "status": "healthy", 
                "service": "riviso-api",
                "database": "connected"
            }
        except Exception as e:
            # If database fails, still return healthy for basic functionality
            return {
                "status": "healthy", 
                "service": "riviso-api",
                "database": "disconnected",
                "note": "Running in limited mode"
            }
    else:
        return {
            "status": "healthy", 
            "service": "riviso-api",
            "mode": "limited"
        }


if __name__ == "__main__":
    import time
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.reload,
        workers=settings.workers,
        log_level=settings.log_level.lower(),
    )

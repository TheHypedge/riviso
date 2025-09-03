"""
Simplified FastAPI app for Railway deployment testing.
"""

from fastapi import FastAPI
import os

# Create a simple FastAPI app
app = FastAPI(
    title="RIVISO Analytics API",
    version="1.0.0",
    description="Simplified version for Railway deployment"
)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "RIVISO Analytics API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "service": "riviso-api",
        "port": os.getenv("PORT", "8000")
    }

@app.post("/audits/")
async def create_audit(request: dict):
    """Create a new audit - simplified version."""
    import uuid
    audit_id = str(uuid.uuid4())
    
    # Return a mock audit response
    return {
        "id": audit_id,
        "url": request.get("url", ""),
        "status": "completed",
        "created_at": "2024-01-01T00:00:00Z",
        "results": {
            "overall_score": 85,
            "on_page_score": 80,
            "technical_score": 90,
            "content_score": 85,
            "top_fixes": [
                "Add meta description",
                "Optimize images",
                "Improve page speed"
            ],
            "top_keywords": [
                {"keyword": "seo optimization", "volume": 1000, "difficulty": "medium"},
                {"keyword": "website analysis", "volume": 500, "difficulty": "low"},
                {"keyword": "search ranking", "volume": 800, "difficulty": "high"}
            ]
        }
    }

@app.get("/audits/")
async def list_audits():
    """List audits - simplified version."""
    return {
        "audits": [],
        "total": 0
    }

@app.get("/audits/{audit_id}")
async def get_audit(audit_id: str):
    """Get audit by ID - simplified version."""
    return {
        "id": audit_id,
        "url": "https://example.com",
        "status": "completed",
        "created_at": "2024-01-01T00:00:00Z",
        "results": {
            "overall_score": 85,
            "on_page_score": 80,
            "technical_score": 90,
            "content_score": 85,
            "top_fixes": [
                "Add meta description",
                "Optimize images",
                "Improve page speed"
            ],
            "top_keywords": [
                {"keyword": "seo optimization", "volume": 1000, "difficulty": "medium"},
                {"keyword": "website analysis", "volume": 500, "difficulty": "low"},
                {"keyword": "search ranking", "volume": 800, "difficulty": "high"}
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

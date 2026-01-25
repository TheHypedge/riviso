#!/usr/bin/env python3
"""Run the Scraper Engine API (uvicorn)."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "scraper_engine.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

#!/usr/bin/env python3
"""
Startup script for Render deployment
"""

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "src.simple_main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

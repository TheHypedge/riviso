#!/usr/bin/env python3
"""
Simple test to verify the FastAPI app can start without errors.
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from src.main import app
    print("✅ FastAPI app imported successfully")
    
    # Test if we can get the health endpoint
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    # Test root endpoint
    response = client.get("/")
    print(f"✅ Root endpoint: {response.status_code}")
    
    # Test health endpoint
    response = client.get("/health")
    print(f"✅ Health endpoint: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    print("🎉 All tests passed! App should start correctly.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

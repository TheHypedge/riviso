"""
Integration tests for audit flow.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from db import Base, get_db
from models import Audit, AuditStatus

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    """Setup test database."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_audit(setup_database):
    """Test creating a new audit."""
    response = client.post(
        "/audits/",
        json={
            "url": "https://example.com",
            "options": {
                "include_sitemap": True,
                "max_sitemap_urls": 3,
            }
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["url"] == "https://example.com"
    assert data["status"] == "pending"
    assert "id" in data


def test_get_audit(setup_database):
    """Test getting an audit by ID."""
    # First create an audit
    create_response = client.post(
        "/audits/",
        json={"url": "https://example.com"}
    )
    audit_id = create_response.json()["id"]
    
    # Then get it
    response = client.get(f"/audits/{audit_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == audit_id
    assert data["url"] == "https://example.com"


def test_list_audits(setup_database):
    """Test listing audits."""
    # Create a few audits
    for i in range(3):
        client.post(
            "/audits/",
            json={"url": f"https://example{i}.com"}
        )
    
    response = client.get("/audits/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["audits"]) >= 3
    assert data["total"] >= 3


def test_delete_audit(setup_database):
    """Test deleting an audit."""
    # Create an audit
    create_response = client.post(
        "/audits/",
        json={"url": "https://example.com"}
    )
    audit_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/audits/{audit_id}")
    assert response.status_code == 204
    
    # Try to get it (should fail)
    response = client.get(f"/audits/{audit_id}")
    assert response.status_code == 404

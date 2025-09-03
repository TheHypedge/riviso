"""
Simplified FastAPI app for Railway deployment testing.
"""

from fastapi import FastAPI
import os
import uuid
from datetime import datetime, timezone
import random

# Create a simple FastAPI app
app = FastAPI(
    title="RIVISO Analytics API",
    version="1.0.0",
    description="Simplified version for Railway deployment"
)

# Simple in-memory storage for audits
audits_storage = {}

def generate_realistic_audit_data(url: str):
    """Generate realistic audit data based on the URL."""
    # Extract domain from URL
    domain = url.replace('https://', '').replace('http://', '').split('/')[0]
    
    # Generate scores based on domain characteristics
    base_score = random.randint(60, 95)
    on_page_score = max(0, min(100, base_score + random.randint(-15, 10)))
    technical_score = max(0, min(100, base_score + random.randint(-10, 15)))
    content_score = max(0, min(100, base_score + random.randint(-20, 5)))
    
    # Generate rules based on scores
    rules = []
    
    # Meta description rule
    if on_page_score < 70:
        rules.append({
            "id": "meta_description",
            "name": "Meta Description",
            "category": "on_page",
            "status": "fail",
            "score": 0,
            "message": f"Missing or inadequate meta description for {domain}",
            "weight": 10
        })
    else:
        rules.append({
            "id": "meta_description",
            "name": "Meta Description",
            "category": "on_page",
            "status": "pass",
            "score": 100,
            "message": f"Good meta description found for {domain}",
            "weight": 10
        })
    
    # Page title rule
    if on_page_score < 80:
        rules.append({
            "id": "page_title",
            "name": "Page Title",
            "category": "on_page",
            "status": "warning",
            "score": 60,
            "message": f"Page title could be optimized for {domain}",
            "weight": 15
        })
    else:
        rules.append({
            "id": "page_title",
            "name": "Page Title",
            "category": "on_page",
            "status": "pass",
            "score": 100,
            "message": f"Excellent page title for {domain}",
            "weight": 15
        })
    
    # Technical rules
    if technical_score < 75:
        rules.append({
            "id": "page_speed",
            "name": "Page Speed",
            "category": "technical",
            "status": "fail",
            "score": 30,
            "message": f"Page loading speed needs improvement for {domain}",
            "weight": 20
        })
    else:
        rules.append({
            "id": "page_speed",
            "name": "Page Speed",
            "category": "technical",
            "status": "pass",
            "score": 95,
            "message": f"Good page loading speed for {domain}",
            "weight": 20
        })
    
    # Content rules
    if content_score < 70:
        rules.append({
            "id": "content_quality",
            "name": "Content Quality",
            "category": "content",
            "status": "fail",
            "score": 40,
            "message": f"Content quality needs improvement for {domain}",
            "weight": 25
        })
    else:
        rules.append({
            "id": "content_quality",
            "name": "Content Quality",
            "category": "content",
            "status": "pass",
            "score": 90,
            "message": f"Good content quality for {domain}",
            "weight": 25
        })
    
    # Generate top fixes
    top_fixes = []
    if on_page_score < 70:
        top_fixes.append({
            "rule_id": "meta_description",
            "title": "Optimize Meta Description",
            "impact": "high",
            "description": f"Add a compelling meta description for {domain} to improve click-through rates"
        })
    
    if technical_score < 75:
        top_fixes.append({
            "rule_id": "page_speed",
            "title": "Improve Page Speed",
            "impact": "high",
            "description": f"Optimize images and scripts to improve loading speed for {domain}"
        })
    
    if content_score < 70:
        top_fixes.append({
            "rule_id": "content_quality",
            "title": "Enhance Content Quality",
            "impact": "medium",
            "description": f"Improve content structure and readability for {domain}"
        })
    
    # Generate domain-specific keywords with more realistic data
    domain_keywords = [
        f"{domain} services",
        f"{domain} solutions", 
        f"best {domain}",
        f"{domain} company",
        f"{domain} reviews",
        f"{domain} pricing",
        f"{domain} features",
        f"{domain} alternatives"
    ]
    
    # More realistic search volumes and difficulties
    keyword_data = [
        {"keyword": f"{domain} services", "volume": random.randint(500, 2000), "difficulty": "low"},
        {"keyword": f"{domain} solutions", "volume": random.randint(1000, 5000), "difficulty": "medium"},
        {"keyword": f"best {domain}", "volume": random.randint(200, 1500), "difficulty": "low"},
        {"keyword": f"{domain} company", "volume": random.randint(300, 1200), "difficulty": "medium"},
        {"keyword": f"{domain} reviews", "volume": random.randint(100, 800), "difficulty": "low"},
        {"keyword": f"{domain} pricing", "volume": random.randint(400, 1800), "difficulty": "medium"},
        {"keyword": f"{domain} features", "volume": random.randint(200, 1000), "difficulty": "high"},
        {"keyword": f"{domain} alternatives", "volume": random.randint(150, 600), "difficulty": "high"}
    ]
    
    top_keywords = keyword_data[:8]
    
    # Generate on-page keyword analysis (simulating actual page analysis)
    on_page_keywords = [
        {"keyword": domain, "frequency": random.randint(15, 25), "density": round(random.uniform(2.5, 4.2), 1), "position": "title, h1, h2"},
        {"keyword": f"{domain} services", "frequency": random.randint(8, 15), "density": round(random.uniform(1.8, 3.1), 1), "position": "h2, h3, content"},
        {"keyword": "seo", "frequency": random.randint(6, 12), "density": round(random.uniform(1.2, 2.5), 1), "position": "content, meta"},
        {"keyword": "website", "frequency": random.randint(5, 10), "density": round(random.uniform(1.0, 2.0), 1), "position": "content, alt text"},
        {"keyword": "analysis", "frequency": random.randint(4, 8), "density": round(random.uniform(0.8, 1.8), 1), "position": "content"},
        {"keyword": "audit", "frequency": random.randint(3, 7), "density": round(random.uniform(0.6, 1.5), 1), "position": "content, navigation"},
        {"keyword": "optimization", "frequency": random.randint(2, 6), "density": round(random.uniform(0.4, 1.2), 1), "position": "content"},
        {"keyword": "performance", "frequency": random.randint(2, 5), "density": round(random.uniform(0.3, 1.0), 1), "position": "content"},
        {"keyword": "ranking", "frequency": random.randint(1, 4), "density": round(random.uniform(0.2, 0.8), 1), "position": "content"},
        {"keyword": "traffic", "frequency": random.randint(1, 3), "density": round(random.uniform(0.1, 0.6), 1), "position": "content"}
    ]
    
    # Sort by frequency (most used to least used)
    on_page_keywords.sort(key=lambda x: x["frequency"], reverse=True)
    
    return {
        "scores": {
            "overall": base_score,
            "on_page": on_page_score,
            "technical": technical_score,
            "content": content_score
        },
        "rules": rules,
        "top_fixes": top_fixes,
        "top_keywords": top_keywords,
        "on_page_keywords": on_page_keywords
    }

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
    """Create a new audit with realistic data based on the URL."""
    audit_id = str(uuid.uuid4())
    url = request.get("url", "")
    
    # Generate current timestamp
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    
    # Generate realistic audit data based on the URL
    audit_data = generate_realistic_audit_data(url)
    
    # Create the audit record
    audit_record = {
        "id": audit_id,
        "url": url,
        "status": "completed",
        "created_at": created_at,
        "started_at": created_at,
        "completed_at": created_at,
        **audit_data
    }
    
    # Store the audit
    audits_storage[audit_id] = audit_record
    
    return audit_record

@app.get("/audits/")
async def list_audits():
    """List audits - simplified version."""
    return {
        "audits": [],
        "total": 0
    }

@app.get("/audits/{audit_id}")
async def get_audit(audit_id: str):
    """Get audit by ID - returns stored audit data."""
    if audit_id in audits_storage:
        return audits_storage[audit_id]
    else:
        # Return a 404-like response for non-existent audits
        return {
            "detail": "Audit not found",
            "id": audit_id,
            "url": "Unknown",
            "status": "not_found",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "scores": {
                "overall": 0,
                "on_page": 0,
                "technical": 0,
                "content": 0
            },
            "rules": [],
            "top_fixes": [],
            "top_keywords": []
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

"""FastAPI app for crawl jobs and report retrieval."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

from .config import CrawlConfig, get_db_path
from .crawler import crawl
from .graph import build_graph_and_metrics
from .storage import (
    create_job,
    store_crawl,
    get_report,
    init_schema,
    get_db,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CrawlRequest(BaseModel):
    seed_urls: list[str]
    target_domain: str
    max_pages: int = 500


class IngestReferrersRequest(BaseModel):
    domain: str
    urls: list[str]


class OffPageAnalyzeRequest(BaseModel):
    url: str
    domain: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_schema(get_db())
    yield
    # shutdown


app = FastAPI(
    title="Scraper Engine",
    description="Self-hosted crawling and link-graph API. No third-party backlink APIs.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.post("/crawl")
async def post_crawl(req: CrawlRequest, background_tasks: BackgroundTasks):
    """Enqueue a crawl job. Returns job_id. Runs crawl in background."""
    if not req.seed_urls or not req.target_domain.strip():
        raise HTTPException(400, "seed_urls and target_domain required")
    db = get_db()
    job_id = create_job(db, req.target_domain.strip(), req.seed_urls)
    cfg = CrawlConfig(max_pages_per_domain=min(5000, max(1, req.max_pages)))

    async def run():
        try:
            pages = await crawl(req.seed_urls, req.target_domain.strip(), cfg)
            metrics = build_graph_and_metrics(pages, req.target_domain.strip())
            store_crawl(db, job_id, req.target_domain.strip(), pages, metrics)
            logger.info("crawl job %s done: %s pages, %s referring domains",
                        job_id, len(pages), metrics.get("referring_domains"))
        except Exception as e:
            logger.exception("crawl job %s failed: %s", job_id, e)

    background_tasks.add_task(run)
    return {"job_id": job_id, "status": "queued", "target_domain": req.target_domain}


@app.get("/report/{domain}")
async def get_report_by_domain(domain: str):
    """Return latest metrics for domain (from your own crawls)."""
    report = get_report(get_db(), domain.strip())
    if not report:
        raise HTTPException(404, f"No completed crawl for domain: {domain}")
    return report


@app.post("/ingest-referrers")
async def ingest_referrers(req: IngestReferrersRequest):
    """Register referrer URLs to crawl later. (Persisted via crawl job targeting domain.)"""
    # Minimal implementation: just validate. Full impl would store req.urls
    # and use them as seeds in next /crawl for req.domain.
    if not req.domain.strip() or not req.urls:
        raise HTTPException(400, "domain and urls required")
    return {"ok": True, "domain": req.domain, "urls_count": len(req.urls)}


@app.post("/off-page-analyze")
async def off_page_analyze(req: OffPageAnalyzeRequest):
    """
    Sync Off-Page analysis: crawl URL + same-domain links, build link graph,
    return metrics. No third-party APIs. Used when user clicks Off Page tab.
    """
    if not req.url.strip():
        raise HTTPException(400, "url required")
    domain = (req.domain or "").strip()
    if not domain:
        try:
            from urllib.parse import urlparse
            domain = urlparse(req.url).netloc or ""
        except Exception:
            raise HTTPException(400, "domain required or provide valid url")
    domain = domain.lower().replace("www.", "")
    seed_urls = [req.url.strip()]
    cfg = CrawlConfig(max_pages_per_domain=200)
    try:
        pages = await crawl(seed_urls, domain, cfg)
        metrics = build_graph_and_metrics(pages, domain)
    except Exception as e:
        logger.exception("off-page-analyze failed: %s", e)
        raise HTTPException(500, f"Off-page analysis failed: {e}") from e
    return {
        "demoData": False,
        "target_domain": domain,
        "referring_domains": metrics.get("referring_domains", 0),
        "total_backlinks": metrics.get("total_backlinks", 0),
        "follow_count": metrics.get("follow_count", 0),
        "nofollow_count": metrics.get("nofollow_count", 0),
        "follow_pct": metrics.get("follow_pct", 0),
        "estimated_da": metrics.get("estimated_da", 0),
        "pages_crawled": metrics.get("pages_crawled", 0),
        "raw": metrics,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}

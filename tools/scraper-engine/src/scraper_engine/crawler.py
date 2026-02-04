"""Async crawler with politeness and rate limiting."""

import asyncio
import logging
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from .config import CrawlConfig
from .extractor import extract

logger = logging.getLogger(__name__)


def _normalize_domain(url: str) -> str:
    p = urlparse(url)
    d = (p.netloc or "").lower().strip()
    if d.startswith("www."):
        d = d[4:]
    return d


def _same_domain(a: str, b: str) -> bool:
    """Check if two URLs are on the same domain (including subdomains)."""
    return _normalize_domain(a) == _normalize_domain(b)

def _is_same_base_domain(url: str, base_domain: str) -> bool:
    """
    Check if URL belongs to the same base domain, including subdomains.
    e.g., blog.example.com and www.example.com both match example.com
    url: full URL (e.g., "https://thelawcodes.com/about")
    base_domain: domain string (e.g., "thelawcodes.com")
    """
    url_domain = _normalize_domain(url)  # Extract domain from URL
    # base_domain might be a URL or just a domain string
    if base_domain.startswith(("http://", "https://")):
        base = _normalize_domain(base_domain)
    else:
        # It's already a domain string, just normalize it
        base = base_domain.lower().strip().replace("www.", "")
    
    # Exact match
    if url_domain == base:
        return True
    
    # Check if URL domain ends with base domain (subdomain case)
    # e.g., blog.example.com ends with .example.com
    if url_domain.endswith('.' + base):
        return True
    
    # Reverse check: base might be a subdomain of url_domain
    if base.endswith('.' + url_domain):
        return True
    
    return False


async def _robots_allowed(rp: RobotFileParser | None, url: str, ua: str) -> bool:
    if rp is None:
        return True
    try:
        return rp.can_fetch(ua, url)
    except Exception:
        return True


async def fetch_robots(base_url: str, ua: str) -> RobotFileParser | None:
    try:
        parsed = urlparse(base_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get(robots_url, headers={"User-Agent": ua})
            if r.status_code != 200:
                return None
            rp = RobotFileParser()
            rp.parse(r.text.splitlines())
            return rp
    except Exception as e:
        logger.warning("robots fetch failed for %s: %s", base_url, e)
        return None


async def crawl(
    seed_urls: list[str],
    target_domain: str,
    config: CrawlConfig | None = None,
) -> list[dict]:
    """
    Crawl seed URLs and same-domain links. Extract links and meta.
    Returns list of ExtractedPage-like dicts for storage/graph.
    """
    cfg = config or CrawlConfig()
    seen: set[str] = set()
    queue: asyncio.Queue[str] = asyncio.Queue()
    results: list[dict] = []
    sem = asyncio.Semaphore(cfg.max_concurrent)
    robots: dict[str, RobotFileParser | None] = {}
    
    # Store first seed URL for normalization closure
    first_seed_url = seed_urls[0] if seed_urls else ""

    def _normalize(u: str) -> str:
        """Normalize URL: strip trailing slash, preserve query params, ensure absolute."""
        u = u.strip()
        if not u:
            return u
        try:
            # If relative URL, make it absolute using the first seed URL as base
            if not u.startswith(("http://", "https://")):
                if first_seed_url:
                    from urllib.parse import urljoin
                    u = urljoin(first_seed_url, u)
            p = urlparse(u)
            # Remove fragment, normalize path (keep trailing slash for root)
            path = p.path
            if path and path != "/":
                path = path.rstrip("/")
            query = f"?{p.query}" if p.query else ""
            normalized = f"{p.scheme}://{p.netloc}{path}{query}"
            return normalized
        except Exception as e:
            logger.warning("Failed to normalize URL %s: %s", u, e)
            return u

    async def _fetch_one(client: httpx.AsyncClient, url: str) -> dict | None:
        async with sem:
            await asyncio.sleep(cfg.request_delay_seconds)
        domain = _normalize_domain(url)
        if cfg.respect_robots:
            if domain not in robots:
                base = f"https://{domain}" if not urlparse(url).scheme else url
                robots[domain] = await fetch_robots(base, cfg.user_agent)
            if not await _robots_allowed(robots.get(domain), url, cfg.user_agent):
                return None
        try:
            r = await client.get(
                url,
                headers={"User-Agent": cfg.user_agent},
                follow_redirects=True,
                timeout=cfg.timeout_seconds,
            )
        except Exception as e:
            logger.warning("fetch failed %s: %s", url, e)
            return None
        logger.debug("Successfully fetched %s (status %d)", url, r.status_code)
        if r.status_code != 200:
            logger.debug("Skipping %s: status %d", url, r.status_code)
            return None
        final_url = str(r.url)
        html = r.text
        ep = extract(html, final_url, target_domain)
        return {
            "url": ep.url,
            "domain": ep.domain,
            "title": ep.title,
            "meta_description": ep.meta_description,
            "canonical": ep.canonical,
            "internal_count": ep.internal_count,
            "external_count": ep.external_count,
            "follow_count": ep.follow_count,
            "nofollow_count": ep.nofollow_count,
            "links": [
                {
                    "href": L.href,
                    "anchor": L.anchor,
                    "rel": L.rel,
                    "is_internal": L.is_internal,
                    "is_nofollow": L.is_nofollow,
                }
                for L in ep.links
            ],
        }

    for u in seed_urls:
        u = _normalize(u)
        if u not in seen:
            seen.add(u)
            await queue.put(u)

    async with httpx.AsyncClient(
        headers={"User-Agent": cfg.user_agent},
        follow_redirects=True,
    ) as client:
        pages_done = 0
        consecutive_empty = 0
        max_empty_iterations = 3  # Allow a few empty iterations to catch async queue additions
        
        while pages_done < cfg.max_pages_per_domain:
            # Check if queue is empty
            if queue.empty():
                consecutive_empty += 1
                if consecutive_empty >= max_empty_iterations:
                    logger.info("Queue empty for %d iterations, stopping crawl. Crawled %d pages.", 
                               consecutive_empty, pages_done)
                    break
                await asyncio.sleep(0.5)  # Brief wait for async queue additions
                continue
            
            consecutive_empty = 0  # Reset counter when we get a URL
            
            try:
                url = await asyncio.wait_for(queue.get(), timeout=2.0)
            except asyncio.TimeoutError:
                consecutive_empty += 1
                if consecutive_empty >= max_empty_iterations:
                    logger.info("Queue timeout, stopping crawl. Crawled %d pages.", pages_done)
                    break
                continue
            
            if pages_done % 10 == 0 or pages_done < 5:
                logger.info("Crawling page %d/%d: %s", pages_done + 1, cfg.max_pages_per_domain, url)
            out = await _fetch_one(client, url)
            if out is None:
                continue
            results.append(out)
            pages_done += 1

            # Enqueue same-domain links (including subdomains) we haven't seen
            new_links_count = 0
            skipped_seen = 0
            total_links = len(out["links"])
            internal_links_found = sum(1 for L in out["links"] if L["is_internal"])
            logger.info("Page %s: Found %d total links, %d marked as internal", url, total_links, internal_links_found)
            
            for L in out["links"]:
                href = L["href"]
                is_internal = L["is_internal"]
                
                # Check if internal - use base domain matching to include subdomains
                if not is_internal:
                    # Double-check: maybe extractor missed it (e.g., subdomain case)
                    if not _is_same_base_domain(href, target_domain):
                        continue
                    # It's actually internal, update our check
                    is_internal = True
                    logger.debug("Link %s was not marked internal but matches base domain", href)
                else:
                    # Already marked as internal, but verify with base domain check
                    if not _is_same_base_domain(href, target_domain):
                        logger.debug("Link %s marked internal but doesn't match base domain", href)
                        continue
                
                # href should already be absolute from extractor, but normalize it
                try:
                    href_normalized = _normalize(href)
                    if href_normalized in seen:
                        skipped_seen += 1
                        continue
                    seen.add(href_normalized)
                    await queue.put(href_normalized)
                    new_links_count += 1
                    if new_links_count <= 5:  # Log first few
                        logger.info("Added link to queue: %s", href_normalized)
                except Exception as e:
                    logger.warning("Failed to process link %s: %s", href, e)
                    continue
            
            if new_links_count > 0:
                logger.info("Added %d new internal links to queue from %s (skipped %d already seen, total queued: %d, total seen: %d)", 
                           new_links_count, url, skipped_seen, queue.qsize(), len(seen))
            else:
                logger.warning("No new internal links found on %s (had %d total links, %d internal, %d already seen)", 
                              url, total_links, internal_links_found, skipped_seen)
        
        logger.info("Crawl completed: %d pages crawled, %d unique URLs seen", pages_done, len(seen))

    return results

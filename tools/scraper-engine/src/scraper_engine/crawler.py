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
    return _normalize_domain(a) == _normalize_domain(b)


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

    def _normalize(u: str) -> str:
        u = u.strip().rstrip("/") or "/"
        try:
            p = urlparse(u)
            return f"{p.scheme}://{p.netloc}{p.path or '/'}{f'?{p.query}' if p.query else ''}"
        except Exception:
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
        if r.status_code != 200:
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
        while not queue.empty() and pages_done < cfg.max_pages_per_domain:
            try:
                url = await asyncio.wait_for(queue.get(), timeout=1.0)
            except asyncio.TimeoutError:
                continue
            out = await _fetch_one(client, url)
            if out is None:
                continue
            results.append(out)
            pages_done += 1

            # Enqueue same-domain links we haven't seen
            for L in out["links"]:
                href = L["href"]
                if not L["is_internal"]:
                    continue
                href = _normalize(href)
                if href in seen:
                    continue
                if not _same_domain(href, target_domain):
                    continue
                seen.add(href)
                await queue.put(href)

    return results

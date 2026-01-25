"""Extract links, meta, and structure from HTML."""

from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup


@dataclass
class ExtractedLink:
    href: str
    anchor: str
    rel: str
    is_internal: bool
    is_nofollow: bool


@dataclass
class ExtractedPage:
    url: str
    domain: str
    title: str
    meta_description: str
    canonical: str | None
    links: list[ExtractedLink] = field(default_factory=list)
    h1: list[str] = field(default_factory=list)
    internal_count: int = 0
    external_count: int = 0
    follow_count: int = 0
    nofollow_count: int = 0


def _normalize_domain(url: str) -> str:
    p = urlparse(url)
    d = (p.netloc or "").lower().strip()
    if d.startswith("www."):
        d = d[4:]
    return d


def _same_domain(url: str, domain: str) -> bool:
    return _normalize_domain(url) == domain


def extract(html: str, page_url: str, target_domain: str) -> ExtractedPage:
    """Parse HTML and extract links, meta, headings."""
    soup = BeautifulSoup(html, "lxml")
    base_domain = _normalize_domain(page_url)

    # Meta
    title = ""
    tit = soup.find("title")
    if tit and tit.string:
        title = tit.string.strip()[:500]

    meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    meta_description = ""
    if meta_desc and meta_desc.get("content"):
        meta_description = (meta_desc["content"] or "").strip()[:1000]

    canonical = None
    can = soup.find("link", attrs={"rel": "canonical"})
    if can and can.get("href"):
        canonical = urljoin(page_url, can["href"]).strip()

    # Headings
    h1 = [t.get_text(strip=True) for t in soup.find_all("h1") if t.get_text(strip=True)]

    # Links
    links: list[ExtractedLink] = []
    for a in soup.find_all("a", href=True):
        href = (a["href"] or "").strip()
        if not href or href.startswith("#") or href.lower().startswith("javascript:"):
            continue
        abs_href = urljoin(page_url, href)
        try:
            parsed = urlparse(abs_href)
            if parsed.scheme not in ("http", "https"):
                continue
        except Exception:
            continue
        anchor = (a.get_text() or "").strip()[:500]
        rel = (a.get("rel") or [])
        if isinstance(rel, str):
            rel = [rel]
        rel_str = " ".join(r.lower() for r in rel)
        is_nofollow = "nofollow" in rel_str
        target_d = _normalize_domain(target_domain) if target_domain else base_domain
        is_internal = _same_domain(abs_href, target_d)

        links.append(
            ExtractedLink(
                href=abs_href,
                anchor=anchor,
                rel=rel_str,
                is_internal=is_internal,
                is_nofollow=is_nofollow,
            )
        )

    internal_count = sum(1 for L in links if L.is_internal)
    external_count = len(links) - internal_count
    follow_count = sum(1 for L in links if not L.is_nofollow)
    nofollow_count = len(links) - follow_count

    return ExtractedPage(
        url=page_url,
        domain=base_domain,
        title=title,
        meta_description=meta_description,
        canonical=canonical,
        links=links,
        h1=h1,
        internal_count=internal_count,
        external_count=external_count,
        follow_count=follow_count,
        nofollow_count=nofollow_count,
    )

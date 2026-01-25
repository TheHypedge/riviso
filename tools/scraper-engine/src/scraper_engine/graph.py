"""Link graph and derived metrics from crawl results."""

from collections import defaultdict
from urllib.parse import urlparse


def _normalize_domain(url: str) -> str:
    p = urlparse(url)
    d = (p.netloc or "").lower().strip()
    if d.startswith("www."):
        d = d[4:]
    return d


def build_graph_and_metrics(
    pages: list[dict],
    target_domain: str,
) -> dict:
    """
    Build link graph from crawl results and compute metrics.
    Returns dict with referring_domains, total_backlinks, follow_pct, etc.
    """
    target = _normalize_domain(target_domain)
    # Backlinks: (source_url, target_url) where target is our domain
    backlinks: list[tuple[str, str, str, bool]] = []
    outbound: list[tuple[str, str, str, bool]] = []

    for p in pages:
        src = p["url"]
        src_domain = _normalize_domain(src)
        for L in p.get("links", []):
            href = L["href"]
            anchor = L.get("anchor", "")
            nofollow = L.get("is_nofollow", False)
            tgt_domain = _normalize_domain(href)
            if tgt_domain == target:
                # Backlink only if source is *external* (referrer), not same domain
                if src_domain != target:
                    backlinks.append((src, href, anchor, nofollow))
            else:
                outbound.append((src, href, anchor, nofollow))

    referring_domains = len({_normalize_domain(s) for s, _, _, _ in backlinks})
    total_backlinks = len(backlinks)
    follow = sum(1 for _, _, _, nf in backlinks if not nf)
    nofollow = total_backlinks - follow
    follow_pct = (100 * follow / total_backlinks) if total_backlinks else 0.0

    # Estimated "DA-like" score (your own formula; label as Estimated in UI)
    import math
    da_est = min(
        100,
        max(
            0,
            math.log10(1 + referring_domains) * 10
            + math.log10(1 + max(0, total_backlinks)) * 5,
        ),
    )

    return {
        "target_domain": target_domain,
        "referring_domains": referring_domains,
        "total_backlinks": total_backlinks,
        "follow_count": follow,
        "nofollow_count": nofollow,
        "follow_pct": round(follow_pct, 2),
        "estimated_da": round(da_est, 1),
        "pages_crawled": len(pages),
        "backlinks": [
            {"source": s, "target": t, "anchor": a, "nofollow": nf}
            for s, t, a, nf in backlinks
        ],
    }

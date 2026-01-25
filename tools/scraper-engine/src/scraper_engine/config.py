"""Configuration and constants."""

from dataclasses import dataclass, field
from typing import Set
import os


@dataclass
class CrawlConfig:
    """Crawler settings."""

    max_pages_per_domain: int = 500
    max_concurrent: int = 5
    request_delay_seconds: float = 1.0
    timeout_seconds: float = 15.0
    user_agent: str = (
        "RivisoScraper/1.0 (+https://github.com/your-org/riviso; "
        "self-hosted research crawler)"
    )
    respect_robots: bool = True
    follow_external_referrers_only: bool = True
    referrer_domains: Set[str] = field(default_factory=set)


def get_db_path() -> str:
    """SQLite DB path. Override via SCRAPER_ENGINE_DB."""
    return os.environ.get("SCRAPER_ENGINE_DB", "scraper_engine.db")

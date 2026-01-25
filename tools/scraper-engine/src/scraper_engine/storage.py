"""SQLite storage for crawl results and metrics."""

import json
import sqlite3


def get_db(path: str | None = None) -> str:
    from .config import get_db_path
    return path or get_db_path()


def init_schema(db_path: str) -> None:
    conn = sqlite3.connect(db_path)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS crawl_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_domain TEXT NOT NULL,
            seed_urls TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS crawl_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            domain TEXT NOT NULL,
            title TEXT,
            meta_description TEXT,
            internal_count INTEGER,
            external_count INTEGER,
            follow_count INTEGER,
            nofollow_count INTEGER,
            links_json TEXT,
            FOREIGN KEY (job_id) REFERENCES crawl_jobs(id)
        );
        CREATE TABLE IF NOT EXISTS crawl_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL UNIQUE,
            target_domain TEXT NOT NULL,
            referring_domains INTEGER,
            total_backlinks INTEGER,
            follow_pct REAL,
            estimated_da REAL,
            metrics_json TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (job_id) REFERENCES crawl_jobs(id)
        );
    """)
    conn.commit()
    conn.close()


def store_crawl(
    db_path: str,
    job_id: int,
    target_domain: str,
    pages: list[dict],
    metrics: dict,
) -> None:
    init_schema(db_path)
    conn = sqlite3.connect(db_path)
    for p in pages:
        conn.execute(
            """INSERT INTO crawl_pages
               (job_id, url, domain, title, meta_description,
                internal_count, external_count, follow_count, nofollow_count, links_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                job_id,
                p["url"],
                p["domain"],
                p.get("title", ""),
                p.get("meta_description", ""),
                p.get("internal_count", 0),
                p.get("external_count", 0),
                p.get("follow_count", 0),
                p.get("nofollow_count", 0),
                json.dumps(p.get("links", [])),
            ),
        )
    conn.execute(
        """INSERT OR REPLACE INTO crawl_metrics
           (job_id, target_domain, referring_domains, total_backlinks,
            follow_pct, estimated_da, metrics_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
        (
            job_id,
            target_domain,
            metrics.get("referring_domains", 0),
            metrics.get("total_backlinks", 0),
            metrics.get("follow_pct", 0),
            metrics.get("estimated_da", 0),
            json.dumps(metrics),
        ),
    )
    conn.execute(
        "UPDATE crawl_jobs SET status = ? WHERE id = ?",
        ("completed", job_id),
    )
    conn.commit()
    conn.close()


def create_job(db_path: str, target_domain: str, seed_urls: list[str]) -> int:
    init_schema(db_path)
    conn = sqlite3.connect(db_path)
    cur = conn.execute(
        "INSERT INTO crawl_jobs (target_domain, seed_urls, status) VALUES (?, ?, ?)",
        (target_domain, json.dumps(seed_urls), "pending"),
    )
    job_id = cur.lastrowid or 0
    conn.commit()
    conn.close()
    return job_id


def get_report(db_path: str, target_domain: str) -> dict | None:
    init_schema(db_path)
    conn = sqlite3.connect(db_path)
    row = conn.execute(
        """SELECT metrics_json, updated_at FROM crawl_metrics m
           JOIN crawl_jobs j ON j.id = m.job_id
           WHERE m.target_domain = ? AND j.status = 'completed'
           ORDER BY m.updated_at DESC LIMIT 1""",
        (target_domain,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    out = json.loads(row[0])
    out["updated_at"] = row[1]
    return out

"""
URL fetcher with security and rate limiting.
"""

import asyncio
from typing import Optional, Dict, Any
from urllib.parse import urlparse, urljoin
import httpx
import structlog

from audit.security import SecurityValidator
from config import settings

logger = structlog.get_logger(__name__)


class Fetcher:
    """Secure URL fetcher with rate limiting and validation."""
    
    def __init__(self):
        self.security_validator = SecurityValidator()
        self._client = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(settings.audit_timeout),
                follow_redirects=True,
                max_redirects=settings.max_redirects,
                limits=httpx.Limits(
                    max_keepalive_connections=20,
                    max_connections=100,
                ),
                headers={
                    "User-Agent": settings.user_agent,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                },
            )
        return self._client
    
    async def fetch_url(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch URL content with security validation.
        
        Args:
            url: URL to fetch
            
        Returns:
            Dict containing content and metadata, or None if failed
        """
        try:
            # Validate URL security
            await self.security_validator.validate_url(url)
            
            client = await self._get_client()
            
            logger.info("Fetching URL", url=url)
            
            response = await client.get(url)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get("content-type", "").lower()
            if not self._is_allowed_content_type(content_type):
                raise ValueError(f"Content type not allowed: {content_type}")
            
            # Check content size
            content_length = response.headers.get("content-length")
            if content_length and int(content_length) > settings.max_content_size:
                raise ValueError(f"Content too large: {content_length} bytes")
            
            # Get content
            content = response.text
            
            # Check actual content size
            if len(content.encode("utf-8")) > settings.max_content_size:
                raise ValueError("Content too large after decoding")
            
            return {
                "url": url,
                "content": content,
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content_type": content_type,
                "content_length": len(content.encode("utf-8")),
                "final_url": str(response.url),
            }
            
        except httpx.HTTPStatusError as e:
            logger.warning(
                "HTTP error fetching URL",
                url=url,
                status_code=e.response.status_code,
                error=str(e)
            )
            return None
            
        except httpx.RequestError as e:
            logger.warning(
                "Request error fetching URL",
                url=url,
                error=str(e)
            )
            return None
            
        except Exception as e:
            logger.error(
                "Unexpected error fetching URL",
                url=url,
                error=str(e),
                exc_info=True
            )
            return None
    
    def _is_allowed_content_type(self, content_type: str) -> bool:
        """
        Check if content type is allowed.
        
        Args:
            content_type: Content type header value
            
        Returns:
            True if content type is allowed
        """
        allowed_types = [
            "text/html",
            "text/plain",
            "application/xhtml+xml",
            "application/xml",
            "text/xml",
        ]
        
        return any(allowed_type in content_type for allowed_type in allowed_types)
    
    async def close(self):
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

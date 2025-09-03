"""
Sitemap parser for discovering additional URLs to audit.
"""

import asyncio
from typing import List, Optional
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET
import structlog

from audit.fetcher import Fetcher
from audit.security import SecurityValidator

logger = structlog.get_logger(__name__)


class SitemapParser:
    """Parser for XML sitemaps."""
    
    def __init__(self):
        self.fetcher = Fetcher()
        self.security_validator = SecurityValidator()
    
    async def get_sitemap_urls(self, base_url: str) -> List[str]:
        """
        Get URLs from sitemap.
        
        Args:
            base_url: Base URL to find sitemap
            
        Returns:
            List of URLs from sitemap
        """
        try:
            # Try common sitemap locations
            sitemap_urls = [
                urljoin(base_url, "/sitemap.xml"),
                urljoin(base_url, "/sitemap_index.xml"),
                urljoin(base_url, "/sitemaps.xml"),
            ]
            
            for sitemap_url in sitemap_urls:
                try:
                    urls = await self._parse_sitemap(sitemap_url)
                    if urls:
                        logger.info(
                            "Found sitemap URLs",
                            sitemap_url=sitemap_url,
                            url_count=len(urls)
                        )
                        return urls
                except Exception as e:
                    logger.debug(
                        "Failed to parse sitemap",
                        sitemap_url=sitemap_url,
                        error=str(e)
                    )
                    continue
            
            # Try robots.txt for sitemap location
            robots_url = urljoin(base_url, "/robots.txt")
            try:
                sitemap_urls_from_robots = await self._get_sitemap_from_robots(robots_url)
                for sitemap_url in sitemap_urls_from_robots:
                    try:
                        urls = await self._parse_sitemap(sitemap_url)
                        if urls:
                            logger.info(
                                "Found sitemap URLs from robots.txt",
                                sitemap_url=sitemap_url,
                                url_count=len(urls)
                            )
                            return urls
                    except Exception as e:
                        logger.debug(
                            "Failed to parse sitemap from robots.txt",
                            sitemap_url=sitemap_url,
                            error=str(e)
                        )
                        continue
            except Exception as e:
                logger.debug(
                    "Failed to get sitemap from robots.txt",
                    robots_url=robots_url,
                    error=str(e)
                )
            
            logger.info("No sitemap found", base_url=base_url)
            return []
            
        except Exception as e:
            logger.error(
                "Failed to get sitemap URLs",
                base_url=base_url,
                error=str(e),
                exc_info=True
            )
            return []
    
    async def _parse_sitemap(self, sitemap_url: str) -> List[str]:
        """
        Parse XML sitemap.
        
        Args:
            sitemap_url: URL of sitemap to parse
            
        Returns:
            List of URLs from sitemap
        """
        try:
            # Validate URL security
            await self.security_validator.validate_url(sitemap_url)
            
            # Fetch sitemap content
            content_data = await self.fetcher.fetch_url(sitemap_url)
            if not content_data:
                return []
            
            content = content_data.get("content", "")
            if not content:
                return []
            
            # Parse XML
            root = ET.fromstring(content)
            
            # Handle sitemap index
            if root.tag.endswith("sitemapindex"):
                return await self._parse_sitemap_index(root, sitemap_url)
            
            # Handle regular sitemap
            elif root.tag.endswith("urlset"):
                return self._parse_urlset(root)
            
            else:
                logger.warning("Unknown sitemap format", sitemap_url=sitemap_url)
                return []
                
        except ET.ParseError as e:
            logger.warning("Failed to parse sitemap XML", sitemap_url=sitemap_url, error=str(e))
            return []
        except Exception as e:
            logger.warning("Failed to parse sitemap", sitemap_url=sitemap_url, error=str(e))
            return []
    
    async def _parse_sitemap_index(self, root: ET.Element, base_sitemap_url: str) -> List[str]:
        """
        Parse sitemap index.
        
        Args:
            root: XML root element
            base_sitemap_url: Base sitemap URL for resolving relative URLs
            
        Returns:
            List of URLs from all sitemaps
        """
        urls = []
        
        for sitemap_elem in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}sitemap"):
            loc_elem = sitemap_elem.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
            if loc_elem is not None and loc_elem.text:
                sitemap_url = urljoin(base_sitemap_url, loc_elem.text.strip())
                try:
                    sitemap_urls = await self._parse_sitemap(sitemap_url)
                    urls.extend(sitemap_urls)
                except Exception as e:
                    logger.debug(
                        "Failed to parse sitemap from index",
                        sitemap_url=sitemap_url,
                        error=str(e)
                    )
        
        return urls
    
    def _parse_urlset(self, root: ET.Element) -> List[str]:
        """
        Parse URL set from sitemap.
        
        Args:
            root: XML root element
            
        Returns:
            List of URLs
        """
        urls = []
        
        for url_elem in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
            loc_elem = url_elem.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
            if loc_elem is not None and loc_elem.text:
                url = loc_elem.text.strip()
                if url:
                    urls.append(url)
        
        return urls
    
    async def _get_sitemap_from_robots(self, robots_url: str) -> List[str]:
        """
        Get sitemap URLs from robots.txt.
        
        Args:
            robots_url: URL of robots.txt file
            
        Returns:
            List of sitemap URLs
        """
        try:
            # Validate URL security
            await self.security_validator.validate_url(robots_url)
            
            # Fetch robots.txt content
            content_data = await self.fetcher.fetch_url(robots_url)
            if not content_data:
                return []
            
            content = content_data.get("content", "")
            if not content:
                return []
            
            sitemap_urls = []
            for line in content.splitlines():
                line = line.strip()
                if line.lower().startswith("sitemap:"):
                    sitemap_url = line[8:].strip()
                    if sitemap_url:
                        sitemap_urls.append(sitemap_url)
            
            return sitemap_urls
            
        except Exception as e:
            logger.debug("Failed to get sitemap from robots.txt", robots_url=robots_url, error=str(e))
            return []

"""
HTML content parser for SEO analysis.
"""

import re
from typing import Dict, Any, List, Optional
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, Comment
import structlog

logger = structlog.get_logger(__name__)


class Parser:
    """HTML content parser for SEO analysis."""
    
    def __init__(self):
        self.soup = None
    
    async def parse_content(self, content_data: Dict[str, Any], base_url: str) -> Dict[str, Any]:
        """
        Parse HTML content for SEO analysis.
        
        Args:
            content_data: Content data from fetcher
            base_url: Base URL for resolving relative links
            
        Returns:
            Dict containing parsed SEO data
        """
        try:
            content = content_data.get("content", "")
            if not content:
                return {}
            
            self.soup = BeautifulSoup(content, "lxml")
            
            # Extract basic page information
            parsed_data = {
                "url": content_data.get("url", base_url),
                "final_url": content_data.get("final_url", base_url),
                "status_code": content_data.get("status_code", 200),
                "content_type": content_data.get("content_type", ""),
                "content_length": content_data.get("content_length", 0),
            }
            
            # Extract meta information
            parsed_data.update(self._extract_meta_tags())
            
            # Extract headings
            parsed_data.update(self._extract_headings())
            
            # Extract links
            parsed_data.update(self._extract_links(base_url))
            
            # Extract images
            parsed_data.update(self._extract_images())
            
            # Extract text content
            parsed_data.update(self._extract_text_content())
            
            # Extract structured data
            parsed_data.update(self._extract_structured_data())
            
            # Extract technical elements
            parsed_data.update(self._extract_technical_elements())
            
            logger.info(
                "Content parsed successfully",
                url=base_url,
                title=parsed_data.get("title", ""),
                word_count=parsed_data.get("word_count", 0)
            )
            
            return parsed_data
            
        except Exception as e:
            logger.error(
                "Failed to parse content",
                url=base_url,
                error=str(e),
                exc_info=True
            )
            return {"url": base_url, "error": str(e)}
    
    def _extract_meta_tags(self) -> Dict[str, Any]:
        """Extract meta tags and page title."""
        meta_data = {}
        
        # Page title
        title_tag = self.soup.find("title")
        meta_data["title"] = title_tag.get_text().strip() if title_tag else ""
        
        # Meta description
        meta_desc = self.soup.find("meta", attrs={"name": "description"})
        meta_data["meta_description"] = meta_desc.get("content", "").strip() if meta_desc else ""
        
        # Meta keywords
        meta_keywords = self.soup.find("meta", attrs={"name": "keywords"})
        meta_data["meta_keywords"] = meta_keywords.get("content", "").strip() if meta_keywords else ""
        
        # Canonical URL
        canonical = self.soup.find("link", attrs={"rel": "canonical"})
        meta_data["canonical_url"] = canonical.get("href", "").strip() if canonical else ""
        
        # Robots meta
        robots_meta = self.soup.find("meta", attrs={"name": "robots"})
        meta_data["robots_meta"] = robots_meta.get("content", "").strip() if robots_meta else ""
        
        # Open Graph tags
        og_title = self.soup.find("meta", attrs={"property": "og:title"})
        meta_data["og_title"] = og_title.get("content", "").strip() if og_title else ""
        
        og_description = self.soup.find("meta", attrs={"property": "og:description"})
        meta_data["og_description"] = og_description.get("content", "").strip() if og_description else ""
        
        og_image = self.soup.find("meta", attrs={"property": "og:image"})
        meta_data["og_image"] = og_image.get("content", "").strip() if og_image else ""
        
        # Twitter Card tags
        twitter_title = self.soup.find("meta", attrs={"name": "twitter:title"})
        meta_data["twitter_title"] = twitter_title.get("content", "").strip() if twitter_title else ""
        
        twitter_description = self.soup.find("meta", attrs={"name": "twitter:description"})
        meta_data["twitter_description"] = twitter_description.get("content", "").strip() if twitter_description else ""
        
        return meta_data
    
    def _extract_headings(self) -> Dict[str, Any]:
        """Extract heading tags."""
        headings = {}
        
        for level in range(1, 7):
            heading_tags = self.soup.find_all(f"h{level}")
            headings[f"h{level}_tags"] = [
                {
                    "text": tag.get_text().strip(),
                    "id": tag.get("id", ""),
                    "class": " ".join(tag.get("class", [])),
                }
                for tag in heading_tags
            ]
        
        return headings
    
    def _extract_links(self, base_url: str) -> Dict[str, Any]:
        """Extract internal and external links."""
        links = self.soup.find_all("a", href=True)
        
        internal_links = []
        external_links = []
        
        base_domain = urlparse(base_url).netloc
        
        for link in links:
            href = link.get("href", "").strip()
            if not href:
                continue
            
            # Resolve relative URLs
            absolute_url = urljoin(base_url, href)
            link_domain = urlparse(absolute_url).netloc
            
            link_data = {
                "url": absolute_url,
                "text": link.get_text().strip(),
                "title": link.get("title", "").strip(),
                "rel": link.get("rel", []),
                "target": link.get("target", "").strip(),
            }
            
            if link_domain == base_domain:
                internal_links.append(link_data)
            else:
                external_links.append(link_data)
        
        return {
            "internal_links": internal_links,
            "external_links": external_links,
            "total_links": len(internal_links) + len(external_links),
        }
    
    def _extract_images(self) -> Dict[str, Any]:
        """Extract image information."""
        images = self.soup.find_all("img")
        
        image_data = []
        for img in images:
            image_data.append({
                "src": img.get("src", "").strip(),
                "alt": img.get("alt", "").strip(),
                "title": img.get("title", "").strip(),
                "width": img.get("width", "").strip(),
                "height": img.get("height", "").strip(),
                "loading": img.get("loading", "").strip(),
            })
        
        return {
            "images": image_data,
            "images_without_alt": len([img for img in image_data if not img["alt"]]),
            "images_without_src": len([img for img in image_data if not img["src"]]),
        }
    
    def _extract_text_content(self) -> Dict[str, Any]:
        """Extract text content and word count."""
        # Remove script and style elements
        for script in self.soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = self.soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = " ".join(chunk for chunk in chunks if chunk)
        
        # Count words
        words = re.findall(r"\b\w+\b", text.lower())
        word_count = len(words)
        
        # Count sentences
        sentences = re.split(r"[.!?]+", text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # Calculate readability metrics
        avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
        
        return {
            "text_content": text,
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_words_per_sentence": round(avg_words_per_sentence, 2),
        }
    
    def _extract_structured_data(self) -> Dict[str, Any]:
        """Extract structured data (JSON-LD, microdata, etc.)."""
        structured_data = []
        
        # JSON-LD
        json_ld_scripts = self.soup.find_all("script", type="application/ld+json")
        for script in json_ld_scripts:
            try:
                import json
                data = json.loads(script.string)
                structured_data.append({
                    "type": "json-ld",
                    "data": data,
                })
            except (json.JSONDecodeError, TypeError):
                continue
        
        # Microdata
        microdata_items = self.soup.find_all(attrs={"itemscope": True})
        microdata_count = len(microdata_items)
        
        return {
            "structured_data": structured_data,
            "microdata_items": microdata_count,
            "has_json_ld": len(json_ld_scripts) > 0,
            "has_microdata": microdata_count > 0,
        }
    
    def _extract_technical_elements(self) -> Dict[str, Any]:
        """Extract technical SEO elements."""
        # Language
        html_tag = self.soup.find("html")
        lang = html_tag.get("lang", "").strip() if html_tag else ""
        
        # Viewport meta
        viewport = self.soup.find("meta", attrs={"name": "viewport"})
        viewport_content = viewport.get("content", "").strip() if viewport else ""
        
        # Charset
        charset = self.soup.find("meta", attrs={"charset": True})
        charset_value = charset.get("charset", "").strip() if charset else ""
        
        # Favicon
        favicon = self.soup.find("link", attrs={"rel": "icon"})
        favicon_url = favicon.get("href", "").strip() if favicon else ""
        
        # Forms
        forms = self.soup.find_all("form")
        form_count = len(forms)
        
        return {
            "html_lang": lang,
            "viewport": viewport_content,
            "charset": charset_value,
            "favicon": favicon_url,
            "form_count": form_count,
        }

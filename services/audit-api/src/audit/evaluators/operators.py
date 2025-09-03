"""
SEO rule evaluators for different types of checks.
"""

import re
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
import structlog

logger = structlog.get_logger(__name__)


class BaseEvaluator(ABC):
    """Base class for SEO rule evaluators."""
    
    @abstractmethod
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate rule against parsed content.
        
        Args:
            parsed_content: List of parsed content data
            rule: Rule definition
            
        Returns:
            Evaluation result
        """
        pass


class TitleTagExistsEvaluator(BaseEvaluator):
    """Evaluator for title tag existence."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has a title tag."""
        main_content = parsed_content[0] if parsed_content else {}
        title = main_content.get("title", "").strip()
        
        if title:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Title tag found: '{title[:50]}{'...' if len(title) > 50 else ''}'",
                "evidence": title,
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No title tag found",
                "evidence": "No title tag present in HTML",
            }


class MetaDescriptionExistsEvaluator(BaseEvaluator):
    """Evaluator for meta description existence."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has a meta description."""
        main_content = parsed_content[0] if parsed_content else {}
        meta_description = main_content.get("meta_description", "").strip()
        
        if meta_description:
            length = len(meta_description)
            if 120 <= length <= 160:
                return {
                    "status": "pass",
                    "score": rule.get("pass_score", 100),
                    "message": f"Meta description found ({length} characters)",
                    "evidence": meta_description,
                }
            else:
                return {
                    "status": "warning",
                    "score": 70,
                    "message": f"Meta description found but length is {length} characters (recommended: 120-160)",
                    "evidence": meta_description,
                }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No meta description found",
                "evidence": "No meta description tag present in HTML",
            }


class H1TagCountEvaluator(BaseEvaluator):
    """Evaluator for H1 tag count."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has exactly one H1 tag."""
        main_content = parsed_content[0] if parsed_content else {}
        h1_tags = main_content.get("h1_tags", [])
        h1_count = len(h1_tags)
        
        if h1_count == 1:
            h1_text = h1_tags[0].get("text", "").strip()
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Exactly one H1 tag found: '{h1_text}'",
                "evidence": h1_text,
            }
        elif h1_count == 0:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No H1 tag found",
                "evidence": "No H1 tags present in HTML",
            }
        else:
            h1_texts = [tag.get("text", "").strip() for tag in h1_tags]
            return {
                "status": "warning",
                "score": 50,
                "message": f"Multiple H1 tags found ({h1_count})",
                "evidence": "; ".join(h1_texts),
            }


class ImagesHaveAltEvaluator(BaseEvaluator):
    """Evaluator for image alt text."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if images have alt text."""
        main_content = parsed_content[0] if parsed_content else {}
        images = main_content.get("images", [])
        
        if not images:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": "No images found on page",
                "evidence": "No images present",
            }
        
        images_without_alt = main_content.get("images_without_alt", 0)
        total_images = len(images)
        
        if images_without_alt == 0:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"All {total_images} images have alt text",
                "evidence": f"{total_images} images with alt text",
            }
        else:
            percentage = ((total_images - images_without_alt) / total_images) * 100
            return {
                "status": "warning" if percentage >= 80 else "fail",
                "score": int(percentage),
                "message": f"{images_without_alt} of {total_images} images missing alt text ({percentage:.1f}% have alt text)",
                "evidence": f"{images_without_alt} images without alt text",
            }


class HasInternalLinksEvaluator(BaseEvaluator):
    """Evaluator for internal links."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has internal links."""
        main_content = parsed_content[0] if parsed_content else {}
        internal_links = main_content.get("internal_links", [])
        internal_count = len(internal_links)
        
        if internal_count > 0:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Found {internal_count} internal links",
                "evidence": f"{internal_count} internal links found",
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No internal links found",
                "evidence": "No internal links present on page",
            }


class CanonicalUrlExistsEvaluator(BaseEvaluator):
    """Evaluator for canonical URL."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has canonical URL."""
        main_content = parsed_content[0] if parsed_content else {}
        canonical_url = main_content.get("canonical_url", "").strip()
        
        if canonical_url:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Canonical URL found: {canonical_url}",
                "evidence": canonical_url,
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No canonical URL found",
                "evidence": "No canonical link tag present in HTML",
            }


class RobotsMetaExistsEvaluator(BaseEvaluator):
    """Evaluator for robots meta tag."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has robots meta tag."""
        main_content = parsed_content[0] if parsed_content else {}
        robots_meta = main_content.get("robots_meta", "").strip()
        
        if robots_meta:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Robots meta tag found: {robots_meta}",
                "evidence": robots_meta,
            }
        else:
            return {
                "status": "warning",
                "score": 70,
                "message": "No robots meta tag found (using default behavior)",
                "evidence": "No robots meta tag present",
            }


class ViewportMetaExistsEvaluator(BaseEvaluator):
    """Evaluator for viewport meta tag."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has viewport meta tag."""
        main_content = parsed_content[0] if parsed_content else {}
        viewport = main_content.get("viewport", "").strip()
        
        if viewport:
            if "width=device-width" in viewport:
                return {
                    "status": "pass",
                    "score": rule.get("pass_score", 100),
                    "message": f"Viewport meta tag found: {viewport}",
                    "evidence": viewport,
                }
            else:
                return {
                    "status": "warning",
                    "score": 70,
                    "message": f"Viewport meta tag found but missing width=device-width: {viewport}",
                    "evidence": viewport,
                }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No viewport meta tag found",
                "evidence": "No viewport meta tag present",
            }


class HtmlLangExistsEvaluator(BaseEvaluator):
    """Evaluator for HTML lang attribute."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if HTML tag has lang attribute."""
        main_content = parsed_content[0] if parsed_content else {}
        html_lang = main_content.get("html_lang", "").strip()
        
        if html_lang:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"HTML lang attribute found: {html_lang}",
                "evidence": html_lang,
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No HTML lang attribute found",
                "evidence": "No lang attribute on HTML tag",
            }


class CharsetMetaExistsEvaluator(BaseEvaluator):
    """Evaluator for charset meta tag."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has charset meta tag."""
        main_content = parsed_content[0] if parsed_content else {}
        charset = main_content.get("charset", "").strip()
        
        if charset:
            if charset.lower() in ["utf-8", "utf8"]:
                return {
                    "status": "pass",
                    "score": rule.get("pass_score", 100),
                    "message": f"Charset meta tag found: {charset}",
                    "evidence": charset,
                }
            else:
                return {
                    "status": "warning",
                    "score": 70,
                    "message": f"Charset meta tag found but not UTF-8: {charset}",
                    "evidence": charset,
                }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": "No charset meta tag found",
                "evidence": "No charset meta tag present",
            }


class SufficientWordCountEvaluator(BaseEvaluator):
    """Evaluator for content length."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has sufficient content."""
        main_content = parsed_content[0] if parsed_content else {}
        word_count = main_content.get("word_count", 0)
        
        if word_count >= 300:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Sufficient content found ({word_count} words)",
                "evidence": f"{word_count} words",
            }
        elif word_count >= 150:
            return {
                "status": "warning",
                "score": 70,
                "message": f"Content length is acceptable but could be longer ({word_count} words)",
                "evidence": f"{word_count} words",
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": f"Insufficient content ({word_count} words, minimum 300 recommended)",
                "evidence": f"{word_count} words",
            }


class ProperHeadingStructureEvaluator(BaseEvaluator):
    """Evaluator for heading structure."""
    
    async def evaluate(self, parsed_content: List[Dict[str, Any]], rule: Dict[str, Any]) -> Dict[str, Any]:
        """Check if page has proper heading hierarchy."""
        main_content = parsed_content[0] if parsed_content else {}
        
        h1_tags = main_content.get("h1_tags", [])
        h2_tags = main_content.get("h2_tags", [])
        h3_tags = main_content.get("h3_tags", [])
        
        h1_count = len(h1_tags)
        h2_count = len(h2_tags)
        h3_count = len(h3_tags)
        
        if h1_count == 1 and h2_count > 0:
            return {
                "status": "pass",
                "score": rule.get("pass_score", 100),
                "message": f"Good heading structure: 1 H1, {h2_count} H2, {h3_count} H3",
                "evidence": f"H1: {h1_count}, H2: {h2_count}, H3: {h3_count}",
            }
        elif h1_count == 1:
            return {
                "status": "warning",
                "score": 70,
                "message": f"Has H1 but no H2 tags for structure ({h2_count} H2, {h3_count} H3)",
                "evidence": f"H1: {h1_count}, H2: {h2_count}, H3: {h3_count}",
            }
        else:
            return {
                "status": "fail",
                "score": rule.get("fail_score", 0),
                "message": f"Poor heading structure: {h1_count} H1, {h2_count} H2, {h3_count} H3",
                "evidence": f"H1: {h1_count}, H2: {h2_count}, H3: {h3_count}",
            }


class EvaluatorRegistry:
    """Registry for SEO rule evaluators."""
    
    def __init__(self):
        self.evaluators = {
            "title_tag_exists": TitleTagExistsEvaluator(),
            "meta_description_exists": MetaDescriptionExistsEvaluator(),
            "h1_tag_count": H1TagCountEvaluator(),
            "images_have_alt": ImagesHaveAltEvaluator(),
            "has_internal_links": HasInternalLinksEvaluator(),
            "canonical_url_exists": CanonicalUrlExistsEvaluator(),
            "robots_meta_exists": RobotsMetaExistsEvaluator(),
            "viewport_meta_exists": ViewportMetaExistsEvaluator(),
            "html_lang_exists": HtmlLangExistsEvaluator(),
            "charset_meta_exists": CharsetMetaExistsEvaluator(),
            "sufficient_word_count": SufficientWordCountEvaluator(),
            "proper_heading_structure": ProperHeadingStructureEvaluator(),
        }
    
    def get_evaluator(self, name: str) -> Optional[BaseEvaluator]:
        """Get evaluator by name."""
        return self.evaluators.get(name)
    
    def register_evaluator(self, name: str, evaluator: BaseEvaluator):
        """Register a new evaluator."""
        self.evaluators[name] = evaluator

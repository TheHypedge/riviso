"""
PageSpeed Insights provider for performance metrics.
"""

from typing import Dict, Any, Optional
import structlog

logger = structlog.get_logger(__name__)


class PageSpeedInsightsProvider:
    """Provider for Google PageSpeed Insights API."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    
    async def get_metrics(self, url: str, strategy: str = "mobile") -> Dict[str, Any]:
        """
        Get PageSpeed Insights metrics for a URL.
        
        Args:
            url: URL to analyze
            strategy: Analysis strategy (mobile or desktop)
            
        Returns:
            Dict containing performance metrics
        """
        if not self.api_key:
            logger.warning("PageSpeed Insights API key not configured")
            return self._get_mock_metrics()
        
        try:
            import aiohttp
            
            params = {
                "url": url,
                "key": self.api_key,
                "strategy": strategy,
                "category": ["performance", "accessibility", "best-practices", "seo"]
            }
            
            logger.info("Fetching PageSpeed Insights data", url=url)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        logger.info("PageSpeed Insights data fetched successfully", url=url)
                        return self._extract_metrics(data)
                    else:
                        logger.warning("PageSpeed Insights API error", url=url, status=response.status)
                        return self._get_mock_metrics()
            
        except Exception as e:
            logger.error("PageSpeed Insights API error", url=url, error=str(e))
            return self._get_mock_metrics()
    
    def _extract_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract metrics from PageSpeed Insights API response."""
        try:
            lighthouse_result = data.get("lighthouseResult", {})
            audits = lighthouse_result.get("audits", {})
            categories = lighthouse_result.get("categories", {})
            
            # Core Web Vitals
            lcp = audits.get("largest-contentful-paint", {}).get("numericValue", 0) / 1000
            fcp = audits.get("first-contentful-paint", {}).get("numericValue", 0) / 1000
            cls = audits.get("cumulative-layout-shift", {}).get("numericValue", 0)
            fid = audits.get("max-potential-fid", {}).get("numericValue", 0)
            tti = audits.get("interactive", {}).get("numericValue", 0) / 1000
            
            # All category scores
            performance_score = categories.get("performance", {}).get("score", 0) * 100
            accessibility_score = categories.get("accessibility", {}).get("score", 0) * 100
            best_practices_score = categories.get("best-practices", {}).get("score", 0) * 100
            seo_score = categories.get("seo", {}).get("score", 0) * 100
            
            return {
                "performance_score": round(performance_score),
                "accessibility_score": round(accessibility_score),
                "best_practices_score": round(best_practices_score),
                "seo_score": round(seo_score),
                "first_contentful_paint": round(fcp, 2),
                "largest_contentful_paint": round(lcp, 2),
                "cumulative_layout_shift": round(cls, 3),
                "first_input_delay": round(fid, 0),
                "time_to_interactive": round(tti, 2),
                "total_blocking_time": audits.get("total-blocking-time", {}).get("numericValue", 0),
                "speed_index": audits.get("speed-index", {}).get("numericValue", 0) / 1000,
                "data_source": "Google PageSpeed Insights API"
            }
        except Exception as e:
            logger.error("Error extracting PageSpeed metrics", error=str(e))
            return self._get_mock_metrics()
    
    def _get_mock_metrics(self) -> Dict[str, Any]:
        """Get mock performance metrics for development."""
        return {
            "performance_score": 85,
            "accessibility_score": 92,
            "best_practices_score": 88,
            "seo_score": 95,
            "first_contentful_paint": 1.2,
            "largest_contentful_paint": 2.1,
            "cumulative_layout_shift": 0.05,
            "first_input_delay": 45,
            "total_blocking_time": 150,
            "speed_index": 1.8,
            "time_to_interactive": 2.5,
        }

"""
PageSpeed Insights provider for performance metrics.
"""

from typing import Dict, Any, Optional
import structlog
from config import settings

logger = structlog.get_logger(__name__)


class PageSpeedInsightsProvider:
    """Provider for Google PageSpeed Insights API."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.pagespeed_api_key
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
        """Extract comprehensive metrics from PageSpeed Insights API response."""
        try:
            lighthouse_result = data.get("lighthouseResult", {})
            audits = lighthouse_result.get("audits", {})
            categories = lighthouse_result.get("categories", {})
            config_settings = lighthouse_result.get("configSettings", {})
            
            # Core Web Vitals
            lcp_audit = audits.get("largest-contentful-paint", {})
            fcp_audit = audits.get("first-contentful-paint", {})
            cls_audit = audits.get("cumulative-layout-shift", {})
            fid_audit = audits.get("max-potential-fid", {})
            tti_audit = audits.get("interactive", {})
            
            lcp = lcp_audit.get("numericValue", 0) / 1000
            fcp = fcp_audit.get("numericValue", 0) / 1000
            cls = cls_audit.get("numericValue", 0)
            fid = fid_audit.get("numericValue", 0)
            tti = tti_audit.get("numericValue", 0) / 1000
            
            # All category scores
            performance_score = categories.get("performance", {}).get("score", 0) * 100
            accessibility_score = categories.get("accessibility", {}).get("score", 0) * 100
            best_practices_score = categories.get("best-practices", {}).get("score", 0) * 100
            seo_score = categories.get("seo", {}).get("score", 0) * 100
            
            # Additional performance metrics
            tbt = audits.get("total-blocking-time", {}).get("numericValue", 0)
            speed_index = audits.get("speed-index", {}).get("numericValue", 0) / 1000
            fmp = audits.get("first-meaningful-paint", {}).get("numericValue", 0) / 1000
            lcp_score = lcp_audit.get("score", 0)
            fcp_score = fcp_audit.get("score", 0)
            cls_score = cls_audit.get("score", 0)
            fid_score = fid_audit.get("score", 0)
            
            # Resource metrics
            resource_metrics = {
                "total_byte_weight": audits.get("total-byte-weight", {}).get("numericValue", 0),
                "unused_css_rules": audits.get("unused-css-rules", {}).get("numericValue", 0),
                "unused_javascript": audits.get("unused-javascript", {}).get("numericValue", 0),
                "render_blocking_resources": audits.get("render-blocking-resources", {}).get("numericValue", 0),
                "efficient_animated_content": audits.get("efficient-animated-content", {}).get("numericValue", 0),
            }
            
            # Opportunities and diagnostics
            opportunities = []
            diagnostics = []
            
            for audit_id, audit_data in audits.items():
                if audit_data.get("score") is not None and audit_data.get("score") < 1:
                    if audit_data.get("details", {}).get("type") == "opportunity":
                        opportunities.append({
                            "id": audit_id,
                            "title": audit_data.get("title", ""),
                            "description": audit_data.get("description", ""),
                            "score": audit_data.get("score", 0),
                            "numericValue": audit_data.get("numericValue", 0),
                            "displayValue": audit_data.get("displayValue", ""),
                            "wastedMs": audit_data.get("details", {}).get("overallSavingsMs", 0)
                        })
                    elif audit_data.get("details", {}).get("type") == "diagnostic":
                        diagnostics.append({
                            "id": audit_id,
                            "title": audit_data.get("title", ""),
                            "description": audit_data.get("description", ""),
                            "score": audit_data.get("score", 0),
                            "displayValue": audit_data.get("displayValue", "")
                        })
            
            return {
                # Category Scores
                "performance_score": round(performance_score),
                "accessibility_score": round(accessibility_score),
                "best_practices_score": round(best_practices_score),
                "seo_score": round(seo_score),
                
                # Core Web Vitals
                "first_contentful_paint": round(fcp, 2),
                "largest_contentful_paint": round(lcp, 2),
                "cumulative_layout_shift": round(cls, 3),
                "first_input_delay": round(fid, 0),
                "time_to_interactive": round(tti, 2),
                
                # Additional Performance Metrics
                "total_blocking_time": round(tbt, 0),
                "speed_index": round(speed_index, 2),
                "first_meaningful_paint": round(fmp, 2),
                
                # Core Web Vitals Scores
                "lcp_score": lcp_score,
                "fcp_score": fcp_score,
                "cls_score": cls_score,
                "fid_score": fid_score,
                
                # Display Values
                "display_values": {
                    "first_contentful_paint": fcp_audit.get("displayValue", "N/A"),
                    "largest_contentful_paint": lcp_audit.get("displayValue", "N/A"),
                    "cumulative_layout_shift": cls_audit.get("displayValue", "N/A"),
                    "first_input_delay": fid_audit.get("displayValue", "N/A"),
                    "total_blocking_time": audits.get("total-blocking-time", {}).get("displayValue", "N/A"),
                    "speed_index": audits.get("speed-index", {}).get("displayValue", "N/A"),
                    "time_to_interactive": tti_audit.get("displayValue", "N/A"),
                    "first_meaningful_paint": audits.get("first-meaningful-paint", {}).get("displayValue", "N/A")
                },
                
                # Resource Metrics
                "resource_metrics": resource_metrics,
                
                # Opportunities and Diagnostics
                "opportunities": opportunities[:10],  # Top 10 opportunities
                "diagnostics": diagnostics[:10],     # Top 10 diagnostics
                
                # Metadata
                "strategy": config_settings.get("formFactor", "unknown"),
                "data_source": "Google PageSpeed Insights API",
                "fetch_time": lighthouse_result.get("fetchTime", ""),
                "final_url": lighthouse_result.get("finalUrl", ""),
                "requested_url": lighthouse_result.get("requestedUrl", "")
            }
        except Exception as e:
            logger.error("Error extracting PageSpeed metrics", error=str(e))
            return self._get_mock_metrics()
    
    def _get_mock_metrics(self) -> Dict[str, Any]:
        """Get mock performance metrics for development."""
        return {
            # Category Scores
            "performance_score": 85,
            "accessibility_score": 92,
            "best_practices_score": 88,
            "seo_score": 95,
            
            # Core Web Vitals
            "first_contentful_paint": 1.2,
            "largest_contentful_paint": 2.1,
            "cumulative_layout_shift": 0.05,
            "first_input_delay": 45,
            "time_to_interactive": 2.5,
            
            # Additional Performance Metrics
            "total_blocking_time": 150,
            "speed_index": 1.8,
            "first_meaningful_paint": 1.5,
            
            # Core Web Vitals Scores
            "lcp_score": 0.9,
            "fcp_score": 0.95,
            "cls_score": 0.8,
            "fid_score": 0.85,
            
            # Display Values
            "display_values": {
                "first_contentful_paint": "1.2 s",
                "largest_contentful_paint": "2.1 s",
                "cumulative_layout_shift": "0.05",
                "first_input_delay": "45 ms",
                "total_blocking_time": "150 ms",
                "speed_index": "1.8 s",
                "time_to_interactive": "2.5 s",
                "first_meaningful_paint": "1.5 s"
            },
            
            # Resource Metrics
            "resource_metrics": {
                "total_byte_weight": 1024000,
                "unused_css_rules": 15000,
                "unused_javascript": 25000,
                "render_blocking_resources": 200,
                "efficient_animated_content": 0
            },
            
            # Opportunities and Diagnostics
            "opportunities": [
                {
                    "id": "unused-css-rules",
                    "title": "Remove unused CSS",
                    "description": "Remove unused CSS to reduce bytes of network activity.",
                    "score": 0.3,
                    "numericValue": 15000,
                    "displayValue": "15 kB",
                    "wastedMs": 200
                }
            ],
            "diagnostics": [
                {
                    "id": "render-blocking-resources",
                    "title": "Eliminate render-blocking resources",
                    "description": "Resources are blocking the first paint of your page.",
                    "score": 0.6,
                    "displayValue": "2 resources"
                }
            ],
            
            # Metadata
            "strategy": "mobile",
            "data_source": "Mock Data",
            "fetch_time": "2024-01-01T00:00:00.000Z",
            "final_url": "https://example.com",
            "requested_url": "https://example.com"
        }

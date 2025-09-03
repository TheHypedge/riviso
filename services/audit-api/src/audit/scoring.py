"""
Scoring engine for SEO audit results.
"""

from typing import Dict, Any, List
import structlog

logger = structlog.get_logger(__name__)


class ScoringEngine:
    """Scoring engine for calculating SEO scores and generating recommendations."""
    
    def calculate_scores(self, rules_results: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Calculate overall scores from rule results.
        
        Args:
            rules_results: List of rule evaluation results
            
        Returns:
            Dict containing calculated scores
        """
        if not rules_results:
            return {"overall": 0, "on_page": 0, "technical": 0, "content": 0}
        
        # Group rules by category
        categories = {
            "on_page": [],
            "technical": [],
            "content": [],
        }
        
        for rule in rules_results:
            category = rule.get("category", "on_page")
            if category in categories:
                categories[category].append(rule)
        
        # Calculate category scores
        category_scores = {}
        for category, rules in categories.items():
            if rules:
                category_scores[category] = self._calculate_category_score(rules)
            else:
                category_scores[category] = 0
        
        # Calculate overall score (weighted average)
        overall_score = self._calculate_overall_score(category_scores)
        
        return {
            "overall": overall_score,
            "on_page": category_scores.get("on_page", 0),
            "technical": category_scores.get("technical", 0),
            "content": category_scores.get("content", 0),
        }
    
    def _calculate_category_score(self, rules: List[Dict[str, Any]]) -> int:
        """
        Calculate score for a specific category.
        
        Args:
            rules: List of rules in the category
            
        Returns:
            Category score (0-100)
        """
        if not rules:
            return 0
        
        total_weight = 0
        weighted_score = 0
        
        for rule in rules:
            weight = rule.get("weight", 1)
            score = rule.get("score", 0)
            
            total_weight += weight
            weighted_score += score * weight
        
        if total_weight == 0:
            return 0
        
        return int(weighted_score / total_weight)
    
    def _calculate_overall_score(self, category_scores: Dict[str, int]) -> int:
        """
        Calculate overall score from category scores.
        
        Args:
            category_scores: Dict of category scores
            
        Returns:
            Overall score (0-100)
        """
        # Weight categories for overall score
        weights = {
            "on_page": 0.4,    # 40% weight
            "technical": 0.4,  # 40% weight
            "content": 0.2,    # 20% weight
        }
        
        total_weight = 0
        weighted_score = 0
        
        for category, score in category_scores.items():
            weight = weights.get(category, 0)
            total_weight += weight
            weighted_score += score * weight
        
        if total_weight == 0:
            return 0
        
        return int(weighted_score / total_weight)
    
    def get_top_fixes(self, rules_results: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get top priority fixes from rule results.
        
        Args:
            rules_results: List of rule evaluation results
            limit: Maximum number of fixes to return
            
        Returns:
            List of top priority fixes
        """
        # Filter failed and warning rules
        failed_rules = [
            rule for rule in rules_results
            if rule.get("status") in ["fail", "warning"]
        ]
        
        # Sort by impact (weight * (100 - score))
        def calculate_impact(rule):
            weight = rule.get("weight", 1)
            score = rule.get("score", 0)
            return weight * (100 - score)
        
        failed_rules.sort(key=calculate_impact, reverse=True)
        
        # Convert to fix format
        fixes = []
        for rule in failed_rules[:limit]:
            impact = self._determine_impact(rule)
            fix = {
                "rule_id": rule.get("id"),
                "title": rule.get("name"),
                "impact": impact,
                "description": self._generate_fix_description(rule),
            }
            fixes.append(fix)
        
        return fixes
    
    def _determine_impact(self, rule: Dict[str, Any]) -> str:
        """
        Determine impact level for a rule.
        
        Args:
            rule: Rule result
            
        Returns:
            Impact level: "high", "medium", or "low"
        """
        weight = rule.get("weight", 1)
        score = rule.get("score", 0)
        
        # High impact: high weight and low score
        if weight >= 8 and score < 50:
            return "high"
        
        # Medium impact: medium weight or medium score
        if weight >= 5 or score < 70:
            return "medium"
        
        # Low impact: everything else
        return "low"
    
    def _generate_fix_description(self, rule: Dict[str, Any]) -> str:
        """
        Generate fix description for a rule.
        
        Args:
            rule: Rule result
            
        Returns:
            Fix description
        """
        rule_id = rule.get("id")
        message = rule.get("message", "")
        
        # Custom descriptions for specific rules
        descriptions = {
            "title_tag": "Add a descriptive title tag to your page. The title should be 50-60 characters and include your target keyword.",
            "meta_description": "Add a meta description tag to your page. It should be 120-160 characters and summarize the page content.",
            "h1_tag": "Add exactly one H1 tag to your page. The H1 should contain your main keyword and describe the page content.",
            "images_alt_text": "Add alt text to all images on your page. Alt text helps search engines understand image content and improves accessibility.",
            "internal_links": "Add internal links to other relevant pages on your website. This helps with site navigation and SEO.",
            "canonical_url": "Add a canonical URL tag to prevent duplicate content issues. This tells search engines which version of the page is the original.",
            "robots_meta": "Add a robots meta tag to control how search engines crawl and index your page.",
            "viewport_meta": "Add a viewport meta tag for mobile optimization. This ensures your page displays correctly on mobile devices.",
            "html_lang": "Add a lang attribute to your HTML tag to specify the page language. This helps search engines understand your content.",
            "charset_meta": "Add a charset meta tag to specify the character encoding of your page. Use UTF-8 for best compatibility.",
            "word_count": "Increase the content length on your page. Aim for at least 300 words of high-quality, relevant content.",
            "heading_structure": "Improve your heading structure by using H1 for the main title and H2/H3 for subheadings in a logical hierarchy.",
        }
        
        return descriptions.get(rule_id, f"Fix the issue: {message}")

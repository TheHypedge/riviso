"""
Rules engine for SEO analysis.
"""

import yaml
from typing import Dict, Any, List, Optional
from pathlib import Path
import structlog

from audit.evaluators import EvaluatorRegistry

logger = structlog.get_logger(__name__)


class RulesEngine:
    """Rules engine for evaluating SEO rules."""
    
    def __init__(self):
        self.evaluator_registry = EvaluatorRegistry()
        self.rules = self._load_rules()
    
    def _load_rules(self) -> List[Dict[str, Any]]:
        """Load rules from YAML file."""
        try:
            rules_file = Path(__file__).parent.parent.parent / "rules" / "v1.yaml"
            if rules_file.exists():
                with open(rules_file, "r") as f:
                    rules_data = yaml.safe_load(f)
                    return rules_data.get("rules", [])
            else:
                logger.warning("Rules file not found, using default rules")
                return self._get_default_rules()
        except Exception as e:
            logger.error("Failed to load rules", error=str(e), exc_info=True)
            return self._get_default_rules()
    
    def _get_default_rules(self) -> List[Dict[str, Any]]:
        """Get default rules if file loading fails."""
        return [
            {
                "id": "title_tag",
                "name": "Title Tag",
                "category": "on_page",
                "description": "Page has a title tag",
                "evaluator": "title_tag_exists",
                "weight": 10,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "meta_description",
                "name": "Meta Description",
                "category": "on_page",
                "description": "Page has a meta description",
                "evaluator": "meta_description_exists",
                "weight": 8,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "h1_tag",
                "name": "H1 Tag",
                "category": "on_page",
                "description": "Page has exactly one H1 tag",
                "evaluator": "h1_tag_count",
                "weight": 9,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "images_alt_text",
                "name": "Image Alt Text",
                "category": "on_page",
                "description": "Images have alt text",
                "evaluator": "images_have_alt",
                "weight": 7,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "internal_links",
                "name": "Internal Links",
                "category": "on_page",
                "description": "Page has internal links",
                "evaluator": "has_internal_links",
                "weight": 6,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "canonical_url",
                "name": "Canonical URL",
                "category": "technical",
                "description": "Page has canonical URL",
                "evaluator": "canonical_url_exists",
                "weight": 8,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "robots_meta",
                "name": "Robots Meta Tag",
                "category": "technical",
                "description": "Page has robots meta tag",
                "evaluator": "robots_meta_exists",
                "weight": 5,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "viewport_meta",
                "name": "Viewport Meta Tag",
                "category": "technical",
                "description": "Page has viewport meta tag for mobile",
                "evaluator": "viewport_meta_exists",
                "weight": 7,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "html_lang",
                "name": "HTML Language",
                "category": "technical",
                "description": "HTML tag has lang attribute",
                "evaluator": "html_lang_exists",
                "weight": 6,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "charset_meta",
                "name": "Character Encoding",
                "category": "technical",
                "description": "Page has charset meta tag",
                "evaluator": "charset_meta_exists",
                "weight": 8,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "word_count",
                "name": "Content Length",
                "category": "content",
                "description": "Page has sufficient content",
                "evaluator": "sufficient_word_count",
                "weight": 5,
                "pass_score": 100,
                "fail_score": 0,
            },
            {
                "id": "heading_structure",
                "name": "Heading Structure",
                "category": "content",
                "description": "Page has proper heading hierarchy",
                "evaluator": "proper_heading_structure",
                "weight": 6,
                "pass_score": 100,
                "fail_score": 0,
            },
        ]
    
    async def evaluate_rules(self, parsed_content: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluate all rules against parsed content.
        
        Args:
            parsed_content: List of parsed content data
            
        Returns:
            List of rule evaluation results
        """
        results = []
        
        for rule in self.rules:
            try:
                result = await self._evaluate_rule(rule, parsed_content)
                results.append(result)
            except Exception as e:
                logger.error(
                    "Rule evaluation failed",
                    rule_id=rule.get("id"),
                    error=str(e),
                    exc_info=True
                )
                
                # Add failed rule result
                results.append({
                    "id": rule.get("id"),
                    "name": rule.get("name"),
                    "category": rule.get("category"),
                    "status": "error",
                    "score": 0,
                    "message": f"Rule evaluation failed: {str(e)}",
                    "weight": rule.get("weight", 1),
                })
        
        return results
    
    async def _evaluate_rule(self, rule: Dict[str, Any], parsed_content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluate a single rule.
        
        Args:
            rule: Rule definition
            parsed_content: List of parsed content data
            
        Returns:
            Rule evaluation result
        """
        rule_id = rule.get("id")
        evaluator_name = rule.get("evaluator")
        
        if not evaluator_name:
            raise ValueError(f"Rule {rule_id} has no evaluator")
        
        # Get evaluator
        evaluator = self.evaluator_registry.get_evaluator(evaluator_name)
        if not evaluator:
            raise ValueError(f"Evaluator {evaluator_name} not found")
        
        # Evaluate rule
        result = await evaluator.evaluate(parsed_content, rule)
        
        # Add rule metadata
        result.update({
            "id": rule_id,
            "name": rule.get("name"),
            "category": rule.get("category"),
            "weight": rule.get("weight", 1),
        })
        
        return result

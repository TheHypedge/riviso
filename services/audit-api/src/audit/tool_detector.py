"""
Tool detection engine for identifying analytics, tracking, and marketing tools.
Similar to Wappalyzer functionality.
"""

import re
import json
from typing import Dict, Any, List, Set, Optional, Tuple
from bs4 import BeautifulSoup
import structlog

logger = structlog.get_logger(__name__)


class ToolDetector:
    """Detects tools and platforms used on a website."""
    
    def __init__(self):
        self.tool_patterns = self._load_tool_patterns()
    
    def _load_tool_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load tool detection patterns."""
        return {
            # Analytics & Tracking
            "google_analytics": {
                "name": "Google Analytics",
                "category": "Analytics",
                "description": "Web analytics service by Google",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"googletagmanager\.com/gtm\.js",
                        r"google-analytics\.com/analytics\.js",
                        r"google-analytics\.com/ga\.js",
                        r"googletagmanager\.com/gtag/js",
                        r"google-analytics\.com/gtag/js"
                    ],
                    "js_objects": [
                        r"window\.dataLayer",
                        r"window\.gtag",
                        r"window\.ga",
                        r"window\._gaq",
                        r"window\.google_tag_manager"
                    ],
                    "cookies": [
                        r"_ga[^=]*=",
                        r"_gid[^=]*=",
                        r"_gat[^=]*=",
                        r"_gcl_[^=]*="
                    ],
                    "meta_tags": [
                        r"google-site-verification"
                    ]
                }
            },
            "google_tag_manager": {
                "name": "Google Tag Manager",
                "category": "Tag Management",
                "description": "Tag management system by Google",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"googletagmanager\.com/gtm\.js",
                        r"googletagmanager\.com/gtag/js"
                    ],
                    "js_objects": [
                        r"window\.dataLayer",
                        r"window\.google_tag_manager"
                    ],
                    "cookies": [
                        r"_gtm[^=]*=",
                        r"_gtag[^=]*="
                    ]
                }
            },
            "facebook_pixel": {
                "name": "Facebook Pixel",
                "category": "Advertising",
                "description": "Facebook advertising and analytics pixel",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"connect\.facebook\.net.*fbevents\.js",
                        r"facebook\.com/tr\?id="
                    ],
                    "js_objects": [
                        r"window\.fbq",
                        r"window\._fbq"
                    ],
                    "cookies": [
                        r"_fbp[^=]*=",
                        r"_fbc[^=]*="
                    ]
                }
            },
            "hotjar": {
                "name": "Hotjar",
                "category": "Analytics",
                "description": "User behavior analytics and heatmaps",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"static\.hotjar\.com/c/hotjar-.*\.js",
                        r"script\.hotjar\.com"
                    ],
                    "js_objects": [
                        r"window\.hj",
                        r"window\.hotjar"
                    ],
                    "cookies": [
                        r"_hjSessionUser_[^=]*=",
                        r"_hjFirstSeen[^=]*=",
                        r"_hjSession_[^=]*="
                    ]
                }
            },
            "mixpanel": {
                "name": "Mixpanel",
                "category": "Analytics",
                "description": "Product analytics and user behavior tracking",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"cdn\.mxpnl\.com/libs/mixpanel-.*\.js",
                        r"api\.mixpanel\.com"
                    ],
                    "js_objects": [
                        r"window\.mixpanel",
                        r"window\.mp"
                    ],
                    "cookies": [
                        r"mp_[^=]*="
                    ]
                }
            },
            "segment": {
                "name": "Segment",
                "category": "Analytics",
                "description": "Customer data platform and analytics",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"cdn\.segment\.com/analytics\.js/v1/",
                        r"cdn\.segment\.com/next-integrations/"
                    ],
                    "js_objects": [
                        r"window\.analytics",
                        r"window\.segment"
                    ],
                    "cookies": [
                        r"ajs_[^=]*=",
                        r"ajs_user_id[^=]*="
                    ]
                }
            },
            "amplitude": {
                "name": "Amplitude",
                "category": "Analytics",
                "description": "Product analytics and user behavior tracking",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"cdn\.amplitude\.com/libs/amplitude-.*\.js",
                        r"api\.amplitude\.com"
                    ],
                    "js_objects": [
                        r"window\.amplitude",
                        r"window\.Amplitude"
                    ],
                    "cookies": [
                        r"amplitude_[^=]*="
                    ]
                }
            },
            "intercom": {
                "name": "Intercom",
                "category": "Customer Support",
                "description": "Customer messaging and support platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"js\.intercomcdn\.com/frame.*\.js",
                        r"widget\.intercom\.io"
                    ],
                    "js_objects": [
                        r"window\.Intercom",
                        r"window\.intercomSettings"
                    ],
                    "cookies": [
                        r"intercom-[^=]*="
                    ]
                }
            },
            "zendesk": {
                "name": "Zendesk",
                "category": "Customer Support",
                "description": "Customer service and support platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"static\.zdassets\.com/ekr/sdk\.js",
                        r"widget\.zendesk\.com"
                    ],
                    "js_objects": [
                        r"window\.zE",
                        r"window\.zendesk"
                    ],
                    "cookies": [
                        r"zendesk_[^=]*="
                    ]
                }
            },
            "mailchimp": {
                "name": "Mailchimp",
                "category": "Email Marketing",
                "description": "Email marketing and automation platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"chimpstatic\.com/mcjs-connected/js/",
                        r"list-manage\.com"
                    ],
                    "js_objects": [
                        r"window\.mcj",
                        r"window\.mailchimp"
                    ],
                    "cookies": [
                        r"mailchimp_[^=]*="
                    ]
                }
            },
            "hubspot": {
                "name": "HubSpot",
                "category": "Marketing Automation",
                "description": "Inbound marketing and sales platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"js\.hs-scripts\.com/.*\.js",
                        r"js\.hsforms\.net"
                    ],
                    "js_objects": [
                        r"window\._hsq",
                        r"window\.hbspt"
                    ],
                    "cookies": [
                        r"__hs_[^=]*=",
                        r"hubspotutk[^=]*="
                    ]
                }
            },
            "salesforce": {
                "name": "Salesforce",
                "category": "CRM",
                "description": "Customer relationship management platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"c\.salesforce\.com/.*\.js",
                        r"js\.salesforce\.com"
                    ],
                    "js_objects": [
                        r"window\.sfdc",
                        r"window\.salesforce"
                    ],
                    "cookies": [
                        r"salesforce_[^=]*="
                    ]
                }
            },
            "wordpress": {
                "name": "WordPress",
                "category": "CMS",
                "description": "Content management system",
                "confidence": 0,
                "patterns": {
                    "meta_tags": [
                        r"generator.*wordpress",
                        r"wp-content"
                    ],
                    "scripts": [
                        r"wp-content/themes/",
                        r"wp-includes/js/",
                        r"wp-content/plugins/"
                    ],
                    "cookies": [
                        r"wordpress_[^=]*=",
                        r"wp-[^=]*="
                    ]
                }
            },
            "shopify": {
                "name": "Shopify",
                "category": "E-commerce",
                "description": "E-commerce platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"cdn\.shopify\.com/s/files/",
                        r"shopify\.com/shopifycloud"
                    ],
                    "js_objects": [
                        r"window\.Shopify",
                        r"window\.shopify"
                    ],
                    "cookies": [
                        r"_shopify_[^=]*=",
                        r"shopify_[^=]*="
                    ],
                    "meta_tags": [
                        r"shopify-digital-wallet"
                    ]
                }
            },
            "woocommerce": {
                "name": "WooCommerce",
                "category": "E-commerce",
                "description": "WordPress e-commerce plugin",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"woocommerce.*\.js",
                        r"wp-content/plugins/woocommerce/"
                    ],
                    "js_objects": [
                        r"window\.wc",
                        r"window\.woocommerce"
                    ],
                    "cookies": [
                        r"woocommerce_[^=]*=",
                        r"wp_woocommerce_[^=]*="
                    ]
                }
            },
            "magento": {
                "name": "Magento",
                "category": "E-commerce",
                "description": "E-commerce platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"magento.*\.js",
                        r"static\.frontend/"
                    ],
                    "js_objects": [
                        r"window\.Magento",
                        r"window\.magento"
                    ],
                    "cookies": [
                        r"magento_[^=]*=",
                        r"frontend[^=]*="
                    ]
                }
            },
            "bootstrap": {
                "name": "Bootstrap",
                "category": "UI Framework",
                "description": "Front-end CSS framework",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"bootstrap.*\.js",
                        r"cdn\.jsdelivr\.net/npm/bootstrap"
                    ],
                    "css": [
                        r"bootstrap.*\.css",
                        r"cdn\.jsdelivr\.net/npm/bootstrap"
                    ]
                }
            },
            "jquery": {
                "name": "jQuery",
                "category": "JavaScript Library",
                "description": "JavaScript library",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"jquery.*\.js",
                        r"cdn\.jsdelivr\.net/npm/jquery"
                    ],
                    "js_objects": [
                        r"window\.jQuery",
                        r"window\.\$"
                    ]
                }
            },
            "react": {
                "name": "React",
                "category": "JavaScript Framework",
                "description": "JavaScript library for building user interfaces",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"react.*\.js",
                        r"cdn\.jsdelivr\.net/npm/react"
                    ],
                    "js_objects": [
                        r"window\.React",
                        r"window\.ReactDOM"
                    ]
                }
            },
            "vue": {
                "name": "Vue.js",
                "category": "JavaScript Framework",
                "description": "Progressive JavaScript framework",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"vue.*\.js",
                        r"cdn\.jsdelivr\.net/npm/vue"
                    ],
                    "js_objects": [
                        r"window\.Vue",
                        r"window\.vue"
                    ]
                }
            },
            "angular": {
                "name": "Angular",
                "category": "JavaScript Framework",
                "description": "Web application framework",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"angular.*\.js",
                        r"cdn\.jsdelivr\.net/npm/@angular"
                    ],
                    "js_objects": [
                        r"window\.angular",
                        r"window\.ng"
                    ]
                }
            },
            "cloudflare": {
                "name": "Cloudflare",
                "category": "CDN",
                "description": "Content delivery network and security",
                "confidence": 0,
                "patterns": {
                    "meta_tags": [
                        r"cloudflare-email-protection"
                    ],
                    "scripts": [
                        r"cloudflare\.com/.*\.js"
                    ]
                }
            },
            "recaptcha": {
                "name": "reCAPTCHA",
                "category": "Security",
                "description": "Google's reCAPTCHA service",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"google\.com/recaptcha/",
                        r"recaptcha\.net/recaptcha/"
                    ],
                    "js_objects": [
                        r"window\.grecaptcha"
                    ]
                }
            },
            "stripe": {
                "name": "Stripe",
                "category": "Payment",
                "description": "Payment processing platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"js\.stripe\.com/v3/",
                        r"checkout\.stripe\.com"
                    ],
                    "js_objects": [
                        r"window\.Stripe"
                    ]
                }
            },
            "paypal": {
                "name": "PayPal",
                "category": "Payment",
                "description": "Payment processing platform",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"paypal\.com/sdk/js",
                        r"paypalobjects\.com"
                    ],
                    "js_objects": [
                        r"window\.paypal"
                    ]
                }
            }
        }
    
    def detect_tools(self, parsed_content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect tools and platforms used on the website.
        
        Args:
            parsed_content: Parsed content from the parser
            
        Returns:
            List of detected tools with details
        """
        detected_tools = []
        
        # Get HTML content for analysis
        html_content = parsed_content.get("html_content", "")
        if not html_content:
            return detected_tools
        
        soup = BeautifulSoup(html_content, "lxml")
        
        # Extract all scripts
        scripts = self._extract_scripts(soup)
        
        # Extract all meta tags
        meta_tags = self._extract_meta_tags(soup)
        
        # Extract cookies from headers or document
        cookies = self._extract_cookies(parsed_content)
        
        # Extract JavaScript objects (this would need to be done via browser execution)
        js_objects = self._extract_js_objects(html_content)
        
        # Check each tool pattern
        for tool_id, tool_config in self.tool_patterns.items():
            confidence = 0
            evidence = []
            
            # Check script patterns
            for script in scripts:
                for pattern in tool_config["patterns"].get("scripts", []):
                    if re.search(pattern, script, re.IGNORECASE):
                        confidence += 30
                        evidence.append(f"Script: {script[:100]}...")
                        break
            
            # Check meta tag patterns
            for meta in meta_tags:
                for pattern in tool_config["patterns"].get("meta_tags", []):
                    if re.search(pattern, meta, re.IGNORECASE):
                        confidence += 25
                        evidence.append(f"Meta tag: {meta}")
                        break
            
            # Check cookie patterns
            for cookie in cookies:
                for pattern in tool_config["patterns"].get("cookies", []):
                    if re.search(pattern, cookie, re.IGNORECASE):
                        confidence += 20
                        evidence.append(f"Cookie: {cookie}")
                        break
            
            # Check JavaScript object patterns
            for obj in js_objects:
                for pattern in tool_config["patterns"].get("js_objects", []):
                    if re.search(pattern, obj, re.IGNORECASE):
                        confidence += 25
                        evidence.append(f"JS Object: {obj}")
                        break
            
            # Only include tools with some confidence
            if confidence > 0:
                detected_tools.append({
                    "id": tool_id,
                    "name": tool_config["name"],
                    "category": tool_config["category"],
                    "description": tool_config["description"],
                    "confidence": min(confidence, 100),
                    "evidence": evidence[:5],  # Limit evidence to 5 items
                    "detection_methods": self._get_detection_methods(tool_config, evidence)
                })
        
        # Sort by confidence (highest first)
        detected_tools.sort(key=lambda x: x["confidence"], reverse=True)
        
        logger.info(
            "Tool detection completed",
            tools_detected=len(detected_tools),
            url=parsed_content.get("url", "")
        )
        
        return detected_tools
    
    def _extract_scripts(self, soup: BeautifulSoup) -> List[str]:
        """Extract all script sources and inline scripts."""
        scripts = []
        
        # External scripts
        for script in soup.find_all("script", src=True):
            scripts.append(script.get("src", ""))
        
        # Inline scripts (first 1000 chars)
        for script in soup.find_all("script", src=False):
            if script.string:
                scripts.append(script.string[:1000])
        
        return scripts
    
    def _extract_meta_tags(self, soup: BeautifulSoup) -> List[str]:
        """Extract all meta tags as strings."""
        meta_tags = []
        
        for meta in soup.find_all("meta"):
            # Get all attributes
            attrs = []
            for attr, value in meta.attrs.items():
                attrs.append(f'{attr}="{value}"')
            
            if attrs:
                meta_tags.append(f"<meta {' '.join(attrs)}>")
        
        return meta_tags
    
    def _extract_cookies(self, parsed_content: Dict[str, Any]) -> List[str]:
        """Extract cookies from headers or other sources."""
        cookies = []
        
        # Check if cookies are in headers
        headers = parsed_content.get("headers", {})
        cookie_header = headers.get("Set-Cookie", "")
        if cookie_header:
            cookies.extend(cookie_header.split(";"))
        
        # Check if cookies are in response headers
        response_headers = parsed_content.get("response_headers", {})
        cookie_header = response_headers.get("Set-Cookie", "")
        if cookie_header:
            cookies.extend(cookie_header.split(";"))
        
        return cookies
    
    def _extract_js_objects(self, html_content: str) -> List[str]:
        """Extract JavaScript objects from HTML content."""
        js_objects = []
        
        # Look for common global object patterns
        patterns = [
            r"window\.(\w+)",
            r"document\.(\w+)",
            r"(\w+)\.(\w+)",
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    js_objects.append(".".join(match))
                else:
                    js_objects.append(match)
        
        return list(set(js_objects))  # Remove duplicates
    
    def _get_detection_methods(self, tool_config: Dict[str, Any], evidence: List[str]) -> List[str]:
        """Get the methods used to detect the tool."""
        methods = []
        
        if any("Script:" in e for e in evidence):
            methods.append("Script Analysis")
        if any("Meta tag:" in e for e in evidence):
            methods.append("Meta Tag Analysis")
        if any("Cookie:" in e for e in evidence):
            methods.append("Cookie Analysis")
        if any("JS Object:" in e for e in evidence):
            methods.append("JavaScript Object Analysis")
        
        return methods

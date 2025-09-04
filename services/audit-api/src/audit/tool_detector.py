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
                "name": "Google Analytics GA4",
                "category": "Analytics",
                "description": "Web analytics service by Google (GA4)",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"googletagmanager\.com/gtm\.js",
                        r"google-analytics\.com/analytics\.js",
                        r"google-analytics\.com/ga\.js",
                        r"googletagmanager\.com/gtag/js",
                        r"google-analytics\.com/gtag/js",
                        r"googletagmanager\.com/gtag/js",
                        r"www\.googletagmanager\.com/gtag/js"
                    ],
                    "js_objects": [
                        r"window\.dataLayer",
                        r"window\.gtag",
                        r"window\.ga",
                        r"window\._gaq",
                        r"window\.google_tag_manager",
                        r"gtag\(",
                        r"ga\("
                    ],
                    "cookies": [
                        r"_ga[^=]*=",
                        r"_gid[^=]*=",
                        r"_gat[^=]*=",
                        r"_gcl_[^=]*=",
                        r"_ga_[^=]*="
                    ],
                    "meta_tags": [
                        r"google-site-verification",
                        r"google-analytics"
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
                        r"wp-content",
                        r"WordPress"
                    ],
                    "scripts": [
                        r"wp-content/themes/",
                        r"wp-includes/js/",
                        r"wp-content/plugins/",
                        r"wp-content/themes/.*\.js",
                        r"wp-includes/js/.*\.js"
                    ],
                    "cookies": [
                        r"wordpress_[^=]*=",
                        r"wp-[^=]*=",
                        r"wordpress_logged_in"
                    ],
                    "html_content": [
                        r"wp-content",
                        r"wp-includes",
                        r"WordPress"
                    ]
                }
            },
            "elementor": {
                "name": "Elementor",
                "category": "Page Builder",
                "description": "WordPress page builder plugin",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"elementor.*\.js",
                        r"wp-content/plugins/elementor/",
                        r"elementor/assets/",
                        r"elementor-frontend"
                    ],
                    "css": [
                        r"elementor.*\.css",
                        r"wp-content/plugins/elementor/",
                        r"elementor/assets/css/"
                    ],
                    "html_content": [
                        r"elementor",
                        r"elementor-section",
                        r"elementor-widget"
                    ],
                    "meta_tags": [
                        r"elementor"
                    ]
                }
            },
            "yoast_seo": {
                "name": "Yoast SEO",
                "category": "SEO",
                "description": "WordPress SEO plugin",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"yoast.*\.js",
                        r"wp-content/plugins/wordpress-seo/",
                        r"yoast-seo"
                    ],
                    "meta_tags": [
                        r"yoast",
                        r"yoast-seo",
                        r"yoast_wpseo"
                    ],
                    "html_content": [
                        r"yoast",
                        r"wpseo",
                        r"yoast-seo"
                    ]
                }
            },
            "lenis": {
                "name": "Lenis",
                "category": "JavaScript Library",
                "description": "Smooth scrolling library",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"lenis.*\.js",
                        r"cdn\.jsdelivr\.net/npm/@studio-freight/lenis",
                        r"lenis"
                    ],
                    "js_objects": [
                        r"window\.lenis",
                        r"new Lenis",
                        r"Lenis"
                    ]
                }
            },
            "jquery_ui": {
                "name": "jQuery UI",
                "category": "JavaScript Library",
                "description": "jQuery user interface library",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"jquery-ui.*\.js",
                        r"jquery\.ui.*\.js",
                        r"cdn\.jsdelivr\.net/npm/jquery-ui",
                        r"jqueryui"
                    ],
                    "css": [
                        r"jquery-ui.*\.css",
                        r"jquery\.ui.*\.css"
                    ],
                    "js_objects": [
                        r"jQuery\.ui",
                        r"\$\.ui"
                    ]
                }
            },
            "core_js": {
                "name": "core-js",
                "category": "JavaScript Library",
                "description": "JavaScript polyfill library",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"core-js.*\.js",
                        r"cdn\.jsdelivr\.net/npm/core-js",
                        r"core-js/"
                    ],
                    "js_objects": [
                        r"core-js",
                        r"core_js"
                    ]
                }
            },
            "swiper": {
                "name": "Swiper",
                "category": "JavaScript Library",
                "description": "Modern touch slider library",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"swiper.*\.js",
                        r"cdn\.jsdelivr\.net/npm/swiper",
                        r"swiper/"
                    ],
                    "css": [
                        r"swiper.*\.css",
                        r"swiper/css/"
                    ],
                    "js_objects": [
                        r"new Swiper",
                        r"window\.Swiper",
                        r"Swiper"
                    ]
                }
            },
            "owl_carousel": {
                "name": "OWL Carousel",
                "category": "JavaScript Library",
                "description": "Touch enabled jQuery carousel plugin",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"owl\.carousel.*\.js",
                        r"owl-carousel.*\.js",
                        r"cdn\.jsdelivr\.net/npm/owl\.carousel"
                    ],
                    "css": [
                        r"owl\.carousel.*\.css",
                        r"owl-carousel.*\.css"
                    ],
                    "js_objects": [
                        r"owlCarousel",
                        r"\$\.fn\.owlCarousel"
                    ]
                }
            },
            "google_fonts": {
                "name": "Google Fonts",
                "category": "Font Script",
                "description": "Google Font API for web fonts",
                "confidence": 0,
                "patterns": {
                    "scripts": [
                        r"fonts\.googleapis\.com",
                        r"fonts\.gstatic\.com"
                    ],
                    "css": [
                        r"fonts\.googleapis\.com",
                        r"fonts\.gstatic\.com"
                    ],
                    "html_content": [
                        r"fonts\.googleapis\.com",
                        r"Google Fonts"
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
        
        # Try BeautifulSoup parsing, fallback to regex if it fails
        try:
            soup = BeautifulSoup(html_content, "lxml")
            
            # Extract all scripts
            scripts = self._extract_scripts(soup)
            
            # Extract all meta tags
            meta_tags = self._extract_meta_tags(soup)
            
            # Extract CSS links
            css_links = self._extract_css_links(soup)
        except Exception as e:
            logger.warning("BeautifulSoup parsing failed, using regex fallback", error=str(e))
            # Fallback to regex-based extraction
            scripts = self._extract_scripts_regex(html_content)
            meta_tags = self._extract_meta_tags_regex(html_content)
            css_links = self._extract_css_links_regex(html_content)
        
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
            
            # Check CSS patterns
            for css in css_links:
                for pattern in tool_config["patterns"].get("css", []):
                    if re.search(pattern, css, re.IGNORECASE):
                        confidence += 25
                        evidence.append(f"CSS: {css[:100]}...")
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
            
            # Check HTML content patterns
            for pattern in tool_config["patterns"].get("html_content", []):
                if re.search(pattern, html_content, re.IGNORECASE):
                    confidence += 20
                    evidence.append(f"HTML Content: {pattern}")
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
            url=parsed_content.get("url", ""),
            html_length=len(html_content),
            scripts_count=len(scripts),
            meta_count=len(meta_tags),
            css_count=len(css_links)
        )
        
        return detected_tools
    
    def _extract_scripts(self, soup: BeautifulSoup) -> List[str]:
        """Extract all script sources and inline scripts."""
        scripts = []
        
        # External scripts
        for script in soup.find_all("script", src=True):
            src = script.get("src", "")
            if src:
                scripts.append(src)
        
        # Inline scripts (first 1000 chars)
        for script in soup.find_all("script", src=False):
            if script.string and script.string.strip():
                scripts.append(script.string.strip()[:1000])
        
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
    
    def _extract_css_links(self, soup: BeautifulSoup) -> List[str]:
        """Extract all CSS links."""
        css_links = []
        
        # External CSS files
        for link in soup.find_all("link", rel="stylesheet"):
            href = link.get("href", "")
            if href:
                css_links.append(href)
        
        # Inline CSS in style tags
        for style in soup.find_all("style"):
            if style.string:
                css_links.append(style.string[:500])  # First 500 chars
        
        return css_links
    
    def _extract_scripts_regex(self, html_content: str) -> List[str]:
        """Extract scripts using regex fallback."""
        scripts = []
        
        # External scripts
        script_pattern = r'<script[^>]*src=["\']([^"\']*)["\'][^>]*>'
        matches = re.findall(script_pattern, html_content, re.IGNORECASE)
        scripts.extend(matches)
        
        # Inline scripts
        inline_pattern = r'<script[^>]*>(.*?)</script>'
        matches = re.findall(inline_pattern, html_content, re.IGNORECASE | re.DOTALL)
        for match in matches:
            if match.strip():
                scripts.append(match.strip()[:1000])
        
        return scripts
    
    def _extract_meta_tags_regex(self, html_content: str) -> List[str]:
        """Extract meta tags using regex fallback."""
        meta_tags = []
        
        meta_pattern = r'<meta[^>]*>'
        matches = re.findall(meta_pattern, html_content, re.IGNORECASE)
        meta_tags.extend(matches)
        
        return meta_tags
    
    def _extract_css_links_regex(self, html_content: str) -> List[str]:
        """Extract CSS links using regex fallback."""
        css_links = []
        
        # External CSS files
        css_pattern = r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']*)["\'][^>]*>'
        matches = re.findall(css_pattern, html_content, re.IGNORECASE)
        css_links.extend(matches)
        
        # Inline CSS in style tags
        style_pattern = r'<style[^>]*>(.*?)</style>'
        matches = re.findall(style_pattern, html_content, re.IGNORECASE | re.DOTALL)
        for match in matches:
            if match.strip():
                css_links.append(match.strip()[:500])
        
        return css_links
    
    def _get_detection_methods(self, tool_config: Dict[str, Any], evidence: List[str]) -> List[str]:
        """Get the methods used to detect the tool."""
        methods = []
        
        if any("Script:" in e for e in evidence):
            methods.append("Script Analysis")
        if any("CSS:" in e for e in evidence):
            methods.append("CSS Analysis")
        if any("Meta tag:" in e for e in evidence):
            methods.append("Meta Tag Analysis")
        if any("Cookie:" in e for e in evidence):
            methods.append("Cookie Analysis")
        if any("JS Object:" in e for e in evidence):
            methods.append("JavaScript Object Analysis")
        if any("HTML Content:" in e for e in evidence):
            methods.append("HTML Content Analysis")
        
        return methods

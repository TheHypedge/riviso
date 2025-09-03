#!/usr/bin/env python3
"""
Test script for Google PageSpeed Insights API integration
"""

import asyncio
import aiohttp
import json
import os

# Test API key - you need to replace this with a real one
TEST_API_KEY = os.getenv("PAGESPEED_API_KEY", "YOUR_API_KEY_HERE")

async def test_pagespeed_api():
    """Test the Google PageSpeed Insights API"""
    
    if TEST_API_KEY == "YOUR_API_KEY_HERE":
        print("❌ Please set your Google PageSpeed Insights API key!")
        print("Get your API key from: https://console.cloud.google.com/")
        print("Then set it as: export PAGESPEED_API_KEY='your_key_here'")
        return False
    
    test_url = "https://example.com"
    pagespeed_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    
    params = {
        "url": test_url,
        "strategy": "mobile",
        "key": TEST_API_KEY,
        "category": ["performance", "accessibility", "best-practices", "seo"]
    }
    
    try:
        print(f"🔍 Testing PageSpeed Insights API for: {test_url}")
        print(f"📡 API Key: {TEST_API_KEY[:10]}...")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(pagespeed_url, params=params) as response:
                print(f"📊 Response Status: {response.status}")
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract key metrics
                    lighthouse_result = data.get("lighthouseResult", {})
                    categories = lighthouse_result.get("categories", {})
                    
                    print("\n✅ API Test Successful!")
                    print("📈 Performance Scores:")
                    
                    for category, details in categories.items():
                        score = details.get("score", 0)
                        score_percent = int(score * 100) if score else 0
                        print(f"  • {category.title()}: {score_percent}%")
                    
                    # Extract Core Web Vitals
                    audits = lighthouse_result.get("audits", {})
                    lcp_audit = audits.get("largest-contentful-paint", {})
                    fcp_audit = audits.get("first-contentful-paint", {})
                    cls_audit = audits.get("cumulative-layout-shift", {})
                    
                    print("\n🎯 Core Web Vitals:")
                    if lcp_audit:
                        lcp_value = lcp_audit.get("numericValue", 0) / 1000
                        print(f"  • LCP: {lcp_value:.2f}s")
                    if fcp_audit:
                        fcp_value = fcp_audit.get("numericValue", 0) / 1000
                        print(f"  • FCP: {fcp_value:.2f}s")
                    if cls_audit:
                        cls_value = cls_audit.get("numericValue", 0)
                        print(f"  • CLS: {cls_value:.3f}")
                    
                    return True
                    
                elif response.status == 403:
                    print("❌ API Key Error: Invalid or quota exceeded")
                    print("💡 Check your API key and billing settings")
                    return False
                    
                elif response.status == 400:
                    print("❌ Bad Request: Check your URL format")
                    return False
                    
                else:
                    error_text = await response.text()
                    print(f"❌ API Error: {response.status}")
                    print(f"Response: {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

async def test_multiple_urls():
    """Test API with multiple URLs"""
    test_urls = [
        "https://example.com",
        "https://google.com",
        "https://github.com"
    ]
    
    print("\n🔄 Testing multiple URLs...")
    
    for url in test_urls:
        print(f"\n📊 Testing: {url}")
        # You can add more detailed testing here
        await asyncio.sleep(1)  # Rate limiting

if __name__ == "__main__":
    print("🚀 Google PageSpeed Insights API Test")
    print("=" * 50)
    
    # Test the API
    success = asyncio.run(test_pagespeed_api())
    
    if success:
        print("\n✅ API integration is working!")
        print("🎉 You can now use real PageSpeed data in your audits")
    else:
        print("\n❌ API integration needs setup")
        print("📋 Next steps:")
        print("1. Get API key from Google Cloud Console")
        print("2. Enable PageSpeed Insights API")
        print("3. Set PAGESPEED_API_KEY environment variable")
        print("4. Run this test again")

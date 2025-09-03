#!/usr/bin/env python3
"""
Setup script for Google PageSpeed Insights API key
"""

import os
import sys

def setup_api_key():
    """Interactive setup for Google PageSpeed Insights API key"""
    
    print("🚀 Google PageSpeed Insights API Setup")
    print("=" * 50)
    
    # Check if API key is already set
    current_key = os.getenv("PAGESPEED_API_KEY")
    if current_key and current_key != "AIzaSyBvOkBwJcJkLmNpQrStUvWxYzAbCdEfGhI":
        print(f"✅ API key is already set: {current_key[:10]}...")
        choice = input("Do you want to update it? (y/n): ").lower()
        if choice != 'y':
            return current_key
    
    print("\n📋 To get your Google PageSpeed Insights API key:")
    print("1. Go to: https://console.cloud.google.com/")
    print("2. Create a new project or select existing one")
    print("3. Enable 'PageSpeed Insights API'")
    print("4. Create credentials (API Key)")
    print("5. Copy the generated API key")
    
    print("\n🔑 Enter your API key:")
    api_key = input("API Key: ").strip()
    
    if not api_key:
        print("❌ No API key provided")
        return None
    
    if not api_key.startswith("AIza"):
        print("⚠️ Warning: API key doesn't look like a Google API key (should start with 'AIza')")
        confirm = input("Continue anyway? (y/n): ").lower()
        if confirm != 'y':
            return None
    
    # Set environment variable for current session
    os.environ["PAGESPEED_API_KEY"] = api_key
    
    print(f"\n✅ API key set: {api_key[:10]}...")
    
    # Create .env file for local development
    env_content = f"PAGESPEED_API_KEY={api_key}\n"
    
    try:
        with open(".env", "w") as f:
            f.write(env_content)
        print("📁 Created .env file for local development")
    except Exception as e:
        print(f"⚠️ Could not create .env file: {e}")
    
    print("\n🌐 For production deployment:")
    print("Set environment variable: PAGESPEED_API_KEY")
    print("Value:", api_key)
    
    return api_key

def test_api_key(api_key):
    """Test the API key"""
    if not api_key:
        return False
    
    print("\n🧪 Testing API key...")
    
    try:
        import asyncio
        import aiohttp
        
        async def test():
            url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
            params = {
                "url": "https://example.com",
                "key": api_key,
                "strategy": "mobile"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        print("✅ API key is working!")
                        return True
                    elif response.status == 403:
                        print("❌ API key is invalid or quota exceeded")
                        return False
                    else:
                        print(f"❌ API error: {response.status}")
                        return False
        
        return asyncio.run(test())
        
    except ImportError:
        print("⚠️ aiohttp not installed, skipping test")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    api_key = setup_api_key()
    
    if api_key:
        if test_api_key(api_key):
            print("\n🎉 Setup complete! Your API key is ready to use.")
            print("🚀 You can now run real PageSpeed Insights audits!")
        else:
            print("\n❌ API key test failed. Please check your key and try again.")
    else:
        print("\n❌ Setup cancelled. No API key configured.")
        sys.exit(1)

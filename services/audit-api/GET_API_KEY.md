# Google PageSpeed Insights API Setup

To get real performance data like Google PageSpeed Insights, you need to set up the Google PageSpeed Insights API.

## 🚀 Quick Setup (Recommended)

Run the setup script for interactive configuration:
```bash
cd services/audit-api
python setup_api_key.py
```

## 📋 Manual Setup Steps:

### 1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

### 2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name it "RIVISO PageSpeed API" or similar
   - Click "Create"

### 3. **Enable PageSpeed Insights API**
   - Go to "APIs & Services" → "Library"
   - Search for "PageSpeed Insights API"
   - Click on it and press "Enable"

### 4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key (starts with "AIza...")

### 5. **Set Environment Variable**

**For Local Development:**
```bash
export PAGESPEED_API_KEY="your_api_key_here"
```

**For Production (Render):**
- Add environment variable in your deployment platform
- Variable name: `PAGESPEED_API_KEY`
- Value: Your API key

## 🧪 Testing the API

**Test with curl:**
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

**Test with Python:**
```bash
cd services/audit-api
python test_pagespeed_api.py
```

## 📊 API Usage Limits:
- **Free tier**: 25,000 requests per day
- **Rate limit**: 1 request per second
- **Cost**: Free for basic usage
- **Quota**: Resets daily at midnight Pacific Time

## 🔧 Troubleshooting:

**403 Forbidden Error:**
- Check if API key is correct
- Verify PageSpeed Insights API is enabled
- Check if billing is enabled (required for some APIs)

**400 Bad Request:**
- Ensure URL is properly formatted (include http:// or https://)
- Check if URL is accessible

**Quota Exceeded:**
- Wait for daily quota reset
- Consider upgrading to paid plan for higher limits

## 🌐 Alternative APIs (if needed):
- **WebPageTest API**: https://www.webpagetest.org/getkey.php
- **GTmetrix API**: https://gtmetrix.com/api/
- **Lighthouse CI**: For continuous monitoring

## ✅ Verification:

Once setup is complete, you should see:
- ✅ "Real Data" badge in audit results
- ✅ Actual Core Web Vitals from Google's servers
- ✅ Real performance scores and metrics
- ✅ Data source showing "Google PageSpeed Insights API"

## 🎉 You're Ready!

The system will now automatically fetch real performance data from Google's servers, providing authentic Core Web Vitals, performance scores, and optimization recommendations just like the official PageSpeed Insights tool!

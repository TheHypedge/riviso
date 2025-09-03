# Google PageSpeed Insights API Setup

To get real performance data like Google PageSpeed Insights, you need to set up the Google PageSpeed Insights API.

## Steps to Get API Key:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project or Select Existing**
   - Click "Select a project" → "New Project"
   - Name it "RIVISO PageSpeed API" or similar

3. **Enable PageSpeed Insights API**
   - Go to "APIs & Services" → "Library"
   - Search for "PageSpeed Insights API"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Set Environment Variable**
   ```bash
   export PAGESPEED_API_KEY="your_api_key_here"
   ```

6. **For Production (Render/Railway)**
   - Add the environment variable in your deployment platform
   - Variable name: `PAGESPEED_API_KEY`
   - Value: Your API key

## API Usage Limits:
- Free tier: 25,000 requests per day
- Rate limit: 1 request per second
- No cost for basic usage

## Alternative APIs (if needed):
- **WebPageTest API**: https://www.webpagetest.org/getkey.php
- **GTmetrix API**: https://gtmetrix.com/api/
- **Lighthouse CI**: For continuous monitoring

## Testing the API:
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

Once you have the API key, the system will automatically fetch real performance data from Google's servers!

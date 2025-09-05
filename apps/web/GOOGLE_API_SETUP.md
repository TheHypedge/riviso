# Google PageSpeed Insights API Setup

To enable the Website Analyzer functionality, you need to set up a Google PageSpeed Insights API key.

## Steps to get your API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the PageSpeed Insights API:
   - Go to "APIs & Services" > "Library"
   - Search for "PageSpeed Insights API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. Add the API key to your environment:
   - Open `.env.local` file
   - Replace `your_api_key_here` with your actual API key:
     ```
     GOOGLE_PAGESPEED_API_KEY=your_actual_api_key_here
     ```

## Features enabled with this API:

- Real-time performance analysis using Google's PageSpeed Insights
- Mobile and desktop performance comparison
- Core Web Vitals metrics (FCP, LCP, CLS, FID, TBT)
- Performance, Accessibility, Best Practices, and SEO scores
- Live website previews in mobile and desktop views

## Note:

The API has usage limits. For production use, consider:
- Setting up billing for higher quotas
- Implementing caching to reduce API calls
- Adding rate limiting to prevent abuse

## Testing:

Once you've added your API key, restart your development server and test the Website Analyzer tool in the dashboard.

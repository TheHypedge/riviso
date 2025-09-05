import fetch from 'node-fetch';

export interface FetchResult {
  html: string;
  status: number;
  redirects: number;
  headers: Record<string, string>;
  finalUrl: string;
}

export async function fetchHtml(inputUrl: string): Promise<FetchResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(inputUrl, {
      redirect: 'follow' as any,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    clearTimeout(timeoutId);

    const html = await response.text();
    const headers: Record<string, string> = {};
    
    // Convert Headers object to plain object
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return {
      html,
      status: response.status,
      redirects: response.redirected ? 1 : 0,
      headers,
      finalUrl: response.url || inputUrl
    };
  } catch (error) {
    throw new Error(`Failed to fetch ${inputUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

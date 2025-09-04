import { URL } from 'url';

export interface FetchResult {
  html: string;
  status: number;
  bytes: number;
  warnings: string[];
}

// SSRF protection - check if hostname resolves to private/reserved IPs
function isPrivateIP(hostname: string): boolean {
  // Check for localhost and internal TLDs
  if (hostname === 'localhost' || 
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.test')) {
    return true;
  }

  // Check for IPv4 private ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  
  if (match) {
    const [, a, b, c, d] = match.map(Number);
    
    // 10.0.0.0/8
    if (a === 10) return true;
    
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    
    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;
    
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
  }

  return false;
}

function isValidScheme(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export async function safeFetch(url: string): Promise<FetchResult> {
  const warnings: string[] = [];
  
  try {
    // Parse and validate URL
    const parsedUrl = new URL(url);
    
    // Check scheme
    if (!isValidScheme(parsedUrl)) {
      throw new Error('Only HTTP and HTTPS schemes are allowed');
    }
    
    // Check for private IPs
    if (isPrivateIP(parsedUrl.hostname)) {
      throw new Error('Private/reserved IP addresses are not allowed');
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    // Fetch with redirect limit and size limit
    let redirectCount = 0;
    const maxRedirects = 5;
    let currentUrl = url;
    
    while (redirectCount <= maxRedirects) {
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RIVISO-Keywords-Bot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'manual' // Handle redirects manually
      });
      
      clearTimeout(timeoutId);
      
      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Redirect response missing Location header');
        }
        
        // Resolve relative URLs
        const redirectUrl = new URL(location, currentUrl);
        
        // Check redirect URL for security
        if (!isValidScheme(redirectUrl)) {
          throw new Error('Redirect to non-HTTP/HTTPS scheme not allowed');
        }
        
        if (isPrivateIP(redirectUrl.hostname)) {
          throw new Error('Redirect to private IP not allowed');
        }
        
        currentUrl = redirectUrl.toString();
        redirectCount++;
        continue;
      }
      
      // Check final status
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        warnings.push(`Unexpected content type: ${contentType}`);
      }
      
      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        if (bytes > 1.5 * 1024 * 1024) { // 1.5MB limit
          throw new Error(`Content too large: ${bytes} bytes`);
        }
      }
      
      // Read response with size limit
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }
      
      let html = '';
      let totalBytes = 0;
      const maxBytes = 1.5 * 1024 * 1024; // 1.5MB
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          totalBytes += value.length;
          if (totalBytes > maxBytes) {
            throw new Error(`Content too large: ${totalBytes} bytes`);
          }
          
          html += new TextDecoder().decode(value);
        }
      } finally {
        reader.releaseLock();
      }
      
      return {
        html,
        status: response.status,
        bytes: totalBytes,
        warnings
      };
    }
    
    throw new Error(`Too many redirects (${maxRedirects})`);
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout (10s)');
      }
      throw error;
    }
    throw new Error('Unknown fetch error');
  }
}

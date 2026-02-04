import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

/**
 * Website Verification Service
 * 
 * Verifies website ownership using:
 * 1. DNS TXT record verification
 * 2. HTML meta tag verification
 * 
 * CRITICAL: Websites must be verified before they can access:
 * - Search Console data
 * - Technical SEO analysis
 * - CRO insights
 */
@Injectable()
export class WebsiteVerificationService {
  private readonly logger = new Logger(WebsiteVerificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Generate a verification token for a website
   */
  generateVerificationToken(websiteId: string, domain: string): string {
    const secret = this.configService.get<string>('VERIFICATION_SECRET') || 'default-secret-change-in-production';
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(`${websiteId}-${domain}-${secret}`).digest('hex');
    return `riviso-verification=${hash.substring(0, 32)}`;
  }

  /**
   * Verify website via DNS TXT record
   * 
   * Checks for TXT record: riviso-verification=<token>
   */
  async verifyDns(domain: string, expectedToken: string): Promise<{ verified: boolean; error?: string }> {
    try {
      this.logger.log(`Verifying DNS for domain: ${domain}`);
      
      const records = await resolveTxt(domain);
      const allRecords = records.flat();
      
      const verificationRecord = allRecords.find(record => 
        record.startsWith('riviso-verification=')
      );

      if (!verificationRecord) {
        return {
          verified: false,
          error: 'No verification TXT record found. Please add: riviso-verification=<token>',
        };
      }

      const token = verificationRecord.split('=')[1];
      if (token !== expectedToken.split('=')[1]) {
        return {
          verified: false,
          error: 'Verification token mismatch. Please check your DNS record.',
        };
      }

      this.logger.log(`DNS verification successful for domain: ${domain}`);
      return { verified: true };
    } catch (error: any) {
      this.logger.error(`DNS verification failed for ${domain}: ${error.message}`);
      return {
        verified: false,
        error: `DNS lookup failed: ${error.message}`,
      };
    }
  }

  /**
   * Verify website via HTML meta tag
   * 
   * Checks for meta tag: <meta name="riviso-verification" content="<token>" />
   */
  async verifyMetaTag(url: string, expectedToken: string): Promise<{ verified: boolean; error?: string }> {
    try {
      this.logger.log(`Verifying meta tag for URL: ${url}`);
      
      // Ensure URL has protocol
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Riviso-Verification-Bot/1.0',
          },
        })
      );

      const html = response.data;
      if (typeof html !== 'string') {
        return {
          verified: false,
          error: 'Invalid HTML response',
        };
      }

      // Look for meta tag
      const metaTagRegex = /<meta\s+name=["']riviso-verification["']\s+content=["']([^"']+)["']\s*\/?>/i;
      const match = html.match(metaTagRegex);

      if (!match) {
        return {
          verified: false,
          error: 'No verification meta tag found. Please add: <meta name="riviso-verification" content="<token>" />',
        };
      }

      const token = match[1];
      const expectedTokenValue = expectedToken.split('=')[1];
      
      if (token !== expectedTokenValue) {
        return {
          verified: false,
          error: 'Verification token mismatch. Please check your meta tag.',
        };
      }

      this.logger.log(`Meta tag verification successful for URL: ${url}`);
      return { verified: true };
    } catch (error: any) {
      this.logger.error(`Meta tag verification failed for ${url}: ${error.message}`);
      return {
        verified: false,
        error: `Failed to fetch URL: ${error.message}`,
      };
    }
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      // If URL parsing fails, try to extract domain manually
      const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      return cleaned;
    }
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): { valid: boolean; error?: string; normalized?: string } {
    try {
      const normalized = url.startsWith('http') ? url : `https://${url}`;
      new URL(normalized);
      return { valid: true, normalized };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format. Please provide a valid URL (e.g., example.com or https://example.com)',
      };
    }
  }
}

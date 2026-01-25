import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GSCPropertyRepository } from '../../../infrastructure/database/repositories/gsc-property.repository';
import { GscOAuthService } from './gsc-oauth.service';
import { GscSite } from '@riviso/shared-types';

export interface MatchResult {
  match: GscSite | null;
  candidates: GscSite[];
}

/**
 * Normalize domain for matching: lowercase, no trailing slash, optional www strip.
 */
function normalizeDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
    return `${u.protocol}//${host}${path}`;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Extract origin (protocol + host) from URL.
 */
function origin(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url;
  }
}

@Injectable()
export class GscPropertyService {
  private readonly logger = new Logger(GscPropertyService.name);

  constructor(
    private readonly gscPropertyRepo: GSCPropertyRepository,
    private readonly gscOAuth: GscOAuthService,
  ) {}

  /**
   * Match user website URL to GSC properties. Prefer domain property, then URL-prefix.
   */
  matchProperty(userWebsiteUrl: string, sites: GscSite[]): MatchResult {
    const normalized = normalizeDomain(userWebsiteUrl);
    const userOrigin = origin(userWebsiteUrl);
    let userHost = '';
    try {
      userHost = new URL(userWebsiteUrl.startsWith('http') ? userWebsiteUrl : `https://${userWebsiteUrl}`).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      userHost = userOrigin.replace(/^https?:\/\//, '').replace(/^www\./, '');
    }
    const candidates: GscSite[] = [];

    for (const s of sites) {
      const site = s.siteUrl.trim().toLowerCase().replace(/\/$/, '');
      if (site.startsWith('sc-domain:')) {
        const domain = site.slice('sc-domain:'.length);
        if (domain === userHost) candidates.push(s);
      } else if (site === normalized || site === userOrigin) {
        candidates.push(s);
      } else if (normalized.startsWith(site) || userOrigin.startsWith(site)) {
        candidates.push(s);
      }
    }

    const domainProps = candidates.filter((c) => c.siteUrl.toLowerCase().startsWith('sc-domain:'));
    const match: GscSite | null =
      domainProps.length > 0
        ? domainProps[0]
        : candidates.length === 1
          ? candidates[0]
          : candidates.length > 1
            ? candidates[0]
            : null;

    return { match, candidates };
  }

  /**
   * Persist selected GSC property for user. Called after OAuth or when user picks from list.
   */
  async saveProperty(
    userId: string,
    googleAccountId: string,
    gscPropertyUrl: string,
    permissionLevel: string,
    websiteId: string | null,
  ): Promise<{ id: string }> {
    const existing = await this.gscPropertyRepo.findByUserAndPropertyUrl(userId, gscPropertyUrl);
    if (existing) {
      return { id: existing.id };
    }
    const created = await this.gscPropertyRepo.create({
      userId,
      websiteId,
      googleAccountId,
      gscPropertyUrl,
      permissionLevel,
    });
    this.logger.log(`GSC property saved: user=${userId} property=${gscPropertyUrl}`);
    return { id: created.id };
  }

  /**
   * Get persisted properties for user.
   */
  async getProperties(userId: string) {
    return this.gscPropertyRepo.findByUserId(userId);
  }

  /**
   * Get valid access token for a GSC property (via its Google account). Used by data fetcher.
   */
  async getAccessTokenForProperty(gscPropertyId: string): Promise<string> {
    const prop = await this.gscPropertyRepo.findById(gscPropertyId);
    if (!prop) throw new BadRequestException('GSC property not found');
    return this.gscOAuth.getValidAccessToken(prop.googleAccountId);
  }
}

import {
  Controller,
  Get,
  Query,
  Res,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { GscOAuthService } from './services/gsc-oauth.service';
import { GscPropertyService } from './services/gsc-property.service';
import { GSCPropertyRepository } from '../../infrastructure/database/repositories/gsc-property.repository';

const FRONTEND_GSC_SUCCESS = '/dashboard/gsc?success=1';
const FRONTEND_GSC_ERROR = '/dashboard/gsc?error=';
const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Public GSC OAuth callback. Google redirects here.
 * No JwtAuthGuard — callback is unauthenticated.
 */
@ApiTags('Integrations')
@Controller('integrations/gsc/oauth')
export class GscOAuthController {
  private readonly logger = new Logger(GscOAuthController.name);

  constructor(
    private readonly gscOAuth: GscOAuthService,
    private readonly gscProperty: GscPropertyService,
    private readonly gscPropertyRepo: GSCPropertyRepository,
  ) {}

  /**
   * Public OAuth callback. Google redirects here with ?code= & ?state=.
   * Exchange code, store tokens, fetch sites, match property, redirect to frontend.
   */
  @Get('callback')
  @ApiOperation({ summary: 'GSC OAuth callback (public)' })
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const base = FRONTEND_BASE.replace(/\/$/, '');
    const successUrl = `${base}${FRONTEND_GSC_SUCCESS}`;
    const errorBase = `${base}${FRONTEND_GSC_ERROR}`;

    if (error) {
      const msg = error === 'access_denied' ? 'access_denied' : encodeURIComponent(error);
      res.redirect(302, `${errorBase}${msg}`);
      return;
    }
    if (!code || !state) {
      res.redirect(302, `${errorBase}${encodeURIComponent('missing_code_or_state')}`);
      return;
    }

    try {
      const result = await this.gscOAuth.handleCallback(code, state);
      const { userId, websiteUrl, sites, googleAccountId } = result;
      const { match, candidates } = this.gscProperty.matchProperty(websiteUrl, sites);

      if (match) {
        await this.gscProperty.saveProperty(
          userId,
          googleAccountId,
          match.siteUrl,
          match.permissionLevel,
          null,
        );
        const prop = await this.gscPropertyRepo.findByUserAndPropertyUrl(userId, match.siteUrl);
        const params = new URLSearchParams({
          success: '1',
          property: match.siteUrl,
          ...(prop && { propertyId: prop.id }),
        });
        res.redirect(302, `${base}/dashboard/gsc?${params.toString()}`);
        return;
      }

      if (candidates.length > 1) {
        const params = new URLSearchParams({
          success: '1',
          googleAccountId,
          multiple: '1',
          sites: Buffer.from(JSON.stringify(candidates.map((s) => s.siteUrl))).toString('base64url'),
        });
        res.redirect(302, `${base}/dashboard/gsc?${params.toString()}`);
        return;
      }

      res.redirect(302, `${errorBase}${encodeURIComponent('no_matching_property')}`);
    } catch (e: any) {
      this.logger.warn(`GSC callback error: ${e?.message}`);
      if (e instanceof UnauthorizedException || e instanceof BadRequestException) {
        const msg = (e.getResponse() as any)?.message ?? e.message;
        res.redirect(302, `${errorBase}${encodeURIComponent(msg)}`);
        return;
      }
      res.redirect(302, `${errorBase}${encodeURIComponent('callback_failed')}`);
    }
  }
}

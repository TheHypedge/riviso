import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteEntity } from '../../infrastructure/database/entities/website.entity';
import { WebsiteVerificationService } from './services/website-verification.service';
import { EntitlementService } from './services/entitlement.service';

/**
 * Website Service
 * 
 * Manages website CRUD operations and verification
 */
@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);

  constructor(
    @InjectRepository(WebsiteEntity)
    private readonly websiteRepository: Repository<WebsiteEntity>,
    private readonly verificationService: WebsiteVerificationService,
    private readonly entitlementService: EntitlementService,
  ) {}

  /**
   * Create a new website
   */
  async createWebsite(
    userId: string,
    url: string,
    name?: string,
    workspaceId?: string,
  ): Promise<WebsiteEntity> {
    // Enforce plan limits
    await this.entitlementService.enforceWebsiteLimit(userId, workspaceId);

    // Validate URL
    const validation = this.verificationService.validateUrl(url);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const normalizedUrl = validation.normalized!;
    const domain = this.verificationService.extractDomain(normalizedUrl);

    // Check if website already exists
    const existing = await this.websiteRepository.findOne({
      where: workspaceId
        ? { userId, workspaceId, domain }
        : { userId, domain },
    });

    if (existing) {
      throw new BadRequestException('Website already exists');
    }

    // Generate verification token
    const website = this.websiteRepository.create({
      userId,
      workspaceId: workspaceId || null,
      url: normalizedUrl,
      domain,
      name: name || domain,
      verificationStatus: 'pending',
      verificationToken: null, // Will be set when verification starts
    });

    const saved = await this.websiteRepository.save(website);

    // Generate token after saving (needs website ID)
    saved.verificationToken = this.verificationService.generateVerificationToken(
      saved.id,
      saved.domain,
    );
    await this.websiteRepository.save(saved);

    this.logger.log(`Created website ${saved.id} for user ${userId}`);
    return saved;
  }

  /**
   * Get user's websites
   */
  async getUserWebsites(userId: string, workspaceId?: string): Promise<WebsiteEntity[]> {
    return this.websiteRepository.find({
      where: workspaceId
        ? { userId, workspaceId }
        : { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get website by ID (with ownership check)
   */
  async getWebsiteById(websiteId: string, userId: string): Promise<WebsiteEntity> {
    const website = await this.websiteRepository.findOne({
      where: { id: websiteId, userId },
    });

    if (!website) {
      throw new NotFoundException('Website not found');
    }

    return website;
  }

  /**
   * Start verification process
   */
  async startVerification(
    websiteId: string,
    userId: string,
    method: 'dns' | 'meta',
  ): Promise<{ token: string; instructions: string }> {
    const website = await this.getWebsiteById(websiteId, userId);

    if (website.verificationStatus === 'verified') {
      throw new BadRequestException('Website is already verified');
    }

    // Generate token if not exists
    if (!website.verificationToken) {
      website.verificationToken = this.verificationService.generateVerificationToken(
        website.id,
        website.domain,
      );
    }

    website.verificationMethod = method;
    website.verificationStatus = 'verifying';
    await this.websiteRepository.save(website);

    const token = website.verificationToken;
    let instructions = '';

    if (method === 'dns') {
      instructions = `Add a TXT record to your DNS:
Name: ${website.domain}
Value: ${token}

After adding the record, click "Verify" to complete verification.`;
    } else {
      instructions = `Add this meta tag to the <head> section of your website's homepage:
<meta name="riviso-verification" content="${token.split('=')[1]}" />

After adding the tag, click "Verify" to complete verification.`;
    }

    return { token, instructions };
  }

  /**
   * Verify website
   */
  async verifyWebsite(websiteId: string, userId: string): Promise<{ verified: boolean; error?: string }> {
    const website = await this.getWebsiteById(websiteId, userId);

    if (!website.verificationMethod) {
      throw new BadRequestException('Verification method not set. Please start verification first.');
    }

    if (!website.verificationToken) {
      throw new BadRequestException('Verification token not found');
    }

    let result: { verified: boolean; error?: string };

    if (website.verificationMethod === 'dns') {
      result = await this.verificationService.verifyDns(website.domain, website.verificationToken);
    } else {
      result = await this.verificationService.verifyMetaTag(website.url, website.verificationToken);
    }

    if (result.verified) {
      website.verificationStatus = 'verified';
      website.verificationMetadata = {
        ...website.verificationMetadata,
        verifiedAt: new Date().toISOString(),
        verifiedBy: userId,
        lastCheckedAt: new Date().toISOString(),
      };
      await this.websiteRepository.save(website);
      this.logger.log(`Website ${websiteId} verified successfully`);
    } else {
      website.verificationStatus = 'failed';
      website.verificationMetadata = {
        ...website.verificationMetadata,
        errorMessage: result.error,
        lastCheckedAt: new Date().toISOString(),
      };
      await this.websiteRepository.save(website);
    }

    return result;
  }

  /**
   * Map GSC property to website
   */
  async mapGscProperty(
    websiteId: string,
    userId: string,
    gscPropertyUrl: string,
  ): Promise<WebsiteEntity> {
    const website = await this.getWebsiteById(websiteId, userId);

    if (website.verificationStatus !== 'verified') {
      throw new BadRequestException('Website must be verified before mapping GSC property');
    }

    website.gscPropertyUrl = gscPropertyUrl;
    await this.websiteRepository.save(website);

    this.logger.log(`Mapped GSC property ${gscPropertyUrl} to website ${websiteId}`);
    return website;
  }

  /**
   * Delete website
   */
  async deleteWebsite(websiteId: string, userId: string): Promise<void> {
    const website = await this.getWebsiteById(websiteId, userId);
    await this.websiteRepository.remove(website);
    this.logger.log(`Deleted website ${websiteId}`);
  }
}

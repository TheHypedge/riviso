import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPlanEntity } from '../../../infrastructure/database/entities/user-plan.entity';
import { PlanEntity } from '../../../infrastructure/database/entities/plan.entity';
import { WebsiteEntity } from '../../../infrastructure/database/entities/website.entity';

/**
 * Entitlement Service
 * 
 * CRITICAL: This service enforces plan limits and prevents abuse.
 * 
 * Rules:
 * 1. Never trust client-side plan information
 * 2. Always check limits before allowing actions
 * 3. Log all entitlement checks for audit
 * 4. Reset usage monthly
 */
@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);

  constructor(
    @InjectRepository(UserPlanEntity)
    private readonly userPlanRepository: Repository<UserPlanEntity>,
    @InjectRepository(PlanEntity)
    private readonly planRepository: Repository<PlanEntity>,
    @InjectRepository(WebsiteEntity)
    private readonly websiteRepository: Repository<WebsiteEntity>,
  ) {}

  /**
   * Get user's current plan and limits
   */
  async getUserPlan(userId: string, workspaceId?: string): Promise<{
    plan: PlanEntity;
    userPlan: UserPlanEntity;
    limits: PlanEntity['limits'];
  }> {
    const userPlan = await this.userPlanRepository.findOne({
      where: workspaceId
        ? { userId, workspaceId, status: 'active' }
        : { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });

    if (!userPlan) {
      // Default to free plan
      const freePlan = await this.planRepository.findOne({
        where: { code: 'free', active: true },
      });
      
      if (!freePlan) {
        throw new BadRequestException('No plan configuration found');
      }

      // Create default free plan for user
      const newUserPlan = this.userPlanRepository.create({
        userId,
        workspaceId: workspaceId || null,
        planId: freePlan.id,
        status: 'active',
        usage: {
          websites: 0,
          apiCalls: 0,
          gscApiCalls: 0,
          psiApiCalls: 0,
          crawlPages: 0,
          lastResetAt: new Date().toISOString(),
        },
      });

      await this.userPlanRepository.save(newUserPlan);

      return {
        plan: freePlan,
        userPlan: newUserPlan,
        limits: freePlan.limits,
      };
    }

    const plan = await this.planRepository.findOne({
      where: { id: userPlan.planId },
    });

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    // Reset usage if new month
    await this.resetUsageIfNeeded(userPlan);

    return {
      plan,
      userPlan,
      limits: plan.limits,
    };
  }

  /**
   * Check if user can add a website
   */
  async canAddWebsite(userId: string, workspaceId?: string): Promise<{ allowed: boolean; reason?: string }> {
    const { userPlan, limits } = await this.getUserPlan(userId, workspaceId);

    // Count current websites
    const websiteCount = await this.websiteRepository.count({
      where: workspaceId
        ? { userId, workspaceId }
        : { userId },
    });

    if (websiteCount >= limits.maxWebsites) {
      return {
        allowed: false,
        reason: `Plan limit reached. Maximum ${limits.maxWebsites} website(s) allowed.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can make an API call
   */
  async canMakeApiCall(
    userId: string,
    apiType: 'general' | 'gsc' | 'psi',
    workspaceId?: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const { userPlan, limits } = await this.getUserPlan(userId, workspaceId);

    // Reset usage if needed
    await this.resetUsageIfNeeded(userPlan);

    const usage = userPlan.usage;

    let limit: number;
    let currentUsage: number;

    switch (apiType) {
      case 'gsc':
        limit = limits.maxGscApiCalls;
        currentUsage = usage.gscApiCalls;
        break;
      case 'psi':
        limit = limits.maxPsiApiCalls;
        currentUsage = usage.psiApiCalls;
        break;
      default:
        limit = limits.maxApiCalls;
        currentUsage = usage.apiCalls;
    }

    if (currentUsage >= limit) {
      return {
        allowed: false,
        reason: `API quota exceeded. ${apiType.toUpperCase()} API limit: ${limit} calls/month.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if feature is enabled for user
   */
  async hasFeature(
    userId: string,
    feature: keyof PlanEntity['limits']['features'],
    workspaceId?: string,
  ): Promise<boolean> {
    const { limits } = await this.getUserPlan(userId, workspaceId);
    return limits.features[feature] === true;
  }

  /**
   * Increment API call usage
   */
  async incrementApiCall(
    userId: string,
    apiType: 'general' | 'gsc' | 'psi',
    workspaceId?: string,
  ): Promise<void> {
    const { userPlan } = await this.getUserPlan(userId, workspaceId);

    // Reset usage if needed
    await this.resetUsageIfNeeded(userPlan);

    const usage = { ...userPlan.usage };

    switch (apiType) {
      case 'gsc':
        usage.gscApiCalls = (usage.gscApiCalls || 0) + 1;
        break;
      case 'psi':
        usage.psiApiCalls = (usage.psiApiCalls || 0) + 1;
        break;
      default:
        usage.apiCalls = (usage.apiCalls || 0) + 1;
    }

    userPlan.usage = usage;
    await this.userPlanRepository.save(userPlan);

    this.logger.debug(`Incremented ${apiType} API call for user ${userId}`);
  }

  /**
   * Reset usage if new month
   */
  private async resetUsageIfNeeded(userPlan: UserPlanEntity): Promise<void> {
    const lastReset = new Date(userPlan.usage.lastResetAt || userPlan.createdAt);
    const now = new Date();

    // Check if we're in a new month
    if (
      now.getFullYear() > lastReset.getFullYear() ||
      now.getMonth() > lastReset.getMonth()
    ) {
      userPlan.usage = {
        websites: userPlan.usage.websites, // Don't reset website count
        apiCalls: 0,
        gscApiCalls: 0,
        psiApiCalls: 0,
        crawlPages: 0,
        lastResetAt: now.toISOString(),
      };

      await this.userPlanRepository.save(userPlan);
      this.logger.log(`Reset monthly usage for user plan ${userPlan.id}`);
    }
  }

  /**
   * Enforce website limit (throws if exceeded)
   */
  async enforceWebsiteLimit(userId: string, workspaceId?: string): Promise<void> {
    const check = await this.canAddWebsite(userId, workspaceId);
    if (!check.allowed) {
      throw new ForbiddenException(check.reason);
    }
  }

  /**
   * Enforce API call limit (throws if exceeded)
   */
  async enforceApiCallLimit(
    userId: string,
    apiType: 'general' | 'gsc' | 'psi',
    workspaceId?: string,
  ): Promise<void> {
    const check = await this.canMakeApiCall(userId, apiType, workspaceId);
    if (!check.allowed) {
      throw new ForbiddenException(check.reason);
    }
  }

  /**
   * Enforce feature access (throws if not available)
   */
  async enforceFeature(
    userId: string,
    feature: keyof PlanEntity['limits']['features'],
    workspaceId?: string,
  ): Promise<void> {
    const hasAccess = await this.hasFeature(userId, feature, workspaceId);
    if (!hasAccess) {
      throw new ForbiddenException(`Feature "${feature}" is not available on your plan.`);
    }
  }
}

import { DataSource } from 'typeorm';
import { PlanEntity } from '../entities/plan.entity';

/**
 * Plan Seeder
 * 
 * Seeds default plans into the database
 * Run this on application startup if plans don't exist
 */
export async function seedPlans(dataSource: DataSource): Promise<void> {
  const planRepository = dataSource.getRepository(PlanEntity);

  const plans = [
    {
      code: 'free',
      name: 'Free',
      description: 'Perfect for getting started with SEO analysis',
      limits: {
        maxWebsites: 1,
        maxApiCalls: 100,
        maxGscApiCalls: 50,
        maxPsiApiCalls: 10,
        maxCrawlPages: 100,
        features: {
          technicalSeo: false,
          offPageSeo: false,
          croInsights: false,
          aiAssistant: false,
          searchConsole: true,
          pagespeedInsights: false,
          competitorAnalysis: false,
          serpTracking: false,
          customReports: false,
          apiAccess: false,
          webhooks: false,
        },
        dataRetentionDays: 30,
        supportLevel: 'community' as const,
      },
      pricing: {
        monthly: 0,
        yearly: 0,
        currency: 'USD',
      },
      active: true,
    },
    {
      code: 'pro',
      name: 'Pro',
      description: 'For growing businesses and agencies',
      limits: {
        maxWebsites: 10,
        maxApiCalls: 5000,
        maxGscApiCalls: 1000,
        maxPsiApiCalls: 200,
        maxCrawlPages: 5000,
        features: {
          technicalSeo: true,
          offPageSeo: true,
          croInsights: true,
          aiAssistant: true,
          searchConsole: true,
          pagespeedInsights: true,
          competitorAnalysis: true,
          serpTracking: true,
          customReports: true,
          apiAccess: true,
          webhooks: false,
        },
        dataRetentionDays: 365,
        supportLevel: 'email' as const,
      },
      pricing: {
        monthly: 99,
        yearly: 990,
        currency: 'USD',
      },
      active: true,
    },
    {
      code: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      limits: {
        maxWebsites: 100,
        maxApiCalls: 50000,
        maxGscApiCalls: 10000,
        maxPsiApiCalls: 2000,
        maxCrawlPages: 50000,
        features: {
          technicalSeo: true,
          offPageSeo: true,
          croInsights: true,
          aiAssistant: true,
          searchConsole: true,
          pagespeedInsights: true,
          competitorAnalysis: true,
          serpTracking: true,
          customReports: true,
          apiAccess: true,
          webhooks: true,
        },
        dataRetentionDays: 2555, // 7 years
        supportLevel: 'dedicated' as const,
      },
      pricing: {
        monthly: 499,
        yearly: 4990,
        currency: 'USD',
      },
      active: true,
    },
  ];

  for (const planData of plans) {
    const existing = await planRepository.findOne({
      where: { code: planData.code },
    });

    if (!existing) {
      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      console.log(`✓ Seeded plan: ${planData.name}`);
    } else {
      // Update existing plan
      Object.assign(existing, planData);
      await planRepository.save(existing);
      console.log(`✓ Updated plan: ${planData.name}`);
    }
  }
}

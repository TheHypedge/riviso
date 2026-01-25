/**
 * Central export for all database entities
 */

// Commenting out user/project entities temporarily - they exist in modules
// export { UserEntity } from '../../modules/user/entities/user.entity';
// export { ProjectEntity } from '../../modules/project/entities/project.entity';
export { WorkspaceEntity } from './workspace.entity';
export { PageEntity } from './page.entity';
export { KeywordEntity } from './keyword.entity';
export { KeywordRankingEntity } from './keyword-ranking.entity';
export { CompetitorEntity } from './competitor.entity';
export { SeoAuditEntity } from './seo-audit.entity';
export { CroInsightEntity } from './cro-insight.entity';
export { GSCIntegrationEntity } from './gsc-integration.entity';

/* GSC module (additive) */
export { WebsiteEntity } from './website.entity';
export { GoogleAccountEntity } from './google-account.entity';
export { GoogleTokenEntity } from './google-token.entity';
export { GSCPropertyEntity } from './gsc-property.entity';
export { GSCSyncLogEntity, type GSCSyncStatus } from './gsc-sync-log.entity';
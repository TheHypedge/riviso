import { UserRole } from './auth';

/**
 * User & Workspace types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

/** Profile update (settings) */
export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/** Password change */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** Integration provider */
export type IntegrationProvider =
  | 'google_search_console'
  | 'google_ads'
  | 'meta'
  | 'google_analytics'
  | 'google_tag_manager';

export interface UserIntegration {
  provider: IntegrationProvider;
  connectedAt: string;
  externalId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
}

export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface WorkspaceSettings {
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    slack: boolean;
  };
}

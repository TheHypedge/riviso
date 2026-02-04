/**
 * Authentication & Authorization types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspaces: string[];
  emailVerified: boolean;
  onboardingCompleted?: boolean;
  websiteCount?: number;
  maxWebsites?: number; // -1 for unlimited (admin)
}

// Admin dashboard types
export interface SystemStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalWebsites: number;
  usersRegisteredToday: number;
  usersRegisteredThisWeek: number;
  usersRegisteredThisMonth: number;
}

export interface AdminUserInfo extends UserInfo {
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  websites?: string[];
}

export interface RegistrationResponse {
  message: string;
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  workspaceId?: string;
  iat?: number;
  exp?: number;
}

export interface OAuth2Provider {
  provider: 'google' | 'github';
  code: string;
  redirectUri: string;
}

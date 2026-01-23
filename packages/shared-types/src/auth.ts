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

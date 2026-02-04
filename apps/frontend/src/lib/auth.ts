import { AuthResponse, LoginRequest, RegisterRequest, RegistrationResponse, UserInfo } from '@riviso/shared-types';
import api from './api';

export const authService = {
  // Alias for getCurrentUser (for consistency)
  getUser(): UserInfo | null {
    return this.getCurrentUser();
  },

  // Check if user can add more websites
  canAddWebsite(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    // Admin has unlimited websites (-1)
    if (user.maxWebsites === -1) return true;
    // Check against limit (default 1 for regular users)
    const maxWebsites = user.maxWebsites ?? 1;
    const currentCount = user.websiteCount ?? 0;
    return currentCount < maxWebsites;
  },

  // Get website limit info
  getWebsiteLimitInfo(): { current: number; max: number; isUnlimited: boolean } {
    const user = this.getCurrentUser();
    if (!user) return { current: 0, max: 1, isUnlimited: false };
    return {
      current: user.websiteCount ?? 0,
      max: user.maxWebsites ?? 1,
      isUnlimited: user.maxWebsites === -1,
    };
  },

  // Update website count in stored user
  updateWebsiteCount(count: number) {
    const user = this.getCurrentUser();
    if (!user) return;
    const updated = { ...user, websiteCount: count };
    localStorage.setItem('user', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('riviso-user-updated'));
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/v1/auth/login', credentials);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw the original error so caller can check for EMAIL_NOT_VERIFIED
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<RegistrationResponse> {
    try {
      const response = await api.post<RegistrationResponse>('/v1/auth/register', data);
      // Registration no longer returns tokens - user must verify email first
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/v1/auth/verify-email', { email, code });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/v1/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  /** Update stored user (name, email, phone, avatar, onboarding status) after profile save. Keeps initials/profile in sync. */
  updateStoredUser(updates: { name?: string; email?: string; phone?: string; avatar?: string; emailVerified?: boolean; onboardingCompleted?: boolean }) {
    if (typeof window === 'undefined') return;
    const current = this.getCurrentUser();
    if (!current) return;
    const next = { ...current, ...updates };
    localStorage.setItem('user', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('riviso-user-updated'));
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  },

  isEmailVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.emailVerified ?? false;
  },
};

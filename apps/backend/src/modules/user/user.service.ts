import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserIntegrationsStore } from './user-integrations.store';
import type {
  User,
  UpdateProfileDto,
  ChangePasswordDto,
  UserIntegration,
  IntegrationProvider,
} from '@riviso/shared-types';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly integrationsStore: UserIntegrationsStore,
  ) {}

  async findById(id: string): Promise<User> {
    const user = this.authService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const updatedAt = (user.updatedAt as Date) ?? (user.createdAt as Date);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: (user.createdAt as Date).toISOString(),
      updatedAt: (updatedAt instanceof Date ? updatedAt : new Date(updatedAt)).toISOString(),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.authService.updateProfile(userId, dto);
    return this.findById(user.id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    await this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  getIntegrations(userId: string): UserIntegration[] {
    return this.integrationsStore.list(userId);
  }

  connectIntegration(userId: string, provider: IntegrationProvider, externalId?: string): void {
    this.integrationsStore.connect(userId, provider, externalId);
  }

  disconnectIntegration(userId: string, provider: IntegrationProvider): void {
    this.integrationsStore.disconnect(userId, provider);
  }

  isIntegrationConnected(userId: string, provider: IntegrationProvider): boolean {
    return this.integrationsStore.isConnected(userId, provider);
  }

  async completeOnboarding(userId: string): Promise<void> {
    await this.authService.completeOnboarding(userId);
  }

  canAddWebsite(userId: string): { canAdd: boolean; reason?: string; currentCount: number; maxAllowed: number } {
    return this.authService.canAddWebsite(userId);
  }

  addWebsiteToUser(userId: string, websiteId: string): void {
    this.authService.addWebsiteToUser(userId, websiteId);
  }

  removeWebsiteFromUser(userId: string, websiteId: string): void {
    this.authService.removeWebsiteFromUser(userId, websiteId);
  }
}

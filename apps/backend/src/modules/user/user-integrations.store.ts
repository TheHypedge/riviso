import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { IntegrationProvider, UserIntegration } from '@riviso/shared-types';

type Store = Record<string, Record<string, { connectedAt: string; externalId?: string }>>;

@Injectable()
export class UserIntegrationsStore {
  private readonly logger = new Logger(UserIntegrationsStore.name);
  private readonly filePath: string;
  private store: Store = {};

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    this.filePath = path.join(dataDir, 'user_integrations.json');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.store = JSON.parse(raw) as Store;
      }
    } catch (e: any) {
      this.logger.warn(`Failed to load user_integrations: ${e?.message}`);
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (e: any) {
      this.logger.warn(`Failed to save user_integrations: ${e?.message}`);
    }
  }

  list(userId: string): UserIntegration[] {
    const user = this.store[userId];
    if (!user) return [];
    return Object.entries(user).map(([provider, data]) => ({
      provider: provider as IntegrationProvider,
      connectedAt: data.connectedAt,
      externalId: data.externalId,
    }));
  }

  isConnected(userId: string, provider: IntegrationProvider): boolean {
    return !!this.store[userId]?.[provider];
  }

  connect(userId: string, provider: IntegrationProvider, externalId?: string): void {
    if (!this.store[userId]) this.store[userId] = {};
    this.store[userId][provider] = {
      connectedAt: new Date().toISOString(),
      externalId,
    };
    this.save();
    this.logger.log(`Integration connected: user=${userId} provider=${provider}`);
  }

  disconnect(userId: string, provider: IntegrationProvider): void {
    if (!this.store[userId]) return;
    delete this.store[userId][provider];
    if (Object.keys(this.store[userId]).length === 0) delete this.store[userId];
    this.save();
    this.logger.log(`Integration disconnected: user=${userId} provider=${provider}`);
  }
}

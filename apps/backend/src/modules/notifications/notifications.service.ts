import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { EmailService } from './services/email.service';
import { SlackService } from './services/slack.service';

@Injectable()
export class NotificationsService {
  constructor(
    private emailService: EmailService,
    private slackService: SlackService,
  ) {}

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string) {
    // Mock implementation
    return {
      notifications: [
        {
          id: 'notif-1',
          userId,
          type: 'ranking_change',
          title: 'Keyword ranking improved',
          message: 'Your keyword "seo tools" moved from #5 to #3',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-2',
          userId,
          type: 'seo_alert',
          title: 'Critical SEO issue detected',
          message: 'High bounce rate detected on /products page',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'notif-3',
          userId,
          type: 'cro_insight',
          title: 'New CRO opportunity',
          message: 'Potential +45% conversion increase on checkout page',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      unreadCount: 2,
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    return {
      userId,
      unreadCount: 2,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return {
      success: true,
      notificationId,
      readAt: new Date().toISOString(),
    };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return {
      success: true,
      userId,
      markedCount: 5,
    };
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string) {
    // Mock implementation
    return {
      userId,
      preferences: {
        email: {
          enabled: true,
          rankingChanges: true,
          seoAlerts: true,
          croInsights: true,
          weeklyReport: true,
          frequency: 'immediate',
        },
        slack: {
          enabled: false,
          webhookUrl: null,
          channels: [],
        },
        inApp: {
          enabled: true,
        },
      },
    };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // Mock implementation
    return {
      success: true,
      userId,
      preferences: dto,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Send notification
   */
  async sendNotification(dto: CreateNotificationDto) {
    const { userId, type, title, message, channels } = dto;

    // Send via email if enabled
    if (channels?.includes('email')) {
      await this.emailService.send({
        to: userId, // In production, fetch user email
        subject: title,
        body: message,
      });
    }

    // Send via Slack if enabled
    if (channels?.includes('slack')) {
      await this.slackService.send({
        userId,
        message: `${title}\n${message}`,
      });
    }

    return {
      success: true,
      notificationId: `notif-${Date.now()}`,
      sentVia: channels || ['in_app'],
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Trigger ranking change alert
   */
  async triggerRankingAlert(userId: string, keyword: string, oldRank: number, newRank: number) {
    const direction = newRank < oldRank ? 'improved' : 'dropped';
    const change = Math.abs(newRank - oldRank);

    return this.sendNotification({
      userId,
      type: 'ranking_change',
      title: `Keyword ranking ${direction}`,
      message: `"${keyword}" moved from #${oldRank} to #${newRank} (${change} positions)`,
      channels: ['email', 'in_app'],
    });
  }

  /**
   * Trigger SEO alert
   */
  async triggerSEOAlert(userId: string, issueType: string, details: string) {
    return this.sendNotification({
      userId,
      type: 'seo_alert',
      title: `SEO Alert: ${issueType}`,
      message: details,
      channels: ['email', 'in_app'],
    });
  }
}

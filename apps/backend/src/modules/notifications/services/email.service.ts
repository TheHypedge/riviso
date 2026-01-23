import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send email notification
   */
  async send(options: { to: string; subject: string; body: string }) {
    // Mock implementation - in production, use SendGrid, AWS SES, etc.
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `email-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Send weekly report email
   */
  async sendWeeklyReport(userId: string, reportData: any) {
    return this.send({
      to: userId,
      subject: 'Your Weekly SEO & Growth Report',
      body: this.buildWeeklyReportEmail(reportData),
    });
  }

  /**
   * Build weekly report email HTML
   */
  private buildWeeklyReportEmail(data: any): string {
    return `
      <h1>Weekly Report</h1>
      <p>Here are your key metrics for this week:</p>
      <ul>
        <li>Organic Traffic: ${data.traffic}</li>
        <li>Ranking Changes: ${data.rankingChanges}</li>
        <li>New Insights: ${data.insights}</li>
      </ul>
    `;
  }
}

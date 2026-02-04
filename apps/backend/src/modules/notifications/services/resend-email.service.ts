import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only (dev mode)');
    }
  }

  async sendVerificationEmail(to: string, code: string, userName: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'noreply@riviso.com');
    const html = this.buildVerificationEmailHtml(code, userName);

    // ALWAYS log OTP to console for debugging/backup (visible in backend logs)
    this.logger.log(`========================================`);
    this.logger.log(`VERIFICATION CODE for ${to}: ${code}`);
    this.logger.log(`========================================`);

    if (!this.resend) {
      // No Resend configured - console log is the only delivery method
      this.logger.warn(`[DEV MODE] No RESEND_API_KEY configured - use the OTP logged above`);
      return true;
    }

    try {
      const result = await this.resend.emails.send({
        from: `Riviso <${fromEmail}>`,
        to: [to],
        subject: 'Verify your Riviso account',
        html,
      });

      this.logger.log(`Verification email sent to ${to}: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      this.logger.warn(`Email failed but OTP was logged to console above - use that code`);
      return false;
    }
  }

  private buildVerificationEmailHtml(code: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 32px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 16px;
          }
          .code-container {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
          }
          .code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #7c3aed;
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
          }
          .expiry {
            color: #6b7280;
            font-size: 14px;
            margin-top: 8px;
          }
          .footer {
            background: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Riviso</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p>Welcome to Riviso! Please use the following verification code to complete your registration:</p>
            <div class="code-container">
              <div class="code">${code}</div>
              <p class="expiry">This code expires in 24 hours</p>
            </div>
            <p>If you didn't create a Riviso account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Riviso Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Riviso. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

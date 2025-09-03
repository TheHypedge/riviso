import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create a transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"RIVISO Analytics" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendWelcomeEmail = async (user: { firstName: string; lastName: string; email: string }) => {
  const subject = 'Welcome to RIVISO Analytics! 🎉'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RIVISO</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .welcome-title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .feature-list {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .feature-icon {
          width: 20px;
          height: 20px;
          background: #2563eb;
          border-radius: 50%;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #2563eb;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">RIVISO</div>
          <h1 class="welcome-title">Welcome to RIVISO Analytics! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hi ${user.firstName},</p>
          
          <p>Thank you for joining RIVISO Analytics! We're excited to help you optimize your website's SEO performance and drive more organic traffic.</p>
          
          <p>Your account has been successfully created with the email: <strong>${user.email}</strong></p>
          
          <div class="feature-list">
            <h3 style="margin-top: 0; color: #1f2937;">What you can do with RIVISO:</h3>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <span>Comprehensive SEO audits with detailed insights</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <span>Performance metrics and Core Web Vitals analysis</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <span>Keyword analysis and optimization recommendations</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <span>Mobile and desktop performance tracking</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <span>PDF reports for easy sharing and documentation</span>
            </div>
          </div>
          
          <p>Ready to get started? Click the button below to access your dashboard and run your first SEO audit!</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://riviso.vercel.app'}/dashboard" class="cta-button">
              Go to Dashboard
            </a>
          </div>
          
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>
          The RIVISO Team</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="#">Website</a> |
            <a href="#">Support</a> |
            <a href="#">Privacy Policy</a>
          </div>
          <p>© 2024 RIVISO Analytics. All rights reserved.</p>
          <p>This email was sent to ${user.email}. If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: user.email,
    subject,
    html,
  })
}

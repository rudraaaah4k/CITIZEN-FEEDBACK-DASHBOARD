import nodemailer from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}: ${error}`);
    throw error;
  }
};

export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .card { background: #1a1a2e; border: 1px solid #2d2d3a; border-radius: 16px; padding: 40px; }
        .btn { display: inline-block; background: #6366f1; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏛️ CitizenFeedback</div>
        </div>
        <div class="card">
          <h2>Welcome, ${name}! 👋</h2>
          <p>Thank you for joining the Citizen Feedback Platform. Your voice matters and helps us build a better community.</p>
          <p>You can now:</p>
          <ul>
            <li>Submit feedback and complaints</li>
            <li>Track your submissions in real-time</li>
            <li>Receive updates on your feedback status</li>
            <li>View analytics and insights</li>
          </ul>
          <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
          <p style="color: #6b7280; font-size: 14px;">If you have any questions, contact us at support@citizenfeedback.gov</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CitizenFeedback Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject: 'Welcome to CitizenFeedback Platform! 🏛️', html });
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetToken: string
): Promise<void> => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; text-align: center; margin-bottom: 40px; }
        .card { background: #1a1a2e; border: 1px solid #2d2d3a; border-radius: 16px; padding: 40px; }
        .btn { display: inline-block; background: #6366f1; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .warning { background: #1f1a00; border: 1px solid #854d0e; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #fbbf24; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏛️ CitizenFeedback</div>
        <div class="card">
          <h2>Reset Your Password</h2>
          <p>Hi ${name}, we received a request to reset your password.</p>
          <p>Click the button below to reset your password. This link is valid for <strong>10 minutes</strong>.</p>
          <a href="${resetURL}" class="btn">Reset Password →</a>
          <div class="warning">
            ⚠️ If you did not request this, please ignore this email. Your password will remain unchanged.
          </div>
          <p style="color: #6b7280; font-size: 12px;">If the button doesn't work, copy this URL: ${resetURL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject: 'Password Reset Request - CitizenFeedback', html });
};

export const sendFeedbackStatusEmail = async (
  name: string,
  email: string,
  trackingId: string,
  status: string,
  note?: string
): Promise<void> => {
  const statusColors: Record<string, string> = {
    under_review: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#10b981',
    rejected: '#ef4444',
  };

  const color = statusColors[status] || '#6366f1';
  const statusLabel = status.replace('_', ' ').toUpperCase();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; text-align: center; margin-bottom: 40px; }
        .card { background: #1a1a2e; border: 1px solid #2d2d3a; border-radius: 16px; padding: 40px; }
        .status-badge { display: inline-block; background: ${color}22; color: ${color}; border: 1px solid ${color}; padding: 6px 16px; border-radius: 100px; font-size: 14px; font-weight: 600; }
        .tracking { background: #0f0f1a; border: 1px solid #2d2d3a; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; }
        .btn { display: inline-block; background: #6366f1; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏛️ CitizenFeedback</div>
        <div class="card">
          <h2>Feedback Status Update</h2>
          <p>Hi ${name}, your feedback status has been updated.</p>
          <div class="tracking">${trackingId}</div>
          <p>New Status: <span class="status-badge">${statusLabel}</span></p>
          ${note ? `<p><strong>Note from admin:</strong> ${note}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/track/${trackingId}" class="btn">Track Feedback →</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Feedback ${trackingId} - Status Updated to ${statusLabel}`,
    html,
  });
};

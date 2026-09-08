import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load server/.env first, then parent .env as fallback if credentials are missing
dotenv.config();
if (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('your_16_digit')) {
  dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}

export const getAdminEmail = () => process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com';
export const getSmtpUser = () => process.env.SMTP_USER || 'digi8solutions@gmail.com';
export const getSmtpPass = () => (process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
export const getAppUrl = () => process.env.APP_URL || 'https://digi8solutions.com';

// Validates email syntax and filters out dummy/pending placeholder emails
export const isValidEmail = (email?: string | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.includes('pending@') || trimmed.endsWith('.digi8')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

// Create reusable transporter object using SMTP transport
export const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: getSmtpUser(),
      pass: getSmtpPass(),
    },
  });
};

const transporter = getTransporter();

// Verify live SMTP connection
export const verifySmtpConnection = async (): Promise<{ success: boolean; message: string; user?: string }> => {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log(`[SMTP READY] Successfully authenticated with ${process.env.SMTP_HOST || 'smtp.gmail.com'} as ${getSmtpUser()}`);
    return { success: true, message: 'SMTP credentials verified successfully', user: getSmtpUser() };
  } catch (err: any) {
    console.error('[SMTP ERROR] Authentication failed:', err.message);
    return { success: false, message: err.message, user: getSmtpUser() };
  }
};

export const sendInstantReply = async (to: string, name: string, type: 'contact' | 'lead' | 'quote'): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping instant reply to invalid or dummy address: ${to}`);
    return { success: false, error: 'Invalid or dummy recipient email' };
  }

  let subject = '';
  let text = '';
  let html = '';

  if (type === 'contact') {
    subject = 'Thank you for contacting Digi8 Solutions';
    text = `Hi ${name},\n\nThank you for reaching out to us. We have received your message and our team will get back to you shortly.\n\nBest regards,\nDigi8 Team`;
    html = `<p>Hi <strong>${name}</strong>,</p><p>Thank you for reaching out to us. We have received your message and our team will get back to you shortly.</p><p>Best regards,<br/>Digi8 Team</p>`;
  } else if (type === 'lead' || type === 'quote') {
    subject = 'Your Inquiry with Digi8 Solutions';
    text = `Hi ${name},\n\nWe have received your project inquiry. One of our digital experts will review your requirements and contact you soon to discuss the next steps.\n\nBest regards,\nDigi8 Team`;
    html = `<p>Hi <strong>${name}</strong>,</p><p>We have received your project inquiry. One of our digital experts will review your requirements and contact you soon to discuss the next steps.</p><p>Best regards,<br/>Digi8 Team</p>`;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Digi8 Solutions" <${getSmtpUser()}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Instant reply sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending instant reply:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async (to: string, token: string, type: string): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping verification email to invalid or dummy address: ${to}`);
    return { success: false, error: 'Invalid or dummy recipient email' };
  }

  const APP_URL = getAppUrl();
  const verificationLink = `${APP_URL}/verify-email?token=${token}&type=${type}`;

  const subject = 'Verify your email address - Digi8 Solutions';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #06B6D4;">Digi8 Solutions</h2>
      <p>Thank you for your submission. Please verify your email address to confirm your request.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Digi8 Solutions" <${getSmtpUser()}>`,
      to,
      subject,
      html,
    });
    console.log(`Verification email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    return { success: false, error: 'Invalid recipient email' };
  }

  const APP_URL = getAppUrl();
  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  const subject = 'Password Reset Request - Digi8 Solutions';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #06B6D4;">Digi8 Solutions</h2>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Digi8 Solutions" <${getSmtpUser()}>`,
      to,
      subject,
      html,
    });
    console.log(`Password reset email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAdminNotification = async (type: 'lead' | 'contact' | 'quote', data: any): Promise<{ success: boolean; error?: string }> => {
  const ADMIN_EMAIL = getAdminEmail();
  const subject = `[NEW ${type.toUpperCase()}] Notification on Digi8 Solutions`;
  let detailsHtml = '';

  if (type === 'lead') {
    detailsHtml = `
      <p><strong>Name:</strong> ${data.first_name || ''} ${data.last_name || ''}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
      <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
      <p><strong>Industry:</strong> ${data.industry || 'N/A'}</p>
      <p><strong>Budget:</strong> ${data.budget || 'N/A'}</p>
      <p><strong>Services:</strong> ${Array.isArray(data.services) ? data.services.join(', ') : data.services || 'N/A'}</p>
      <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
    `;
  } else if (type === 'contact') {
    detailsHtml = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
      <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
    `;
  } else if (type === 'quote') {
    detailsHtml = `
      <p><strong>Quote No:</strong> ${data.quote_number || 'N/A'}</p>
      <p><strong>Name:</strong> ${data.first_name || ''} ${data.last_name || ''}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
      <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
      <p><strong>Project Type:</strong> ${data.project_type || 'N/A'}</p>
      <p><strong>Estimated Total:</strong> ₹${data.total_estimate || 0}</p>
      <p><strong>Project Details:</strong> ${data.project_details || 'N/A'}</p>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #06B6D4; border-radius: 10px;">
      <h2 style="color: #06B6D4;">Digi8 Solutions — New ${type.toUpperCase()} Submission</h2>
      ${detailsHtml}
      <hr style="border: 0.5px solid #eee; margin: 20px 0;"/>
      <p style="font-size: 12px; color: #666;">This notification was automatically sent to admin: ${ADMIN_EMAIL}</p>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Digi8 System" <${getSmtpUser()}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
    console.log(`Admin notification sent to ${ADMIN_EMAIL} for ${type}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendCandidateApplicationReceived = async (
  to: string,
  candidateName: string,
  jobTitle: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping candidate email to invalid address: ${to}`);
    return { success: false, error: 'Invalid candidate email address' };
  }

  const APP_URL = getAppUrl();
  const subject = `Application Received: ${jobTitle} — DIGI8 Solutions (${applicationId})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
      <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #06B6D4; margin: 0; font-size: 22px;">DIGI8 Solutions</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Careers & Talent Acquisition</p>
      </div>

      <h3 style="color: #ffffff; font-size: 18px; margin-top: 0;">Application Submitted Successfully</h3>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Thank you for your interest in joining DIGI8 Solutions. We have received your application for the role of <strong>${jobTitle}</strong>.
      </p>

      <div style="background-color: #1e293b; border-left: 4px solid #06B6D4; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">Your Unique Application ID:</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #38bdf8; letter-spacing: 0.5px;">${applicationId}</p>
      </div>

      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Our talent acquisition team is actively reviewing submissions. If your profile matches our requirements, we will reach out to schedule the next steps in our selection process.
      </p>

      <p style="color: #94a3b8; font-size: 13px; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px;">
        Best regards,<br/>
        <strong style="color: #f8fafc;">DIGI8 Solutions Talent Team</strong><br/>
        <a href="${APP_URL}" style="color: #06B6D4; text-decoration: none;">digi8solutions.com</a>
      </p>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"DIGI8 Solutions Careers" <${getSmtpUser()}>`,
      to,
      subject,
      html,
    });
    console.log(`Candidate confirmation sent to ${to} for ${applicationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending candidate confirmation email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAdminCareerNotification = async (
  application: any,
  jobTitle: string
): Promise<{ success: boolean; error?: string }> => {
  const ADMIN_EMAIL = getAdminEmail();
  const APP_URL = getAppUrl();
  const subject = `[NEW APPLICATION] ${jobTitle} — ${application.candidate_name} (${application.application_id})`;
  const dashboardLink = `${APP_URL}/admin/careers`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #06B6D4; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="border-bottom: 2px solid #06B6D4; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="color: #0e7490; margin: 0;">DIGI8 Solutions — New Job Application</h2>
        <span style="background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Phase 1 Recruitment</span>
      </div>

      <p style="font-size: 15px;">A new candidate has submitted an application on <strong>DIGI8Solutions.com/career</strong>.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; width: 35%; color: #475569;">Application ID:</td><td style="padding: 8px; font-family: monospace; font-weight: bold; color: #0284c7;">${application.application_id}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Position:</td><td style="padding: 8px; font-weight: bold;">${jobTitle}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Candidate Name:</td><td style="padding: 8px;">${application.candidate_name}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Email:</td><td style="padding: 8px;"><a href="mailto:${application.email}">${application.email}</a></td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Phone:</td><td style="padding: 8px;">${application.phone}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Current Role:</td><td style="padding: 8px;">${application.current_role || 'Not specified'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Experience:</td><td style="padding: 8px;">${application.experience || 'Not specified'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Location:</td><td style="padding: 8px;">${application.location || 'Not specified'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; color: #475569;">Expected Compensation:</td><td style="padding: 8px;">${application.expected_compensation || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Availability:</td><td style="padding: 8px;">${application.availability || 'Not specified'}</td></tr>
      </table>

      <div style="margin: 24px 0; text-align: center;">
        <a href="${dashboardLink}" style="background-color: #0891b2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This automated alert was sent to ${ADMIN_EMAIL}.</p>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"DIGI8 Career Alerts" <${getSmtpUser()}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
    console.log(`Admin career alert sent to ${ADMIN_EMAIL} for ${application.application_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending admin career alert:', error);
    return { success: false, error: error.message };
  }
};

export const compileEmailTemplate = (
  templateContent: string,
  variables: Record<string, string | number | undefined | null>
): string => {
  let compiled = templateContent;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    compiled = compiled.replace(regex, val !== undefined && val !== null ? String(val) : '');
  }
  return compiled;
};

export const sendRecruiterEmail = async (
  to: string,
  subject: string,
  bodyContent: string,
  options?: { candidateName?: string; jobTitle?: string }
): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping recruiter email to invalid address: ${to}`);
    return { success: false, error: 'Invalid candidate email address' };
  }

  const APP_URL = getAppUrl();
  // Check if bodyContent is raw text or already HTML
  const formattedBody = bodyContent.includes('<p>') || bodyContent.includes('<div>')
    ? bodyContent
    : bodyContent
        .split('\n')
        .map((line) => (line.trim() ? `<p style="margin: 0 0 12px 0; line-height: 1.6;">${line}</p>` : '<br/>'))
        .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
      <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="color: #06B6D4; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">DIGI8 Solutions</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Talent Acquisition & Careers</p>
        </div>
      </div>

      <div style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
        ${formattedBody}
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 4px 0;">This email was sent by DIGI8 Solutions Talent Acquisition.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} DIGI8 Solutions. All rights reserved. | <a href="${APP_URL}" style="color: #06B6D4; text-decoration: none;">digi8solutions.com</a></p>
      </div>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"DIGI8 Solutions Careers" <${getSmtpUser()}>`,
      to,
      subject,
      html,
    });
    console.log(`Recruiter email successfully sent to ${to} (${subject})`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending recruiter email:', error);
    return { success: false, error: error?.message || 'Failed to dispatch email' };
  }
};

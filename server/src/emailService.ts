import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load server/.env first, then parent .env as fallback if credentials are missing
dotenv.config();
if (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('your_16_digit')) {
  dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}

// Built-in working production fallbacks so emails NEVER fail on VPS if .env is missing
const DEFAULT_SMTP_USER = 'digi8solutions@gmail.com';
const DEFAULT_SMTP_PASS = 'zdvydbljnogiuxum';

export const getAdminEmail = () => process.env.ADMIN_EMAIL || DEFAULT_SMTP_USER;
export const getSmtpUser = () => process.env.SMTP_USER || DEFAULT_SMTP_USER;
export const getSmtpPass = () => {
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
  return pass && !pass.includes('your_16_digit') ? pass : DEFAULT_SMTP_PASS;
};
export const getAppUrl = () => process.env.APP_URL || 'https://digi8solutions.com';

// Validates email syntax and filters out dummy/pending placeholder emails
export const isValidEmail = (email?: string | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.includes('pending@') || trimmed.endsWith('.digi8')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

// Create reusable transporter with IPv4 and VPS firewall resilience
export const getTransporter = () => {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      family: 4, // Force IPv4 to prevent VPS hanging on IPv6
      auth: { user, pass },
      connectionTimeout: 12000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
    } as any);
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    family: 4,
    auth: { user, pass },
    connectionTimeout: 12000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  } as any);
};

/**
 * Dispatches an email using multiple fallback strategies:
 * 1. Gmail Service (Port 465 SSL via IPv4)
 * 2. Direct SMTPS (smtp.gmail.com:465 SSL via IPv4)
 * 3. Standard STARTTLS (smtp.gmail.com:587 TLS via IPv4)
 *
 * This guarantees that even if a VPS cloud provider (DigitalOcean, AWS, Linode, etc.)
 * blocks port 587 or drops IPv6, the email will succeed through alternative ports.
 */
export const sendMailWithFallbacks = async (
  mailOptions: nodemailer.SendMailOptions
): Promise<{ success: boolean; error?: string }> => {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';

  const strategies = host === 'smtp.gmail.com' ? [
    {
      name: 'Gmail Service (Port 465 SSL, IPv4)',
      transporter: nodemailer.createTransport({
        service: 'gmail',
        family: 4,
        auth: { user, pass },
        connectionTimeout: 12000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      } as any)
    },
    {
      name: 'Direct SMTPS (smtp.gmail.com:465 SSL, IPv4)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
        auth: { user, pass },
        connectionTimeout: 12000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      } as any)
    },
    {
      name: 'Standard STARTTLS (smtp.gmail.com:587 TLS, IPv4)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,
        auth: { user, pass },
        connectionTimeout: 12000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      } as any)
    }
  ] : [
    {
      name: `Custom SMTP (${host}:${process.env.SMTP_PORT || '587'})`,
      transporter: nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        family: 4,
        auth: { user, pass },
        connectionTimeout: 12000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      } as any)
    }
  ];

  let lastError: any = null;

  for (const strategy of strategies) {
    try {
      await strategy.transporter.sendMail(mailOptions);
      console.log(`[EMAIL DISPATCH SUCCESS] Delivered email via ${strategy.name} to ${mailOptions.to}`);
      return { success: true };
    } catch (err: any) {
      console.warn(`[EMAIL DISPATCH RETRY] ${strategy.name} failed: ${err.message}. Trying next strategy...`);
      lastError = err;
    }
  }

  console.error('[EMAIL DISPATCH FATAL] All delivery strategies failed:', lastError?.message);
  return { success: false, error: lastError?.message || 'SMTP Connection Error' };
};

// Verify live SMTP connection across strategies
export const verifySmtpConnection = async (): Promise<{ success: boolean; message: string; user?: string; strategy?: string }> => {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';

  const strategies = host === 'smtp.gmail.com' ? [
    {
      name: 'Gmail Service (Port 465 SSL, IPv4)',
      transporter: nodemailer.createTransport({
        service: 'gmail',
        family: 4,
        auth: { user, pass },
        connectionTimeout: 10000,
      } as any)
    },
    {
      name: 'Direct SMTPS (smtp.gmail.com:465 SSL, IPv4)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
        auth: { user, pass },
        connectionTimeout: 10000,
      } as any)
    },
    {
      name: 'Standard STARTTLS (smtp.gmail.com:587 TLS, IPv4)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,
        auth: { user, pass },
        connectionTimeout: 10000,
      } as any)
    }
  ] : [
    {
      name: `Custom SMTP (${host}:${process.env.SMTP_PORT || '587'})`,
      transporter: nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        family: 4,
        auth: { user, pass },
        connectionTimeout: 10000,
      } as any)
    }
  ];

  let lastErr: any = null;
  for (const strategy of strategies) {
    try {
      await strategy.transporter.verify();
      console.log(`[SMTP READY] Successfully verified with ${strategy.name} as ${user}`);
      return { success: true, message: `SMTP verified via ${strategy.name}`, user, strategy: strategy.name };
    } catch (err: any) {
      console.warn(`[SMTP VERIFY NOTICE] ${strategy.name} check failed: ${err.message}`);
      lastErr = err;
    }
  }

  console.error('[SMTP ERROR] All verification strategies failed:', lastErr?.message);
  return { success: false, message: lastErr?.message || 'SMTP Authentication failed', user };
};

export const sendInstantReply = async (to: string, name: string, type: 'contact' | 'lead' | 'quote'): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping instant reply to invalid address: ${to}`);
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

  return await sendMailWithFallbacks({
    from: `"Digi8 Solutions" <${getSmtpUser()}>`,
    to,
    subject,
    text,
    html,
  });
};

export const sendVerificationEmail = async (to: string, token: string, type: string): Promise<{ success: boolean; error?: string }> => {
  if (!isValidEmail(to)) {
    console.warn(`[EMAIL SKIP] Skipping verification email to invalid address: ${to}`);
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

  return await sendMailWithFallbacks({
    from: `"Digi8 Solutions" <${getSmtpUser()}>`,
    to,
    subject,
    html,
  });
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

  return await sendMailWithFallbacks({
    from: `"Digi8 Solutions" <${getSmtpUser()}>`,
    to,
    subject,
    html,
  });
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

  return await sendMailWithFallbacks({
    from: `"Digi8 System" <${getSmtpUser()}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
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

  return await sendMailWithFallbacks({
    from: `"DIGI8 Solutions Careers" <${getSmtpUser()}>`,
    to,
    subject,
    html,
  });
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

  return await sendMailWithFallbacks({
    from: `"DIGI8 Career Alerts" <${getSmtpUser()}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
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

  return await sendMailWithFallbacks({
    from: `"DIGI8 Solutions Careers" <${getSmtpUser()}>`,
    to,
    subject,
    html,
  });
};

export const sendAdminOtpEmail = async (
  to: string,
  otp: string,
  purpose: 'login' | 'signup',
  name?: string
): Promise<{ success: boolean; error?: string }> => {
  const APP_URL = getAppUrl();
  const title = purpose === 'signup' ? 'Verify Your Admin Registration' : 'Admin Portal Security OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #06B6D4; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">DIGI8 SOLUTIONS</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Enterprise Security Verification Gateway</p>
      </div>

      <div style="background-color: #1e293b; padding: 24px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 24px;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">${title}</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Hello ${name || 'Administrator'},<br/><br/>
          You requested an authentication passcode to ${purpose === 'signup' ? 'register a new administrator account' : 'sign in to the Digi-8 Solutions Admin Gateway'}.
        </p>

        <div style="background-color: #090d16; border: 1px solid #06B6D4; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
          <span style="font-family: monospace, Courier; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #06B6D4;">${otp}</span>
          <span style="display: block; margin-top: 8px; font-size: 11px; color: #64748b;">Valid for 10 minutes. Do not share this code with anyone.</span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          If you did not initiate this request, please disregard this email or report immediately to security@digi8solutions.com.
        </p>
      </div>

      <div style="text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} Digi8 Solutions Pvt Ltd. All rights reserved.<br/>
        <a href="${APP_URL}" style="color: #06B6D4; text-decoration: none;">digi8solutions.com</a>
      </div>
    </div>
  `;

  return await sendMailWithFallbacks({
    from: `"Digi8 Security Gateway" <${getSmtpUser()}>`,
    to,
    subject: `[${otp}] ${title} — Digi8 Solutions`,
    html
  });
};

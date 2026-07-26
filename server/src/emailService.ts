import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'digi8solutions@gmail.com';
const SMTP_USER_DEFAULT = process.env.SMTP_USER || 'digi8solutions@gmail.com';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER_DEFAULT,
    pass: process.env.SMTP_PASS || 'placeholder_pass',
  },
});

const APP_URL = process.env.APP_URL || 'https://digi8solutions.com';

export const sendInstantReply = async (to: string, name: string, type: 'contact' | 'lead' | 'quote') => {
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
    await transporter.sendMail({
      from: `"Digi8 Solutions" <${SMTP_USER_DEFAULT}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Instant reply sent to ${to}`);
  } catch (error) {
    console.error('Error sending instant reply:', error);
  }
};

export const sendVerificationEmail = async (to: string, token: string, type: string) => {
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
    await transporter.sendMail({
      from: `"Digi8 Solutions" <${SMTP_USER_DEFAULT}>`,
      to,
      subject,
      html,
    });
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
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
    await transporter.sendMail({
      from: `"Digi8 Solutions" <${SMTP_USER_DEFAULT}>`,
      to,
      subject,
      html,
    });
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendAdminNotification = async (type: 'lead' | 'contact' | 'quote', data: any) => {
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
    await transporter.sendMail({
      from: `"Digi8 System" <${SMTP_USER_DEFAULT}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
    console.log(`Admin notification sent to ${ADMIN_EMAIL} for ${type}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};


import { resend, FROM_EMAIL } from './client';
import {
  getVerificationEmail,
  getWelcomeEmail,
  getPasswordResetEmail,
} from './templates';

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string
) {
  const { subject, html, text } = getVerificationEmail(name, verificationToken);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }

    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html, text } = getWelcomeEmail(name);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }

    return data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const { subject, html, text } = getPasswordResetEmail(name, resetToken);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

import { SITE_NAME, SITE_URL } from './client';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email verification template
 */
export function getVerificationEmail(
  name: string,
  verificationToken: string
): EmailTemplate {
  const verificationUrl = `${SITE_URL}/auth/verify-email?token=${verificationToken}`;

  return {
    subject: `Verify your ${SITE_NAME} account`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to ${SITE_NAME}!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! To complete your registration and start using ${SITE_NAME}, please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with ${SITE_NAME}, you can safely ignore this email.</p>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${SITE_NAME}!

Hi ${name},

Thank you for signing up! To complete your registration and start using ${SITE_NAME}, please verify your email address by visiting:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with ${SITE_NAME}, you can safely ignore this email.

© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    `,
  };
}

/**
 * Welcome email template (sent after email verification)
 */
export function getWelcomeEmail(name: string): EmailTemplate {
  return {
    subject: `Welcome to ${SITE_NAME}!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .feature {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You're all set! 🎉</h1>
          <p>Hi ${name},</p>
          <p>Your email has been verified and your account is now active!</p>
          <p>Here's what you can do now:</p>
          <div class="feature">
            <h3>📝 Read and Explore</h3>
            <p>Browse our collection of articles and posts from amazing authors.</p>
          </div>
          <div class="feature">
            <h3>✍️ Write Your First Post</h3>
            <p>Share your thoughts and ideas with the community.</p>
          </div>
          <div class="feature">
            <h3>👤 Customize Your Profile</h3>
            <p>Add your bio, avatar, and make your profile your own.</p>
          </div>
          <a href="${SITE_URL}" class="button">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy blogging!</p>
        </div>
      </body>
      </html>
    `,
    text: `
You're all set! 🎉

Hi ${name},

Your email has been verified and your account is now active!

Here's what you can do now:

📝 Read and Explore
Browse our collection of articles and posts from amazing authors.

✍️ Write Your First Post
Share your thoughts and ideas with the community.

👤 Customize Your Profile
Add your bio, avatar, and make your profile your own.

Get started: ${SITE_URL}

If you have any questions, feel free to reach out to our support team.

Happy blogging!
    `,
  };
}

/**
 * Password reset template
 */
export function getPasswordResetEmail(
  name: string,
  resetToken: string
): EmailTemplate {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${resetToken}`;

  return {
    subject: `Reset your ${SITE_NAME} password`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your ${SITE_NAME} account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request

Hi ${name},

We received a request to reset your password for your ${SITE_NAME} account.

Visit this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

⚠️ Security Notice:
If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    `,
  };
}

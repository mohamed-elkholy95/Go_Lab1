import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { resend, FROM_EMAIL, SITE_URL, SITE_NAME } from '@/lib/email/client';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url, token }) {
      // Check if Resend is configured
      if (!resend || !import.meta.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not configured - verification email not sent');
        console.log(`Manual verification URL: ${url}`);
        return;
      }

      try {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
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
                .code-box {
                  background-color: #f8fafc;
                  border: 2px solid #0ea5e9;
                  border-radius: 8px;
                  padding: 20px;
                  text-align: center;
                  margin: 20px 0;
                }
                .code {
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #0ea5e9;
                  font-family: monospace;
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
                <h1>Welcome to ${SITE_NAME}! 🎉</h1>
                <p>Hi ${user.name},</p>
                <p>Thank you for signing up! To complete your registration, please verify your email address.</p>

                <div class="code-box">
                  <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your verification code:</p>
                  <div class="code">${token}</div>
                </div>

                <p style="text-align: center; margin: 20px 0;">
                  <strong>OR</strong>
                </p>

                <p style="text-align: center;">Click the button below to verify automatically:</p>
                <div style="text-align: center;">
                  <a href="${url}" class="button">Verify Email Address</a>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <span style="word-break: break-all;">${url}</span>
                </p>

                <p style="font-size: 14px; color: #666;">
                  This verification code will expire in 24 hours.
                </p>

                <p style="font-size: 14px; color: #666;">
                  If you didn't create an account with ${SITE_NAME}, you can safely ignore this email.
                </p>

                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Welcome to ${SITE_NAME}!

Hi ${user.name},

Thank you for signing up! To complete your registration, please verify your email address.

Your verification code: ${token}

Or visit this link to verify automatically:
${url}

This verification code will expire in 24 hours.

If you didn't create an account with ${SITE_NAME}, you can safely ignore this email.

© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
          `,
        });

        if (error) {
          console.error('Failed to send verification email:', error);
          throw error;
        }

        console.log('✅ Verification email sent to:', user.email);
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
      }
    },
  },
  socialProviders: {
    // Add social providers if needed (GitHub, Google, etc.)
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
        unique: true,
      },
      role: {
        type: 'string',
        defaultValue: 'user',
        required: true,
      },
      bio: {
        type: 'string',
        required: false,
      },
      avatarUrl: {
        type: 'string',
        required: false,
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type Auth = typeof auth;

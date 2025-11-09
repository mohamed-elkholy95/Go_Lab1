import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sendVerificationEmail } from '@/lib/email/utils';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      verification: schema.emailVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url, token }) {
      try {
        // Extract token from the full URL
        const verificationToken = token || new URL(url).searchParams.get('token') || '';

        // Send verification email using our Resend integration
        await sendVerificationEmail(
          user.email,
          user.name || user.email.split('@')[0],
          verificationToken
        );

        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
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
    generateId: () => crypto.randomUUID(),
  },
});

export type Auth = typeof auth;

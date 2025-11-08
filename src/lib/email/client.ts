import { Resend } from 'resend';

const resendApiKey = import.meta.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

export const resend = new Resend(resendApiKey);

export const FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL || 'noreply@pythoughts.com';
export const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:4321';
export const SITE_NAME = import.meta.env.PUBLIC_SITE_NAME || 'Pythoughts';

import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';

export const ALL: APIRoute = async (context) => {
  return auth.handler(context.request);
};

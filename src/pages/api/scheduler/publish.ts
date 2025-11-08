/**
 * API Endpoint: Publish Scheduled Posts
 * POST /api/scheduler/publish
 *
 * This endpoint should be called periodically (e.g., via cron job)
 * to check and publish any posts that are scheduled to be published
 */

import type { APIRoute } from 'astro';
import { publishScheduledPosts } from '@/lib/services/scheduler';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Optional: Add authentication/authorization
    // For production, you should protect this endpoint with a secret key
    const authHeader = request.headers.get('authorization');
    const expectedToken = import.meta.env.SCHEDULER_TOKEN;

    // If a scheduler token is configured, validate it
    if (expectedToken) {
      if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unauthorized',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Publish scheduled posts
    const result = await publishScheduledPosts();

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to publish scheduled posts',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        publishedCount: result.publishedCount,
        publishedPosts: result.publishedPosts,
        message: `Successfully published ${result.publishedCount} post(s)`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scheduler API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Optional: Allow GET for manual trigger (admin only)
export const GET: APIRoute = async ({ locals }) => {
  // Check if user is admin
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized - Admin access required',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const result = await publishScheduledPosts();

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

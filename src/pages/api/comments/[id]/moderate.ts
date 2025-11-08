import type { APIRoute } from 'astro';
import { moderateComment } from '@/lib/services/comments';
import { moderateCommentSchema } from '@/lib/validations/comments';
import { getCurrentUser, isAdmin } from '@/lib/auth/utils';

/**
 * PATCH /api/comments/[id]/moderate
 * Moderate a comment (admin only)
 */
export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Comment ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check authentication
    const user = await getCurrentUser(cookies);

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(cookies);

    if (!userIsAdmin) {
      return new Response(
        JSON.stringify({ message: 'Forbidden: Only admins can moderate comments' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = moderateCommentSchema.parse(body);

    // Moderate comment
    const updated = await moderateComment(id, validatedData);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error moderating comment:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(
        JSON.stringify({
          message: 'Validation failed',
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Failed to moderate comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

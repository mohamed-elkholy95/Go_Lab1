import type { APIRoute } from 'astro';
import { getComments, createComment } from '@/lib/services/comments';
import { createCommentSchema, commentQuerySchema } from '@/lib/validations/comments';
import { getCurrentUser } from '@/lib/auth/utils';

/**
 * GET /api/comments
 * Get comments with pagination and filters
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    // Parse query parameters
    const queryParams = {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      postId: url.searchParams.get('postId'),
      userId: url.searchParams.get('userId'),
      status: url.searchParams.get('status'),
      sort: url.searchParams.get('sort'),
    };

    // Validate query parameters
    const validatedQuery = commentQuerySchema.parse(queryParams);

    // Get comments
    const result = await getComments(validatedQuery);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch comments',
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

/**
 * POST /api/comments
 * Create a new comment (authenticated users only)
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = createCommentSchema.parse(body);

    // Create comment
    const comment = await createComment(user.id, validatedData);

    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);

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
        message: 'Failed to create comment',
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

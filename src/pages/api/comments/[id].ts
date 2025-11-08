import type { APIRoute } from 'astro';
import {
  getCommentById,
  updateComment,
  deleteComment,
  moderateComment,
} from '@/lib/services/comments';
import { updateCommentSchema, moderateCommentSchema } from '@/lib/validations/comments';
import { getCurrentUser, isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/comments/[id]
 * Get a single comment by ID
 */
export const GET: APIRoute = async ({ params }) => {
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

    const comment = await getCommentById(id);

    if (!comment) {
      return new Response(JSON.stringify({ message: 'Comment not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(comment), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch comment',
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
 * PUT /api/comments/[id]
 * Update a comment (owner only)
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = updateCommentSchema.parse(body);

    // Update comment
    const updated = await updateComment(id, user.id, validatedData);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating comment:', error);

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

    // Handle unauthorized errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Failed to update comment',
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
 * DELETE /api/comments/[id]
 * Delete a comment (owner or admin)
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
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

    // Delete comment
    await deleteComment(id, user.id, userIsAdmin);

    return new Response(JSON.stringify({ message: 'Comment deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting comment:', error);

    // Handle unauthorized errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Failed to delete comment',
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

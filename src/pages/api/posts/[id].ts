import type { APIRoute } from 'astro';
import { getPostById, updatePost, deletePost } from '@/lib/services/posts';
import { updatePostSchema } from '@/lib/validations/posts';
import { getCurrentUser, isAuthor, isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/posts/[id]
 * Get a single post by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Post ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return new Response(JSON.stringify({ message: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch post',
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
 * PUT /api/posts/[id]
 * Update a post (authors can update own posts, admins can update any)
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Post ID is required' }), {
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

    // Check if user is author or admin
    const userIsAuthor = await isAuthor(cookies);
    if (!userIsAuthor) {
      return new Response(
        JSON.stringify({
          message: 'Forbidden: Only authors and admins can update posts',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get existing post to check ownership
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return new Response(JSON.stringify({ message: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if user owns the post or is admin
    const userIsAdmin = await isAdmin(cookies);
    if (existingPost.post.authorId !== user.id && !userIsAdmin) {
      return new Response(
        JSON.stringify({
          message: 'Forbidden: You can only update your own posts',
        }),
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
    const validatedData = updatePostSchema.parse(body);

    // Update post
    const updatedPost = await updatePost(id, validatedData);

    return new Response(JSON.stringify(updatedPost), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(
        JSON.stringify({
          message: 'Validation error',
          errors: error,
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
        message: 'Failed to update post',
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
 * DELETE /api/posts/[id]
 * Delete a post (admins only)
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Post ID is required' }), {
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
        JSON.stringify({
          message: 'Forbidden: Only admins can delete posts',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if post exists
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return new Response(JSON.stringify({ message: 'Post not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Delete post
    await deletePost(id);

    return new Response(
      JSON.stringify({
        message: 'Post deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to delete post',
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

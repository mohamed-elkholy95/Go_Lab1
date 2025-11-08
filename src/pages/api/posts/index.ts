import type { APIRoute } from 'astro';
import { getPosts, createPost } from '@/lib/services/posts';
import { createPostSchema, postQuerySchema } from '@/lib/validations/posts';
import { getCurrentUser, isAuthor } from '@/lib/auth/utils';

/**
 * GET /api/posts
 * Get all posts with pagination and filters
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Parse query parameters
    const queryParams = {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      status: url.searchParams.get('status'),
      authorId: url.searchParams.get('authorId'),
      categoryId: url.searchParams.get('categoryId'),
      tagId: url.searchParams.get('tagId'),
      search: url.searchParams.get('search'),
      sort: url.searchParams.get('sort'),
    };

    // Validate query parameters
    const validatedQuery = postQuerySchema.parse(queryParams);

    // Get posts
    const result = await getPosts(validatedQuery);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch posts',
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
 * POST /api/posts
 * Create a new post (authors and admins only)
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

    // Check if user is author or admin
    const userIsAuthor = await isAuthor(cookies);
    if (!userIsAuthor) {
      return new Response(
        JSON.stringify({
          message: 'Forbidden: Only authors and admins can create posts',
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
    const validatedData = createPostSchema.parse(body);

    // Create post
    const newPost = await createPost(validatedData, user.id);

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);

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
        message: 'Failed to create post',
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

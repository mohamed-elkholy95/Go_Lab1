import type { APIRoute } from 'astro';
import { getTags, createTag } from '@/lib/services/categories';
import { createTagSchema } from '@/lib/validations/categories';
import { isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/tags
 * Get all tags
 */
export const GET: APIRoute = async () => {
  try {
    const tags = await getTags();

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch tags',
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
 * POST /api/tags
 * Create a new tag (admin only)
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin(cookies);

    if (!userIsAdmin) {
      return new Response(
        JSON.stringify({
          message: 'Forbidden: Only admins can create tags',
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
    const validatedData = createTagSchema.parse(body);

    // Create tag
    const newTag = await createTag(validatedData);

    return new Response(JSON.stringify(newTag), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating tag:', error);

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
        message: 'Failed to create tag',
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

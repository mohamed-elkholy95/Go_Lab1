import type { APIRoute } from 'astro';
import { getCategories, createCategory } from '@/lib/services/categories';
import { createCategorySchema } from '@/lib/validations/categories';
import { isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/categories
 * Get all categories
 */
export const GET: APIRoute = async () => {
  try {
    const categories = await getCategories();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch categories',
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
 * POST /api/categories
 * Create a new category (admin only)
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin(cookies);

    if (!userIsAdmin) {
      return new Response(
        JSON.stringify({
          message: 'Forbidden: Only admins can create categories',
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
    const validatedData = createCategorySchema.parse(body);

    // Create category
    const newCategory = await createCategory(validatedData);

    return new Response(JSON.stringify(newCategory), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);

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
        message: 'Failed to create category',
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

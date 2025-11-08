import type { APIRoute } from 'astro';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/services/categories';
import { updateCategorySchema } from '@/lib/validations/categories';
import { isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/categories/[id]
 * Get a single category by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Category ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const category = await getCategoryById(id);

    if (!category) {
      return new Response(JSON.stringify({ message: 'Category not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch category',
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
 * PUT /api/categories/[id]
 * Update a category (admin only)
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Category ID is required' }), {
        status: 400,
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
          message: 'Forbidden: Only admins can update categories',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return new Response(JSON.stringify({ message: 'Category not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = updateCategorySchema.parse(body);

    // Update category
    const updatedCategory = await updateCategory(id, validatedData);

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating category:', error);

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
        message: 'Failed to update category',
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
 * DELETE /api/categories/[id]
 * Delete a category (admin only)
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Category ID is required' }), {
        status: 400,
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
          message: 'Forbidden: Only admins can delete categories',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return new Response(JSON.stringify({ message: 'Category not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Delete category
    await deleteCategory(id);

    return new Response(
      JSON.stringify({
        message: 'Category deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to delete category',
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

import type { APIRoute } from 'astro';
import { getTagById, updateTag, deleteTag } from '@/lib/services/categories';
import { updateTagSchema } from '@/lib/validations/categories';
import { isAdmin } from '@/lib/auth/utils';

/**
 * GET /api/tags/[id]
 * Get a single tag by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Tag ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const tag = await getTagById(id);

    if (!tag) {
      return new Response(JSON.stringify({ message: 'Tag not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(tag), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch tag',
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
 * PUT /api/tags/[id]
 * Update a tag (admin only)
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Tag ID is required' }), {
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
          message: 'Forbidden: Only admins can update tags',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if tag exists
    const existingTag = await getTagById(id);
    if (!existingTag) {
      return new Response(JSON.stringify({ message: 'Tag not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = updateTagSchema.parse(body);

    // Update tag
    const updatedTag = await updateTag(id, validatedData);

    return new Response(JSON.stringify(updatedTag), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating tag:', error);

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
        message: 'Failed to update tag',
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
 * DELETE /api/tags/[id]
 * Delete a tag (admin only)
 */
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Tag ID is required' }), {
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
          message: 'Forbidden: Only admins can delete tags',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if tag exists
    const existingTag = await getTagById(id);
    if (!existingTag) {
      return new Response(JSON.stringify({ message: 'Tag not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Delete tag
    await deleteTag(id);

    return new Response(
      JSON.stringify({
        message: 'Tag deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting tag:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to delete tag',
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

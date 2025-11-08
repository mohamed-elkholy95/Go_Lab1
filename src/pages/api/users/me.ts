import type { APIRoute } from 'astro';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/utils';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format'),
  email: z.string().email('Invalid email address'),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/users/me
 * Get current user profile
 */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = await getCurrentUser(cookies);

    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to fetch user',
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
 * PUT /api/users/me
 * Update current user profile
 */
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
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
    const validatedData = updateProfileSchema.parse(body);

    // Check if username is taken by another user
    if (validatedData.username !== user.username) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, validatedData.username));

      if (existingUser) {
        return new Response(
          JSON.stringify({ message: 'Username is already taken' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Check if email is taken by another user
    if (validatedData.email !== user.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email));

      if (existingUser) {
        return new Response(
          JSON.stringify({ message: 'Email is already taken' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        name: validatedData.name,
        username: validatedData.username,
        email: validatedData.email,
        avatarUrl: validatedData.avatarUrl,
        bio: validatedData.bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: 'Validation error',
          errors: error.errors,
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
        message: 'Failed to update user',
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

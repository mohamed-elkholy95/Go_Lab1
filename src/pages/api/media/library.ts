import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import { getMediaLibrary } from '@/lib/services/media';

/**
 * GET /api/media/library
 * Get user's media library with thumbnails
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get pagination parameters
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Fetch media library
    const media = await getMediaLibrary(session.user.id, limit);

    return new Response(
      JSON.stringify({
        success: true,
        media,
        total: media.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to fetch media library:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch media',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

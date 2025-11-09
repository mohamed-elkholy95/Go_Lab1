import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import { createVideoEmbed } from '@/lib/services/media';
import { parseVideoUrl } from '@/lib/utils/video-parser';

/**
 * POST /api/media/video/embed
 * Create a video embed record from URL
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url, postId, title, description, width, height, autoplay, controls } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Video URL required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse video URL
    const videoInfo = parseVideoUrl(url);
    if (!videoInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid or unsupported video URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create video embed record
    const videoEmbed = await createVideoEmbed({
      provider: videoInfo.provider,
      videoId: videoInfo.videoId,
      url: videoInfo.url,
      embedUrl: videoInfo.embedUrl,
      title: title || null,
      description: description || null,
      thumbnailUrl: videoInfo.thumbnailUrl || null,
      width: width || 640,
      height: height || 360,
      autoplay: autoplay || false,
      controls: controls !== false, // Default to true
      addedBy: session.user.id,
      postId: postId || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        video: videoEmbed,
        videoInfo,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Video embed error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create video embed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

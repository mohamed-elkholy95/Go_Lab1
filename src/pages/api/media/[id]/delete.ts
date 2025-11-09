import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import {
  getMediaFileById,
  softDeleteMediaFile,
  getThumbnailsByMediaId,
} from '@/lib/services/media';
import { deleteFile, deleteFiles } from '@/lib/storage/minio';

/**
 * DELETE /api/media/[id]/delete
 * Delete media file and its thumbnails
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const mediaId = params.id;
    if (!mediaId) {
      return new Response(
        JSON.stringify({ error: 'Media ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get media file
    const mediaFile = await getMediaFileById(mediaId);
    if (!mediaFile) {
      return new Response(
        JSON.stringify({ error: 'Media file not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (mediaFile.uploadedBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get thumbnails
    const thumbnails = await getThumbnailsByMediaId(mediaId);

    // Delete from MinIO
    try {
      // Delete main file
      await deleteFile(mediaFile.objectKey);

      // Delete thumbnails
      if (thumbnails.length > 0) {
        const thumbnailKeys = thumbnails.map((t) => t.objectKey);
        await deleteFiles(thumbnailKeys);
      }
    } catch (error) {
      console.error('Failed to delete files from MinIO:', error);
      // Continue with soft delete even if MinIO deletion fails
    }

    // Soft delete from database
    await softDeleteMediaFile(mediaId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media file deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Delete failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

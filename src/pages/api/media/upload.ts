import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import {
  uploadFile,
  generateObjectKey,
  getPublicUrl,
  initializeMinIO
} from '@/lib/storage/minio';
import {
  validateImage,
  getImageMetadata,
  generateThumbnails,
  optimizeImage,
} from '@/lib/storage/image-processor';
import {
  createMediaFile,
  createMediaThumbnail,
} from '@/lib/services/media';

// Initialize MinIO on first request
let minioInitialized = false;

/**
 * POST /api/media/upload
 * Upload image file to MinIO and create database records
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Initialize MinIO if not already done
    if (!minioInitialized) {
      await initializeMinIO();
      minioInitialized = true;
    }

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('altText') as string | null;
    const caption = formData.get('caption') as string | null;
    const description = formData.get('description') as string | null;
    const title = formData.get('title') as string | null;
    const tags = formData.get('tags') as string | null;
    const postId = formData.get('postId') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    await validateImage(buffer);

    // Get image metadata
    const metadata = await getImageMetadata(buffer);

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer);

    // Generate object key
    const objectKey = generateObjectKey(
      session.user.id,
      file.name,
      'images'
    );

    // Upload to MinIO
    const url = await uploadFile(
      objectKey,
      optimizedBuffer,
      'image/webp',
      {
        'original-name': file.name,
        'uploaded-by': session.user.id,
      }
    );

    // Create media file record
    const mediaFile = await createMediaFile({
      fileName: file.name.replace(/\.[^/.]+$/, '.webp'), // Change extension to webp
      originalFileName: file.name,
      mimeType: 'image/webp',
      fileSize: optimizedBuffer.length,
      bucket: 'proxyforms-media',
      objectKey,
      url,
      type: 'image',
      status: 'processing',
      width: metadata.width,
      height: metadata.height,
      altText: altText || null,
      caption: caption || null,
      description: description || null,
      title: title || file.name,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedBy: session.user.id,
      postId: postId || null,
    });

    // Generate thumbnails
    try {
      const thumbnails = await generateThumbnails(buffer);

      // Upload and save each thumbnail
      const thumbnailPromises = Object.entries(thumbnails).map(
        async ([size, thumbnail]) => {
          const thumbKey = generateObjectKey(
            session.user.id,
            `${size}-${file.name}`,
            'thumbnails'
          );

          const thumbUrl = await uploadFile(
            thumbKey,
            thumbnail.buffer,
            'image/jpeg'
          );

          return createMediaThumbnail({
            mediaId: mediaFile.id,
            size,
            width: thumbnail.width,
            height: thumbnail.height,
            bucket: 'proxyforms-media',
            objectKey: thumbKey,
            url: thumbUrl,
            fileSize: thumbnail.size,
          });
        }
      );

      await Promise.all(thumbnailPromises);

      // Update media file status to ready
      await createMediaFile({
        ...mediaFile,
        status: 'ready',
      });
    } catch (error) {
      console.error('Failed to generate thumbnails:', error);
      // Still return success, thumbnails are optional
    }

    return new Response(
      JSON.stringify({
        success: true,
        media: mediaFile,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Upload failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

import sharp from 'sharp';

// Thumbnail sizes configuration
export const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 800, height: 600 },
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ThumbnailResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

/**
 * Get image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    throw new Error('Invalid image file');
  }
}

/**
 * Validate image file
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await getImageMetadata(buffer);

    // Check if it's a valid image format
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'svg'];
    if (!validFormats.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format: ${metadata.format}`);
    }

    // Check maximum dimensions (e.g., 8000x8000)
    const maxDimension = 8000;
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      throw new Error(`Image dimensions exceed maximum allowed size of ${maxDimension}px`);
    }

    // Check maximum file size (e.g., 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (metadata.size > maxSize) {
      throw new Error(`Image size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  } catch (error) {
    console.error('Image validation failed:', error);
    throw error;
  }
}

/**
 * Generate a thumbnail at a specific size
 */
export async function generateThumbnail(
  buffer: Buffer,
  size: ThumbnailSize
): Promise<ThumbnailResult> {
  try {
    const { width, height } = THUMBNAIL_SIZES[size];

    const thumbnail = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const metadata = await sharp(thumbnail).metadata();

    return {
      buffer: thumbnail,
      width: metadata.width || width,
      height: metadata.height || height,
      size: thumbnail.length,
    };
  } catch (error) {
    console.error(`Failed to generate ${size} thumbnail:`, error);
    throw error;
  }
}

/**
 * Generate all thumbnail sizes for an image
 */
export async function generateThumbnails(
  buffer: Buffer
): Promise<Record<ThumbnailSize, ThumbnailResult>> {
  try {
    const thumbnails = await Promise.all([
      generateThumbnail(buffer, 'small'),
      generateThumbnail(buffer, 'medium'),
      generateThumbnail(buffer, 'large'),
    ]);

    return {
      small: thumbnails[0],
      medium: thumbnails[1],
      large: thumbnails[2],
    };
  } catch (error) {
    console.error('Failed to generate thumbnails:', error);
    throw error;
  }
}

/**
 * Optimize image for web
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Convert to WebP for better compression (except for GIFs and SVGs)
    if (metadata.format === 'gif' || metadata.format === 'svg') {
      return buffer;
    }

    return await image
      .webp({ quality: 90, effort: 4 })
      .toBuffer();
  } catch (error) {
    console.error('Failed to optimize image:', error);
    throw error;
  }
}

/**
 * Resize image to maximum dimensions while maintaining aspect ratio
 */
export async function resizeImage(
  buffer: Buffer,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  } catch (error) {
    console.error('Failed to resize image:', error);
    throw error;
  }
}

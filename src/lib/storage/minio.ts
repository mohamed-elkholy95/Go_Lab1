import { Client } from 'minio';

// MinIO configuration from environment variables
const minioConfig = {
  endPoint: import.meta.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(import.meta.env.MINIO_PORT || '9000'),
  useSSL: import.meta.env.MINIO_USE_SSL === 'true',
  accessKey: import.meta.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: import.meta.env.MINIO_SECRET_KEY || 'minioadmin123',
};

// Default bucket name
export const MEDIA_BUCKET = import.meta.env.MINIO_BUCKET || 'pythoughts-media';

// Create MinIO client instance
export const minioClient = new Client(minioConfig);

/**
 * Initialize MinIO storage
 * Creates bucket if it doesn't exist and sets public read policy for media
 */
export async function initializeMinIO(): Promise<void> {
  try {
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(MEDIA_BUCKET);

    if (!bucketExists) {
      console.log(`Creating bucket: ${MEDIA_BUCKET}`);
      await minioClient.makeBucket(MEDIA_BUCKET, 'us-east-1');

      // Set public read policy for media files
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MEDIA_BUCKET}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(
        MEDIA_BUCKET,
        JSON.stringify(publicPolicy)
      );

      console.log(`Bucket ${MEDIA_BUCKET} created successfully`);
    } else {
      console.log(`Bucket ${MEDIA_BUCKET} already exists`);
    }
  } catch (error) {
    console.error('Failed to initialize MinIO:', error);
    throw error;
  }
}

/**
 * Generate a unique object key for uploaded files
 */
export function generateObjectKey(
  userId: string,
  fileName: string,
  folder: string = 'uploads'
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${userId}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Get public URL for a MinIO object
 */
export function getPublicUrl(objectKey: string): string {
  const protocol = minioConfig.useSSL ? 'https' : 'http';
  const port = minioConfig.port === 443 || minioConfig.port === 80 ? '' : `:${minioConfig.port}`;
  return `${protocol}://${minioConfig.endPoint}${port}/${MEDIA_BUCKET}/${objectKey}`;
}

/**
 * Upload file to MinIO
 */
export async function uploadFile(
  objectKey: string,
  buffer: Buffer,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    await minioClient.putObject(
      MEDIA_BUCKET,
      objectKey,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );

    return getPublicUrl(objectKey);
  } catch (error) {
    console.error('Failed to upload file to MinIO:', error);
    throw error;
  }
}

/**
 * Delete file from MinIO
 */
export async function deleteFile(objectKey: string): Promise<void> {
  try {
    await minioClient.removeObject(MEDIA_BUCKET, objectKey);
  } catch (error) {
    console.error('Failed to delete file from MinIO:', error);
    throw error;
  }
}

/**
 * Delete multiple files from MinIO
 */
export async function deleteFiles(objectKeys: string[]): Promise<void> {
  try {
    await minioClient.removeObjects(MEDIA_BUCKET, objectKeys);
  } catch (error) {
    console.error('Failed to delete files from MinIO:', error);
    throw error;
  }
}

/**
 * Get file metadata from MinIO
 */
export async function getFileMetadata(objectKey: string) {
  try {
    return await minioClient.statObject(MEDIA_BUCKET, objectKey);
  } catch (error) {
    console.error('Failed to get file metadata from MinIO:', error);
    throw error;
  }
}

/**
 * Generate a pre-signed URL for temporary access
 */
export async function generatePresignedUrl(
  objectKey: string,
  expirySeconds: number = 3600
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(
      MEDIA_BUCKET,
      objectKey,
      expirySeconds
    );
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    throw error;
  }
}

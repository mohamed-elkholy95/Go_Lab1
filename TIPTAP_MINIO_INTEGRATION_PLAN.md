# TipTap Editor + MinIO Integration Plan
## Comprehensive Professional Enhancement Plan for Pythoughts Blogging Platform

**Version:** 1.0
**Date:** November 9, 2025
**Platform:** Pythoughts (Astro 5 + TypeScript)

---

## Executive Summary

This document outlines a comprehensive implementation plan to replace the current plain-text Markdown editor with a professional-grade TipTap rich-text editor integrated with self-hosted MinIO object storage. This enhancement will provide authors with an exceptional blogging experience featuring drag-and-drop media uploads, video embeds, and complete metadata management.

**Current State:**
- Simple `<textarea>` for Markdown input
- No media upload functionality
- External URL-only image support
- Manual HTML/Markdown for videos
- No media library management

**Target State:**
- Professional WYSIWYG TipTap editor
- Drag-and-drop image/file uploads to MinIO
- Direct video embedding (YouTube, Vimeo, etc.)
- Complete metadata preservation (alt text, titles, descriptions)
- Self-hosted media library with MinIO
- Optimized image loading and transformations
- Comprehensive media management UI

---

## 1. Technology Stack Analysis

### 1.1 TipTap Editor Features

**Core Capabilities:**
- **Framework**: Built on ProseMirror (battle-tested)
- **Integrations**: Native support for React, Vue, Svelte, Vanilla JS
- **Extensibility**: Modular architecture with 70+ extensions
- **Rich Formatting**: Bold, italic, headings, lists, code blocks, tables
- **Media Support**: Image, video, file attachments
- **Collaboration**: Real-time editing (optional, pro feature)

**Key Extensions for Pythoughts:**
```
Essential Extensions:
├── @tiptap/core                    - Core editor functionality
├── @tiptap/starter-kit            - Essential marks & nodes
├── @tiptap/extension-image        - Image nodes with attributes
├── @tiptap/extension-file-handler - Drag & drop file handling
├── @tiptap/extension-youtube      - YouTube embed support
├── @tiptap/extension-link         - Hyperlink management
├── @tiptap/extension-table        - Table support
├── @tiptap/extension-placeholder  - Input placeholders
└── @tiptap/extension-character-count - Word/character counting
```

**Installation:**
```bash
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
  @tiptap/extension-file-handler @tiptap/extension-youtube \
  @tiptap/extension-link @tiptap/extension-table \
  @tiptap/extension-placeholder @tiptap/extension-character-count
```

### 1.2 MinIO Object Storage

**Architecture:**
- **Type**: S3-compatible object storage
- **Deployment**: Self-hosted via Docker
- **API**: Amazon S3-compatible REST API
- **SDK**: JavaScript/Node.js SDK (`minio` npm package)
- **Performance**: High-throughput, low-latency storage
- **Scalability**: Horizontally scalable storage cluster

**MinIO Features:**
```
Storage Capabilities:
├── Bucket Management          - Organize media by type/category
├── Pre-signed URLs           - Secure temporary upload/download
├── Access Control            - Fine-grained permissions
├── Versioning                - Object version history
├── Lifecycle Policies        - Automatic cleanup/archiving
├── Event Notifications       - Webhook triggers
└── Metadata Storage          - Custom key-value metadata
```

**Installation:**
```bash
# MinIO JavaScript SDK
npm install minio

# MinIO Server (Docker)
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"
```

---

## 2. Architecture Design

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           TipTap Editor Component (Svelte)           │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Rich Text Editing                             │  │   │
│  │  │  • Formatting toolbar                          │  │   │
│  │  │  │  • Image drag-and-drop handler             │  │   │
│  │  │  • Video embed handler                         │  │   │
│  │  │  • Real-time preview                           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS POST /api/media/upload
                     │ FormData (file + metadata)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Astro Backend (SSR)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Media Upload API Endpoint                    │   │
│  │  /api/media/upload                                   │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  1. Validate file (type, size, security)      │  │   │
│  │  │  2. Generate unique filename                   │  │   │
│  │  │  3. Extract/validate metadata                  │  │   │
│  │  │  4. Upload to MinIO bucket                     │  │   │
│  │  │  5. Store record in PostgreSQL                 │  │   │
│  │  │  6. Return URL + metadata                      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ MinIO SDK (putObject)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MinIO Object Storage (Self-Hosted)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Buckets:                                            │   │
│  │  • pythoughts-images    (JPEG, PNG, GIF, WebP)      │   │
│  │  • pythoughts-documents (PDF, DOCX, etc.)           │   │
│  │  • pythoughts-thumbnails (Generated previews)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Metadata + URL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│             PostgreSQL Database (Neon)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  media_files table:                                  │   │
│  │  • id, userId, filename, mimeType                    │   │
│  │  • url, bucket, size                                 │   │
│  │  • altText, title, description, tags                 │   │
│  │  • width, height, createdAt                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Upload Flow:**
```
1. User drops image into TipTap editor
   ↓
2. FileHandler extension intercepts event
   ↓
3. Client validates file (size, type)
   ↓
4. FormData created with file + metadata
   ↓
5. POST to /api/media/upload
   ↓
6. Server validates & sanitizes
   ↓
7. Generate unique ID + secure filename
   ↓
8. Upload to MinIO bucket via SDK
   ↓
9. Store metadata in PostgreSQL
   ↓
10. Return MinIO URL to client
   ↓
11. TipTap inserts image node with URL
   ↓
12. Editor displays image inline
```

**Retrieval Flow:**
```
1. Post rendered on frontend
   ↓
2. TipTap content parsed (HTML with image URLs)
   ↓
3. Browser requests image from MinIO URL
   ↓
4. MinIO serves image (with CDN caching if configured)
   ↓
5. Image displayed to reader
```

---

## 3. Database Schema Design

### 3.1 New Tables

#### `media_files` Table
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- File identification
  filename VARCHAR(255) NOT NULL,           -- Original filename
  storage_key VARCHAR(500) NOT NULL UNIQUE, -- MinIO object key
  mime_type VARCHAR(100) NOT NULL,          -- e.g., 'image/jpeg'
  file_size INTEGER NOT NULL,               -- Bytes

  -- Storage location
  bucket VARCHAR(100) NOT NULL,             -- MinIO bucket name
  url TEXT NOT NULL,                        -- Full public URL

  -- Image-specific metadata
  width INTEGER,                            -- Image width in pixels
  height INTEGER,                           -- Image height in pixels

  -- SEO & Accessibility metadata
  alt_text TEXT,                            -- Alt text for images
  title VARCHAR(255),                       -- Image title
  description TEXT,                         -- Detailed description
  caption TEXT,                             -- Display caption

  -- Organization
  tags TEXT[],                              -- Searchable tags
  category VARCHAR(100),                    -- e.g., 'blog-image', 'featured'

  -- Usage tracking
  used_in_posts UUID[],                     -- Post IDs using this media
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_media_user_id (user_id),
  INDEX idx_media_storage_key (storage_key),
  INDEX idx_media_created_at (created_at DESC),
  INDEX idx_media_tags (tags) USING GIN
);
```

#### `media_thumbnails` Table
```sql
CREATE TABLE media_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,

  size_variant VARCHAR(50) NOT NULL,  -- 'small', 'medium', 'large', 'og'
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  url TEXT NOT NULL,
  storage_key VARCHAR(500) NOT NULL UNIQUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_thumbnails_media_id (media_file_id),
  UNIQUE (media_file_id, size_variant)
);
```

#### `video_embeds` Table
```sql
CREATE TABLE video_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),

  -- Video identification
  provider VARCHAR(50) NOT NULL,      -- 'youtube', 'vimeo', 'custom'
  video_id VARCHAR(255) NOT NULL,     -- Provider-specific ID
  embed_url TEXT NOT NULL,            -- Full embed URL
  thumbnail_url TEXT,                 -- Video thumbnail

  -- Metadata
  title VARCHAR(255),
  description TEXT,
  duration INTEGER,                   -- Seconds

  -- Display settings
  width INTEGER,
  height INTEGER,
  autoplay BOOLEAN DEFAULT false,
  controls BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_video_post_id (post_id),
  INDEX idx_video_user_id (user_id)
);
```

### 3.2 Updated `posts` Table
```sql
ALTER TABLE posts
  ADD COLUMN content_json JSONB,           -- TipTap JSON format
  ADD COLUMN content_html TEXT,            -- Rendered HTML
  ADD COLUMN media_files UUID[],           -- References to media_files
  ADD COLUMN word_count INTEGER,
  ADD COLUMN character_count INTEGER;
```

---

## 4. Implementation Roadmap

### Phase 1: Infrastructure Setup (Week 1)
**Duration:** 3-5 days

#### 1.1 MinIO Deployment
```bash
# Docker Compose for MinIO
# /docker-compose.minio.yml
version: '3.8'
services:
  minio:
    image: quay.io/minio/minio:latest
    container_name: pythoughts-minio
    ports:
      - "9000:9000"  # API port
      - "9001:9001"  # Console port
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio-data:
    driver: local
```

**Deploy:**
```bash
docker-compose -f docker-compose.minio.yml up -d
```

#### 1.2 MinIO Configuration
```typescript
// src/lib/storage/minio-client.ts
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: import.meta.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(import.meta.env.MINIO_PORT || '9000'),
  useSSL: import.meta.env.MINIO_USE_SSL === 'true',
  accessKey: import.meta.env.MINIO_ACCESS_KEY!,
  secretKey: import.meta.env.MINIO_SECRET_KEY!,
});

export const BUCKETS = {
  IMAGES: 'pythoughts-images',
  DOCUMENTS: 'pythoughts-documents',
  THUMBNAILS: 'pythoughts-thumbnails',
} as const;

// Initialize buckets on startup
export async function initializeBuckets() {
  for (const bucket of Object.values(BUCKETS)) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Created bucket: ${bucket}`);

      // Set public read policy for images
      if (bucket === BUCKETS.IMAGES || bucket === BUCKETS.THUMBNAILS) {
        const policy = {
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`]
          }]
        };
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      }
    }
  }
}

export default minioClient;
```

#### 1.3 Database Migration
```typescript
// src/db/migrations/0004_add_media_tables.sql
-- Create media_files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  bucket VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  title VARCHAR(255),
  description TEXT,
  caption TEXT,
  tags TEXT[],
  category VARCHAR(100),
  used_in_posts UUID[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_user_id ON media_files(user_id);
CREATE INDEX idx_media_storage_key ON media_files(storage_key);
CREATE INDEX idx_media_created_at ON media_files(created_at DESC);
CREATE INDEX idx_media_tags ON media_files USING GIN(tags);

-- Create thumbnails table
CREATE TABLE media_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  size_variant VARCHAR(50) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  url TEXT NOT NULL,
  storage_key VARCHAR(500) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (media_file_id, size_variant)
);

CREATE INDEX idx_thumbnails_media_id ON media_thumbnails(media_file_id);

-- Create video_embeds table
CREATE TABLE video_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  video_id VARCHAR(255) NOT NULL,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  duration INTEGER,
  width INTEGER,
  height INTEGER,
  autoplay BOOLEAN DEFAULT false,
  controls BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_post_id ON video_embeds(post_id);
CREATE INDEX idx_video_user_id ON video_embeds(user_id);

-- Update posts table
ALTER TABLE posts
  ADD COLUMN content_json JSONB,
  ADD COLUMN content_html TEXT,
  ADD COLUMN media_files UUID[],
  ADD COLUMN word_count INTEGER,
  ADD COLUMN character_count INTEGER;
```

**Run Migration:**
```bash
npm run db:push
```

#### 1.4 Environment Variables
```env
# .env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_PUBLIC_URL=http://localhost:9000

# Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/webm
```

**Deliverables:**
- ✅ MinIO server running and accessible
- ✅ Buckets created with proper permissions
- ✅ Database tables migrated
- ✅ Environment variables configured

---

### Phase 2: Backend API Development (Week 1-2)
**Duration:** 5-7 days

#### 2.1 Media Upload Service
```typescript
// src/lib/services/media.ts
import minioClient, { BUCKETS } from '@/lib/storage/minio-client';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import sharp from 'sharp'; // For image processing
import { nanoid } from 'nanoid';

interface UploadResult {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface MediaMetadata {
  altText?: string;
  title?: string;
  description?: string;
  caption?: string;
  tags?: string[];
  category?: string;
}

/**
 * Upload file to MinIO and store metadata in database
 */
export async function uploadMedia(
  file: File,
  userId: string,
  metadata?: MediaMetadata
): Promise<UploadResult> {
  // Validate file
  validateFile(file);

  // Generate unique storage key
  const fileExtension = file.name.split('.').pop();
  const storageKey = `${nanoid()}.${fileExtension}`;

  // Determine bucket
  const bucket = file.type.startsWith('image/')
    ? BUCKETS.IMAGES
    : BUCKETS.DOCUMENTS;

  // Process image if needed
  let buffer = Buffer.from(await file.arrayBuffer());
  let width: number | undefined;
  let height: number | undefined;

  if (file.type.startsWith('image/')) {
    const image = sharp(buffer);
    const imageMetadata = await image.metadata();
    width = imageMetadata.width;
    height = imageMetadata.height;

    // Optimize image
    buffer = await image
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  // Upload to MinIO
  await minioClient.putObject(
    bucket,
    storageKey,
    buffer,
    buffer.length,
    {
      'Content-Type': file.type,
      'x-amz-meta-original-name': file.name,
      'x-amz-meta-uploader-id': userId,
    }
  );

  // Generate public URL
  const url = `${import.meta.env.MINIO_PUBLIC_URL}/${bucket}/${storageKey}`;

  // Store in database
  const [mediaRecord] = await db
    .insert(mediaFiles)
    .values({
      userId,
      filename: file.name,
      storageKey,
      mimeType: file.type,
      fileSize: file.size,
      bucket,
      url,
      width,
      height,
      altText: metadata?.altText,
      title: metadata?.title || file.name,
      description: metadata?.description,
      caption: metadata?.caption,
      tags: metadata?.tags || [],
      category: metadata?.category || 'general',
    })
    .returning();

  // Generate thumbnails for images
  if (file.type.startsWith('image/')) {
    await generateThumbnails(mediaRecord.id, buffer, storageKey);
  }

  return {
    id: mediaRecord.id,
    url,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    width,
    height,
  };
}

/**
 * Generate image thumbnails
 */
async function generateThumbnails(
  mediaId: string,
  imageBuffer: Buffer,
  originalKey: string
) {
  const sizes = [
    { variant: 'small', width: 320, height: 240 },
    { variant: 'medium', width: 640, height: 480 },
    { variant: 'large', width: 1280, height: 960 },
    { variant: 'og', width: 1200, height: 630 }, // Open Graph
  ];

  for (const size of sizes) {
    const thumbnail = await sharp(imageBuffer)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbKey = `thumbnails/${originalKey}-${size.variant}.jpg`;

    await minioClient.putObject(
      BUCKETS.THUMBNAILS,
      thumbKey,
      thumbnail,
      thumbnail.length,
      { 'Content-Type': 'image/jpeg' }
    );

    const thumbUrl = `${import.meta.env.MINIO_PUBLIC_URL}/${BUCKETS.THUMBNAILS}/${thumbKey}`;

    await db.insert(mediaThumbnails).values({
      mediaFileId: mediaId,
      sizeVariant: size.variant,
      width: size.width,
      height: size.height,
      url: thumbUrl,
      storageKey: thumbKey,
    });
  }
}

/**
 * Validate uploaded file
 */
function validateFile(file: File) {
  const maxSize = parseInt(import.meta.env.MAX_FILE_SIZE || '10485760');
  const allowedTypes = import.meta.env.ALLOWED_IMAGE_TYPES?.split(',') || [];

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Additional security: Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
  };

  if (extension && !expectedExtensions[file.type]?.includes(extension)) {
    throw new Error('File extension does not match MIME type');
  }
}

/**
 * Delete media file
 */
export async function deleteMedia(mediaId: string, userId: string) {
  const media = await db.query.mediaFiles.findFirst({
    where: (media, { eq }) => eq(media.id, mediaId),
  });

  if (!media) {
    throw new Error('Media not found');
  }

  if (media.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete from MinIO
  await minioClient.removeObject(media.bucket, media.storageKey);

  // Delete thumbnails
  const thumbnails = await db.query.mediaThumbnails.findMany({
    where: (thumb, { eq }) => eq(thumb.mediaFileId, mediaId),
  });

  for (const thumb of thumbnails) {
    await minioClient.removeObject(BUCKETS.THUMBNAILS, thumb.storageKey);
  }

  // Delete from database
  await db.delete(mediaFiles).where(eq(mediaFiles.id, mediaId));
}
```

#### 2.2 Upload API Endpoint
```typescript
// src/pages/api/media/upload.ts
import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import { uploadMedia } from '@/lib/services/media';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract metadata
    const metadata = {
      altText: formData.get('altText') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      caption: formData.get('caption') as string,
      tags: formData.get('tags')
        ? (formData.get('tags') as string).split(',')
        : [],
      category: (formData.get('category') as string) || 'general',
    };

    // Upload file
    const result = await uploadMedia(file, session.user.id, metadata);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
```

#### 2.3 Media Library API
```typescript
// src/pages/api/media/index.ts
import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/config';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import { eq, desc, and, ilike, arrayContains } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const tags = url.searchParams.get('tags')?.split(',');
    const offset = (page - 1) * limit;

    // Build query
    let query = db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.userId, session.user.id));

    if (search) {
      query = query.where(
        ilike(mediaFiles.filename, `%${search}%`)
      );
    }

    if (category) {
      query = query.where(eq(mediaFiles.category, category));
    }

    if (tags && tags.length > 0) {
      query = query.where(arrayContains(mediaFiles.tags, tags));
    }

    const results = await query
      .orderBy(desc(mediaFiles.createdAt))
      .limit(limit)
      .offset(offset);

    return new Response(
      JSON.stringify({
        media: results,
        page,
        limit,
        total: results.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Media fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
      status: 500,
    });
  }
};
```

**Deliverables:**
- ✅ File upload service with validation
- ✅ Image optimization and thumbnail generation
- ✅ Upload API endpoint with authentication
- ✅ Media library listing API
- ✅ Delete media endpoint

---

### Phase 3: TipTap Editor Integration (Week 2-3)
**Duration:** 7-10 days

#### 3.1 Install Dependencies
```bash
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-image \
  @tiptap/extension-file-handler @tiptap/extension-youtube \
  @tiptap/extension-link @tiptap/extension-table \
  @tiptap/extension-placeholder @tiptap/extension-character-count \
  sharp qrcode
```

#### 3.2 TipTap Editor Component
```svelte
<!-- src/components/editor/TipTapEditor.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Image from '@tiptap/extension-image';
  import FileHandler from '@tiptap/extension-file-handler';
  import Youtube from '@tiptap/extension-youtube';
  import Link from '@tiptap/extension-link';
  import Table from '@tiptap/extension-table';
  import TableRow from '@tiptap/extension-table-row';
  import TableHeader from '@tiptap/extension-table-header';
  import TableCell from '@tiptap/extension-table-cell';
  import Placeholder from '@tiptap/extension-placeholder';
  import CharacterCount from '@tiptap/extension-character-count';

  export let content = '';
  export let onChange: (content: string) => void;
  export let placeholder = 'Start writing your amazing content...';

  let editor: Editor;
  let element: HTMLElement;
  let uploading = false;

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit,
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: 'rounded-lg shadow-md max-w-full h-auto',
          },
        }),
        FileHandler.configure({
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          onDrop: (currentEditor, files, pos) => {
            files.forEach(async (file) => {
              await uploadAndInsertImage(file, pos);
            });
          },
          onPaste: (currentEditor, files) => {
            files.forEach(async (file) => {
              await uploadAndInsertImage(file);
            });
          },
        }),
        Youtube.configure({
          width: 640,
          height: 360,
          controls: true,
          nocookie: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary-600 hover:underline',
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({
          placeholder,
        }),
        CharacterCount,
      ],
      content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  async function uploadAndInsertImage(file: File, pos?: number) {
    uploading = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'blog-image');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Insert image into editor
      if (pos !== undefined) {
        editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run();
      } else {
        editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      uploading = false;
    }
  }

  function addYoutubeVideo() {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }

  function setLink() {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function insertTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }
</script>

<div class="tiptap-editor-wrapper">
  <!-- Toolbar -->
  <div class="toolbar border-b border-gray-300 p-2 flex gap-2 flex-wrap bg-gray-50">
    <!-- Text Formatting -->
    <button
      on:click={() => editor.chain().focus().toggleBold().run()}
      class:active={editor.isActive('bold')}
      class="toolbar-btn"
      title="Bold (Ctrl+B)"
    >
      <strong>B</strong>
    </button>

    <button
      on:click={() => editor.chain().focus().toggleItalic().run()}
      class:active={editor.isActive('italic')}
      class="toolbar-btn"
      title="Italic (Ctrl+I)"
    >
      <em>I</em>
    </button>

    <button
      on:click={() => editor.chain().focus().toggleStrike().run()}
      class:active={editor.isActive('strike')}
      class="toolbar-btn"
      title="Strikethrough"
    >
      <s>S</s>
    </button>

    <span class="divider"></span>

    <!-- Headings -->
    <button
      on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      class:active={editor.isActive('heading', { level: 1 })}
      class="toolbar-btn"
    >
      H1
    </button>

    <button
      on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      class:active={editor.isActive('heading', { level: 2 })}
      class="toolbar-btn"
    >
      H2
    </button>

    <button
      on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      class:active={editor.isActive('heading', { level: 3 })}
      class="toolbar-btn"
    >
      H3
    </button>

    <span class="divider"></span>

    <!-- Lists -->
    <button
      on:click={() => editor.chain().focus().toggleBulletList().run()}
      class:active={editor.isActive('bulletList')}
      class="toolbar-btn"
      title="Bullet List"
    >
      •••
    </button>

    <button
      on:click={() => editor.chain().focus().toggleOrderedList().run()}
      class:active={editor.isActive('orderedList')}
      class="toolbar-btn"
      title="Ordered List"
    >
      123
    </button>

    <button
      on:click={() => editor.chain().focus().toggleCodeBlock().run()}
      class:active={editor.isActive('codeBlock')}
      class="toolbar-btn"
      title="Code Block"
    >
      &lt;/&gt;
    </button>

    <span class="divider"></span>

    <!-- Media -->
    <button on:click={() => document.getElementById('image-upload')?.click()} class="toolbar-btn" title="Upload Image">
      🖼️ Image
    </button>

    <button on:click={addYoutubeVideo} class="toolbar-btn" title="Embed YouTube Video">
      ▶️ Video
    </button>

    <button on:click={setLink} class="toolbar-btn" title="Insert Link">
      🔗 Link
    </button>

    <button on:click={insertTable} class="toolbar-btn" title="Insert Table">
      📊 Table
    </button>

    {#if uploading}
      <span class="ml-auto text-sm text-gray-600">Uploading...</span>
    {/if}
  </div>

  <!-- Editor Content -->
  <div bind:this={element} class="editor-content prose max-w-none p-4 min-h-[400px] focus:outline-none"></div>

  <!-- Character Count -->
  {#if editor}
    <div class="editor-footer border-t border-gray-300 p-2 text-sm text-gray-600">
      {editor.storage.characterCount.characters()} characters
      · {editor.storage.characterCount.words()} words
    </div>
  {/if}

  <!-- Hidden file input -->
  <input
    id="image-upload"
    type="file"
    accept="image/*"
    style="display: none"
    on:change={async (e) => {
      const file = e.currentTarget.files?.[0];
      if (file) {
        await uploadAndInsertImage(file);
      }
    }}
  />
</div>

<style>
  .toolbar-btn {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toolbar-btn:hover {
    background: #f3f4f6;
  }

  .toolbar-btn.active {
    background: #3b82f6;
    color: white;
  }

  .divider {
    width: 1px;
    background: #e5e7eb;
    margin: 0 0.5rem;
  }

  :global(.editor-content .ProseMirror) {
    outline: none;
  }

  :global(.editor-content .ProseMirror p.is-editor-empty:first-child::before) {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  :global(.editor-content img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  :global(.editor-content table) {
    border-collapse: collapse;
    width: 100%;
  }

  :global(.editor-content table td, .editor-content table th) {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  :global(.editor-content table th) {
    background-color: #f3f4f6;
    font-weight: bold;
  }
</style>
```

#### 3.3 Integrate into Post Editor
```astro
---
// src/pages/admin/posts/[id].astro (Updated)
import TipTapEditor from '@/components/editor/TipTapEditor.svelte';
---

<BaseLayout title="Edit Post - Pythoughts">
  <div class="container mx-auto px-4 py-8">
    <form id="post-form" class="max-w-4xl mx-auto space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          class="input w-full"
        />
      </div>

      <!-- Slug -->
      <div>
        <label for="slug" class="block text-sm font-medium mb-2">Slug</label>
        <input
          type="text"
          id="slug"
          name="slug"
          required
          class="input w-full"
        />
      </div>

      <!-- TipTap Editor -->
      <div>
        <label class="block text-sm font-medium mb-2">Content</label>
        <TipTapEditor
          client:load
          content={post?.content || ''}
          onChange={(html) => {
            document.getElementById('content-html').value = html;
          }}
          placeholder="Start writing your amazing post..."
        />
        <input type="hidden" id="content-html" name="content" />
      </div>

      <!-- Featured Image Upload -->
      <div>
        <label class="block text-sm font-medium mb-2">Featured Image</label>
        <input
          type="file"
          id="featured-image"
          accept="image/*"
          class="input w-full"
        />
        <div id="featured-image-preview" class="mt-2"></div>
      </div>

      <!-- Excerpt -->
      <div>
        <label for="excerpt" class="block text-sm font-medium mb-2">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows="3"
          class="input w-full"
        ></textarea>
      </div>

      <!-- Categories & Tags -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Categories</label>
          <!-- Categories checkboxes -->
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Tags</label>
          <!-- Tags checkboxes -->
        </div>
      </div>

      <!-- Status -->
      <div>
        <label for="status" class="block text-sm font-medium mb-2">Status</label>
        <select id="status" name="status" class="input w-full">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary">
          Save Post
        </button>
        <button type="button" class="btn btn-outline" onclick="history.back()">
          Cancel
        </button>
      </div>
    </form>
  </div>

  <script>
    document.getElementById('post-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Upload featured image if selected
      const featuredImageFile = document.getElementById('featured-image')?.files[0];
      if (featuredImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', featuredImageFile);
        imageFormData.append('category', 'featured');

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: imageFormData,
        });

        const uploadResult = await uploadResponse.json();
        formData.append('featuredImage', uploadResult.url);
      }

      // Submit post
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        window.location.href = '/admin/posts';
      }
    });
  </script>
</BaseLayout>
```

**Deliverables:**
- ✅ Fully functional TipTap editor component
- ✅ Drag-and-drop image upload
- ✅ YouTube video embedding
- ✅ Rich formatting toolbar
- ✅ Table support
- ✅ Character/word count
- ✅ Integrated into post editor page

---

### Phase 4: Media Library UI (Week 3-4)
**Duration:** 5-7 days

#### 4.1 Media Library Component
```svelte
<!-- src/components/admin/MediaLibrary.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let media: any[] = [];
  let loading = true;
  let selectedImage: any = null;
  let searchQuery = '';

  onMount(async () => {
    await fetchMedia();
  });

  async function fetchMedia() {
    loading = true;
    try {
      const response = await fetch(`/api/media?search=${searchQuery}`);
      const data = await response.json();
      media = data.media;
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      loading = false;
    }
  }

  function selectImage(img: any) {
    selectedImage = img;
  }

  async function deleteImage(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        media = media.filter((m) => m.id !== id);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  async function updateMetadata() {
    if (!selectedImage) return;

    try {
      const response = await fetch(`/api/media/${selectedImage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: selectedImage.altText,
          title: selectedImage.title,
          description: selectedImage.description,
          tags: selectedImage.tags,
        }),
      });

      if (response.ok) {
        alert('Metadata updated successfully');
      }
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }
</script>

<div class="media-library grid grid-cols-4 gap-4">
  <!-- Search Bar -->
  <div class="col-span-4 mb-4">
    <input
      type="text"
      bind:value={searchQuery}
      on:input={fetchMedia}
      placeholder="Search media..."
      class="input w-full"
    />
  </div>

  {#if loading}
    <div class="col-span-4 text-center py-8">Loading...</div>
  {:else if media.length === 0}
    <div class="col-span-4 text-center py-8 text-gray-600">
      No media files found. Upload your first image!
    </div>
  {:else}
    <!-- Media Grid -->
    <div class="col-span-3 grid grid-cols-3 gap-4">
      {#each media as item}
        <div class="media-item card p-2 cursor-pointer hover:shadow-lg transition-shadow" on:click={() => selectImage(item)}>
          <img
            src={item.url}
            alt={item.altText || item.filename}
            class="w-full h-48 object-cover rounded"
          />
          <p class="text-sm mt-2 truncate">{item.filename}</p>
        </div>
      {/each}
    </div>

    <!-- Metadata Panel -->
    <div class="col-span-1">
      {#if selectedImage}
        <div class="card p-4 sticky top-4">
          <h3 class="font-bold mb-4">Image Details</h3>

          <img
            src={selectedImage.url}
            alt={selectedImage.altText}
            class="w-full rounded mb-4"
          />

          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium">Alt Text</label>
              <input
                type="text"
                bind:value={selectedImage.altText}
                class="input w-full mt-1"
              />
            </div>

            <div>
              <label class="text-sm font-medium">Title</label>
              <input
                type="text"
                bind:value={selectedImage.title}
                class="input w-full mt-1"
              />
            </div>

            <div>
              <label class="text-sm font-medium">Description</label>
              <textarea
                bind:value={selectedImage.description}
                rows="3"
                class="input w-full mt-1"
              ></textarea>
            </div>

            <div>
              <label class="text-sm font-medium">Tags</label>
              <input
                type="text"
                value={selectedImage.tags.join(', ')}
                on:input={(e) => {
                  selectedImage.tags = e.currentTarget.value.split(',').map((t) => t.trim());
                }}
                class="input w-full mt-1"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div class="text-xs text-gray-600">
              <p>Size: {(selectedImage.fileSize / 1024).toFixed(2)} KB</p>
              <p>Dimensions: {selectedImage.width} × {selectedImage.height}</p>
              <p>Uploaded: {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
            </div>

            <div class="flex gap-2">
              <button on:click={updateMetadata} class="btn btn-primary flex-1">
                Save
              </button>
              <button
                on:click={() => deleteImage(selectedImage.id)}
                class="btn btn-outline text-red-600 border-red-600"
              >
                Delete
              </button>
            </div>

            <button
              on:click={() => {
                navigator.clipboard.writeText(selectedImage.url);
                alert('URL copied to clipboard');
              }}
              class="btn btn-outline w-full"
            >
              Copy URL
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
```

**Deliverables:**
- ✅ Media library browsing interface
- ✅ Search and filter functionality
- ✅ Metadata editing panel
- ✅ Image deletion
- ✅ URL copying for manual embedding

---

### Phase 5: Testing & Quality Assurance (Week 4)
**Duration:** 5-7 days

#### 5.1 Unit Tests
```typescript
// src/lib/services/__tests__/media.test.ts
import { describe, it, expect, vi } from 'vitest';
import { uploadMedia, deleteMedia } from '../media';

describe('Media Service', () => {
  it('should upload image successfully', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const userId = 'test-user-id';

    const result = await uploadMedia(file, userId);

    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('id');
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('should reject oversized files', async () => {
    const largeFile = new File([new ArrayBuffer(20 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    await expect(uploadMedia(largeFile, 'user-id')).rejects.toThrow('exceeds');
  });

  it('should reject invalid file types', async () => {
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' });

    await expect(uploadMedia(invalidFile, 'user-id')).rejects.toThrow('not allowed');
  });
});
```

#### 5.2 Integration Tests
```typescript
// tests/integration/media-upload.test.ts
import { test, expect } from '@playwright/test';

test.describe('Media Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should upload image via drag and drop', async ({ page }) => {
    await page.goto('/admin/posts/new');

    // Create a test file
    const filePath = 'tests/fixtures/test-image.jpg';

    // Simulate drag and drop
    const editor = await page.locator('.editor-content');
    await editor.setInputFiles(filePath);

    // Wait for upload
    await page.waitForSelector('img[src*="minio"]', { timeout: 10000 });

    const imageSrc = await page.locator('.editor-content img').getAttribute('src');
    expect(imageSrc).toContain('minio');
  });

  test('should embed YouTube video', async ({ page }) => {
    await page.goto('/admin/posts/new');

    // Click video button
    await page.click('button:has-text("Video")');

    // Enter URL in prompt
    page.on('dialog', async (dialog) => {
      await dialog.accept('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    // Verify embed
    await page.waitForSelector('iframe[src*="youtube"]');
    const iframe = await page.locator('iframe[src*="youtube"]');
    expect(iframe).toBeTruthy();
  });
});
```

#### 5.3 Performance Tests
```typescript
// tests/performance/media-load.test.ts
import { test } from '@playwright/test';

test('media library should load within 2 seconds', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  const startTime = Date.now();
  await page.goto('/admin/media');
  await page.waitForSelector('.media-item:first-child');
  const loadTime = Date.now() - startTime;

  console.log(`Media library loaded in ${loadTime}ms`);
  expect(loadTime).toBeLessThan(2000);
});
```

**Test Coverage Goals:**
- ✅ Unit tests: 80%+ coverage
- ✅ Integration tests: All critical paths
- ✅ Performance: < 2s page load
- ✅ Security: File validation, XSS prevention
- ✅ Accessibility: WCAG 2.1 AA compliance

---

### Phase 6: Deployment & Documentation (Week 4-5)
**Duration:** 3-5 days

#### 6.1 Production Environment Setup

**Docker Compose Production:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  minio:
    image: quay.io/minio/minio:latest
    container_name: pythoughts-minio-prod
    restart: always
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER_REDIRECT_URL: https://minio-console.pythoughts.com
    volumes:
      - minio-data-prod:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - pythoughts-network

  astro-app:
    build: .
    container_name: pythoughts-app
    restart: always
    ports:
      - "4321:4321"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_PUBLIC_URL: https://media.pythoughts.com
    depends_on:
      - minio
    networks:
      - pythoughts-network

  nginx:
    image: nginx:alpine
    container_name: pythoughts-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - astro-app
      - minio
    networks:
      - pythoughts-network

volumes:
  minio-data-prod:
    driver: local

networks:
  pythoughts-network:
    driver: bridge
```

**Nginx Configuration:**
```nginx
# nginx.conf
upstream astro_app {
  server astro-app:4321;
}

upstream minio_server {
  server minio:9000;
}

upstream minio_console {
  server minio:9001;
}

# Main application
server {
  listen 80;
  server_name pythoughts.com www.pythoughts.com;

  location / {
    proxy_pass http://astro_app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# MinIO API (media serving)
server {
  listen 80;
  server_name media.pythoughts.com;

  # Increase max upload size
  client_max_body_size 100M;

  location / {
    proxy_pass http://minio_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Enable caching
    proxy_cache_valid 200 1d;
    add_header X-Cache-Status $upstream_cache_status;
  }
}

# MinIO Console (admin)
server {
  listen 80;
  server_name minio-console.pythoughts.com;

  location / {
    proxy_pass http://minio_console;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket support for Console
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

#### 6.2 Deployment Checklist

**Pre-Deployment:**
- [ ] Run all tests (`npm run test`)
- [ ] Check TypeScript compilation (`npm run astro check`)
- [ ] Run database migrations (`npm run db:migrate`)
- [ ] Verify environment variables
- [ ] Backup existing database
- [ ] Test on staging environment

**Deployment Steps:**
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Build application
npm run build

# 4. Run database migrations
npm run db:migrate

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify health
curl https://pythoughts.com/health
curl https://media.pythoughts.com/minio/health/live

# 7. Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Post-Deployment:**
- [ ] Verify site is accessible
- [ ] Test image upload
- [ ] Test media library
- [ ] Check MinIO console
- [ ] Monitor error logs
- [ ] Test from different devices
- [ ] Verify SEO metadata
- [ ] Run Lighthouse audit

#### 6.3 Documentation

**User Guide:**
```markdown
# TipTap Editor User Guide

## Getting Started

### Creating a New Post
1. Navigate to **Dashboard → Posts → New Post**
2. Enter your post title (slug auto-generates)
3. Start writing in the rich-text editor

### Adding Images
**Method 1: Drag & Drop**
- Drag image from your computer into the editor
- Wait for upload indicator
- Image appears inline automatically

**Method 2: Upload Button**
- Click the 🖼️ Image button in toolbar
- Select image from file picker
- Image uploads and inserts at cursor

**Method 3: Paste**
- Copy image to clipboard
- Paste directly into editor (Ctrl+V / Cmd+V)

### Formatting Text
- **Bold**: Ctrl+B or click **B** button
- **Italic**: Ctrl+I or click *I* button
- **Headings**: Click H1, H2, or H3 buttons
- **Lists**: Click bullet or numbered list buttons
- **Links**: Highlight text, click 🔗, enter URL

### Embedding Videos
1. Click ▶️ Video button
2. Paste YouTube or Vimeo URL
3. Video embeds automatically

### Managing Images
**Via Media Library:**
1. Navigate to **Dashboard → Media Library**
2. Browse all uploaded media
3. Edit metadata (alt text, title, description, tags)
4. Copy URLs for manual insertion
5. Delete unused media

### SEO Best Practices
- Always add alt text to images
- Use descriptive filenames
- Optimize image sizes (< 2MB recommended)
- Add meaningful titles and descriptions

## Keyboard Shortcuts
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+Shift+8` - Bullet list
- `Ctrl+Shift+7` - Numbered list
- `Ctrl+Alt+1-6` - Headings H1-H6
- `Ctrl+K` - Insert link
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
```

---

## 7. Timeline & Milestones

### Overall Project Duration: 4-5 Weeks

| Phase | Duration | Key Deliverables | Status |
|-------|----------|------------------|--------|
| **Phase 1: Infrastructure** | Week 1 (3-5 days) | MinIO setup, database migration, environment config | 🔄 |
| **Phase 2: Backend API** | Week 1-2 (5-7 days) | Upload API, media service, thumbnails, validation | 🔄 |
| **Phase 3: TipTap Integration** | Week 2-3 (7-10 days) | Editor component, drag-drop, video embeds, formatting | 🔄 |
| **Phase 4: Media Library** | Week 3-4 (5-7 days) | Browse UI, metadata editor, search, deletion | 🔄 |
| **Phase 5: Testing** | Week 4 (5-7 days) | Unit tests, integration tests, performance, security | 🔄 |
| **Phase 6: Deployment** | Week 4-5 (3-5 days) | Production setup, documentation, launch | 🔄 |

### Milestones

**Milestone 1: Infrastructure Complete** (Day 5)
- ✅ MinIO running
- ✅ Buckets configured
- ✅ Database migrated
- ✅ Upload API functional

**Milestone 2: Core Features Complete** (Day 15)
- ✅ TipTap editor integrated
- ✅ Image uploads working
- ✅ Video embeds functional
- ✅ Metadata preserved

**Milestone 3: Polish & Testing** (Day 25)
- ✅ Media library complete
- ✅ All tests passing
- ✅ Performance optimized
- ✅ Documentation written

**Milestone 4: Production Launch** (Day 30)
- ✅ Deployed to production
- ✅ Monitoring active
- ✅ User training complete

---

## 8. Risk Management

### Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MinIO downtime | High | Low | Implement health checks, auto-restart, backup storage |
| Large file uploads crash server | High | Medium | Enforce strict size limits, stream processing, rate limiting |
| XSS via image metadata | Critical | Medium | Sanitize all inputs, escape outputs, CSP headers |
| Storage costs exceed budget | Medium | Low | Implement lifecycle policies, compression, CDN caching |
| Browser compatibility issues | Medium | Medium | Test across browsers, provide fallbacks, progressive enhancement |
| Performance degradation | High | Medium | Lazy loading, image optimization, CDN, caching |

### Mitigation Strategies

**Security:**
```typescript
// Input validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Sanitize metadata
import DOMPurify from 'isomorphic-dompurify';

function sanitizeMetadata(metadata: any) {
  return {
    altText: DOMPurify.sanitize(metadata.altText || ''),
    title: DOMPurify.sanitize(metadata.title || ''),
    description: DOMPurify.sanitize(metadata.description || ''),
  };
}
```

**Performance:**
```typescript
// Lazy load images
<img
  src={url}
  alt={altText}
  loading="lazy"
  decoding="async"
/>

// Use CDN for MinIO
const CDN_URL = import.meta.env.CDN_URL || import.meta.env.MINIO_PUBLIC_URL;
```

---

## 9. Success Metrics

### Key Performance Indicators (KPIs)

**User Experience:**
- Editor load time: < 1 second
- Image upload time: < 3 seconds for 2MB file
- Media library load: < 2 seconds
- Page Lighthouse score: > 90

**System Performance:**
- API response time: < 200ms (p95)
- Upload success rate: > 99%
- Storage efficiency: > 80% (with optimization)
- Uptime: > 99.9%

**Business Impact:**
- Author satisfaction: > 90% (survey)
- Content creation speed: +50% faster
- Media reuse rate: > 30%
- Post quality: Subjective improvement

### Monitoring & Alerts

```typescript
// src/lib/monitoring/metrics.ts
export const metrics = {
  uploadDuration: new Histogram({
    name: 'media_upload_duration_seconds',
    help: 'Duration of media uploads',
  }),

  uploadErrors: new Counter({
    name: 'media_upload_errors_total',
    help: 'Total number of upload errors',
  }),

  storageUsed: new Gauge({
    name: 'minio_storage_bytes',
    help: 'Total storage used in MinIO',
  }),
};
```

---

## 10. Maintenance & Support

### Ongoing Tasks

**Daily:**
- Monitor error logs
- Check storage usage
- Review upload success rates

**Weekly:**
- Review performance metrics
- Analyze user feedback
- Update documentation

**Monthly:**
- Security audits
- Dependency updates
- Backup verification
- Cost optimization

### Support Channels

- **Technical Issues**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **Security Vulnerabilities**: security@pythoughts.com
- **General Support**: support@pythoughts.com

---

## 11. Conclusion

This comprehensive plan provides a professional, production-ready implementation of TipTap editor with MinIO storage for the Pythoughts blogging platform. The phased approach ensures systematic delivery with clear milestones, testing, and quality assurance.

**Key Benefits:**
- ✅ **Exceptional UX**: Professional WYSIWYG editing experience
- ✅ **Self-Hosted**: Complete control over media storage
- ✅ **Scalable**: MinIO handles terabytes of data
- ✅ **SEO-Friendly**: Complete metadata management
- ✅ **Secure**: Input validation, sanitization, access control
- ✅ **Cost-Effective**: No third-party storage fees
- ✅ **Performant**: Optimized images, lazy loading, CDN-ready

**Next Steps:**
1. Review and approve this plan
2. Provision production MinIO server
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

---

**Document Version:** 1.0
**Last Updated:** November 9, 2025
**Author:** Claude (AI Assistant)
**Status:** Ready for Implementation

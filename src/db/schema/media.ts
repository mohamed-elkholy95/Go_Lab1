import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { posts } from './posts';

// Media type enum
export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video',
  'document',
  'audio',
  'other'
]);

// Media status enum
export const mediaStatusEnum = pgEnum('media_status', [
  'uploading',
  'processing',
  'ready',
  'failed'
]);

// Video embed provider enum
export const videoProviderEnum = pgEnum('video_provider', [
  'youtube',
  'vimeo',
  'dailymotion',
  'other'
]);

// Media files table - stores all uploaded media
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),

  // File information
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes

  // Storage information
  bucket: varchar('bucket', { length: 100 }).notNull().default('proxyforms-media'),
  objectKey: varchar('object_key', { length: 500 }).notNull(), // MinIO object key/path
  url: varchar('url', { length: 1000 }).notNull(), // Full URL to access the file

  // Media metadata
  type: mediaTypeEnum('type').notNull(),
  status: mediaStatusEnum('status').default('uploading').notNull(),

  // Image-specific metadata
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text'),
  caption: text('caption'),
  description: text('description'),

  // SEO and organization
  title: varchar('title', { length: 255 }),
  tags: jsonb('tags').$type<string[]>().default([]),

  // Ownership and relations
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .references(() => posts.id, { onDelete: 'set null' }), // Optional: which post uses this media

  // Timestamps
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Media thumbnails table - stores generated thumbnails
export const mediaThumbnails = pgTable('media_thumbnails', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Parent media reference
  mediaId: uuid('media_id')
    .notNull()
    .references(() => mediaFiles.id, { onDelete: 'cascade' }),

  // Thumbnail information
  size: varchar('size', { length: 50 }).notNull(), // e.g., 'small', 'medium', 'large', '150x150'
  width: integer('width').notNull(),
  height: integer('height').notNull(),

  // Storage information
  bucket: varchar('bucket', { length: 100 }).notNull().default('proxyforms-media'),
  objectKey: varchar('object_key', { length: 500 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  fileSize: integer('file_size').notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Video embeds table - stores embedded video information
export const videoEmbeds = pgTable('video_embeds', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Video information
  provider: videoProviderEnum('provider').notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(), // Provider's video ID
  url: varchar('url', { length: 1000 }).notNull(), // Original URL
  embedUrl: varchar('embed_url', { length: 1000 }).notNull(), // Embeddable iframe URL

  // Metadata
  title: varchar('title', { length: 500 }),
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 1000 }),
  duration: integer('duration'), // in seconds

  // Video settings
  width: integer('width').default(640),
  height: integer('height').default(360),
  autoplay: boolean('autoplay').default(false),
  controls: boolean('controls').default(true),

  // Ownership and relations
  addedBy: uuid('added_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .references(() => posts.id, { onDelete: 'set null' }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;

export type MediaThumbnail = typeof mediaThumbnails.$inferSelect;
export type NewMediaThumbnail = typeof mediaThumbnails.$inferInsert;

export type VideoEmbed = typeof videoEmbeds.$inferSelect;
export type NewVideoEmbed = typeof videoEmbeds.$inferInsert;

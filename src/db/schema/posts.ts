import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Post status enum
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived']);

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  description: text('description'),
  featuredImage: varchar('featured_image', { length: 500 }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: postStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at'),
  views: integer('views').default(0).notNull(),
  readingTime: integer('reading_time'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

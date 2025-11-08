import { z } from 'zod';

/**
 * Post creation validation schema
 */
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  featuredImage: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

/**
 * Post update validation schema
 */
export const updatePostSchema = createPostSchema.partial();

/**
 * Post query validation schema
 */
export const postQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'views', 'title']).default('newest'),
});

/**
 * Slug generation helper
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;

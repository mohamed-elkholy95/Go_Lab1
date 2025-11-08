import { z } from 'zod';

/**
 * Comment creation validation schema
 */
export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  parentId: z.string().uuid().optional().nullable(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long (max 2000 characters)'),
});

/**
 * Comment update validation schema
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long (max 2000 characters)'),
});

/**
 * Comment moderation validation schema
 */
export const moderateCommentSchema = z.object({
  status: z.enum(['pending', 'approved', 'spam', 'deleted']),
});

/**
 * Comment query validation schema
 */
export const commentQuerySchema = z.object({
  postId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'spam', 'deleted']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;

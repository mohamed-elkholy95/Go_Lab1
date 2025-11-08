import { z } from 'zod';
import { generateSlug } from './posts';

/**
 * Category creation validation schema
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(500).optional().nullable(),
});

/**
 * Category update validation schema
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Tag creation validation schema
 */
export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
});

/**
 * Tag update validation schema
 */
export const updateTagSchema = createTagSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

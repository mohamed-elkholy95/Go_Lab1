import { describe, it, expect } from 'vitest';
import { createCommentSchema, updateCommentSchema } from '../../src/lib/validations/comments';

describe('Comment Validation Schemas', () => {
  describe('createCommentSchema', () => {
    it('should validate valid comment data', () => {
      const validData = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept valid comment with parent', () => {
      const validData = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        parentId: '123e4567-e89b-12d3-a456-426614174001',
        content: 'This is a reply',
      };

      const result = createCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for postId', () => {
      const invalidData = {
        postId: 'not-a-uuid',
        content: 'Test comment',
      };

      const result = createCommentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const invalidData = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        content: '',
      };

      const result = createCommentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject content longer than 2000 characters', () => {
      const invalidData = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'a'.repeat(2001),
      };

      const result = createCommentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should accept content at max length (2000 chars)', () => {
      const validData = {
        postId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'a'.repeat(2000),
      };

      const result = createCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('updateCommentSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
      };

      const result = updateCommentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject content over limit', () => {
      const invalidData = {
        content: 'a'.repeat(2001),
      };

      const result = updateCommentSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { generateSlug, calculateReadingTime } from '../../src/lib/validations/posts';

describe('Post Validation Utils', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const title = 'My Awesome Blog Post';
      const slug = generateSlug(title);

      expect(slug).toBe('my-awesome-blog-post');
    });

    it('should replace spaces with hyphens', () => {
      const title = 'Hello World Test';
      const slug = generateSlug(title);

      expect(slug).toBe('hello-world-test');
    });

    it('should remove special characters', () => {
      const title = 'Hello! @World# $Test%';
      const slug = generateSlug(title);

      expect(slug).toBe('hello-world-test');
    });

    it('should handle multiple consecutive spaces', () => {
      const title = 'Hello    World';
      const slug = generateSlug(title);

      expect(slug).toBe('hello-world');
    });

    it('should trim leading and trailing hyphens', () => {
      const title = '  Hello World  ';
      const slug = generateSlug(title);

      expect(slug).toBe('hello-world');
    });

    it('should handle empty string', () => {
      const title = '';
      const slug = generateSlug(title);

      expect(slug).toBe('');
    });

    it('should handle special characters only', () => {
      const title = '!@#$%^&*()';
      const slug = generateSlug(title);

      expect(slug).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for short content', () => {
      const content = 'This is a test. '.repeat(50); // ~100 words
      const readingTime = calculateReadingTime(content);

      expect(readingTime).toBe(1); // 100 words / 200 wpm = 0.5, rounds up to 1
    });

    it('should calculate reading time for medium content', () => {
      const content = 'This is a test. '.repeat(200); // ~400 words
      const readingTime = calculateReadingTime(content);

      expect(readingTime).toBe(2); // 400 words / 200 wpm = 2
    });

    it('should calculate reading time for long content', () => {
      const content = 'This is a test. '.repeat(500); // ~1000 words
      const readingTime = calculateReadingTime(content);

      expect(readingTime).toBe(5); // 1000 words / 200 wpm = 5
    });

    it('should handle empty content', () => {
      const content = '';
      const readingTime = calculateReadingTime(content);

      expect(readingTime).toBe(0);
    });

    it('should round up partial minutes', () => {
      const content = 'word '.repeat(250); // 250 words
      const readingTime = calculateReadingTime(content);

      expect(readingTime).toBe(2); // 250 / 200 = 1.25, rounds up to 2
    });
  });
});

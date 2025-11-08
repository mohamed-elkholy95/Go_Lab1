/**
 * Post Scheduler Service
 * Handles automatic publishing of scheduled posts
 */

import { db } from '@/db';
import { posts } from '@/db/schema';
import { and, eq, lte, isNotNull } from 'drizzle-orm';

/**
 * Check and publish scheduled posts that are due
 * This should be called periodically (e.g., via cron job or API endpoint)
 */
export async function publishScheduledPosts(): Promise<{
  success: boolean;
  publishedCount: number;
  publishedPosts: { id: string; title: string }[];
  error?: string;
}> {
  try {
    const now = new Date();

    // Find all posts that are scheduled and due to be published
    const scheduledPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        scheduledAt: posts.scheduledAt,
      })
      .from(posts)
      .where(
        and(
          eq(posts.status, 'draft'),
          isNotNull(posts.scheduledAt),
          lte(posts.scheduledAt, now)
        )
      );

    if (scheduledPosts.length === 0) {
      return {
        success: true,
        publishedCount: 0,
        publishedPosts: [],
      };
    }

    // Publish each post
    const publishedPosts: { id: string; title: string }[] = [];

    for (const post of scheduledPosts) {
      await db
        .update(posts)
        .set({
          status: 'published',
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(posts.id, post.id));

      publishedPosts.push({
        id: post.id,
        title: post.title,
      });
    }

    return {
      success: true,
      publishedCount: publishedPosts.length,
      publishedPosts,
    };
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    return {
      success: false,
      publishedCount: 0,
      publishedPosts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all scheduled posts (admin view)
 */
export async function getScheduledPosts() {
  try {
    const scheduledPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        scheduledAt: posts.scheduledAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(
        and(
          eq(posts.status, 'draft'),
          isNotNull(posts.scheduledAt)
        )
      )
      .orderBy(posts.scheduledAt);

    return {
      success: true,
      posts: scheduledPosts,
    };
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return {
      success: false,
      posts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel a scheduled post (remove scheduled date)
 */
export async function cancelScheduledPost(postId: string) {
  try {
    await db
      .update(posts)
      .set({
        scheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    return { success: true };
  } catch (error) {
    console.error('Error canceling scheduled post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reschedule a post
 */
export async function reschedulePost(postId: string, newScheduledAt: Date) {
  try {
    // Ensure the new schedule date is in the future
    if (newScheduledAt <= new Date()) {
      return {
        success: false,
        error: 'Scheduled date must be in the future',
      };
    }

    await db
      .update(posts)
      .set({
        scheduledAt: newScheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    return { success: true };
  } catch (error) {
    console.error('Error rescheduling post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

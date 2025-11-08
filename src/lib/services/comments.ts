import { db } from '@/db';
import { comments, users, posts } from '@/db/schema';
import { eq, desc, asc, and, sql, isNull } from 'drizzle-orm';
import type {
  CreateCommentInput,
  UpdateCommentInput,
  ModerateCommentInput,
  CommentQueryInput,
} from '../validations/comments';

/**
 * Get comments with pagination and filters
 */
export async function getComments(query: CommentQueryInput) {
  const { page, limit, postId, userId, status, sort } = query;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (postId) {
    conditions.push(eq(comments.postId, postId));
  }

  if (userId) {
    conditions.push(eq(comments.userId, userId));
  }

  if (status) {
    conditions.push(eq(comments.status, status));
  }

  // Determine sort order
  const orderBy = sort === 'oldest' ? asc(comments.createdAt) : desc(comments.createdAt);

  // Execute query
  const result = await db
    .select({
      comment: comments,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    comments: result,
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  };
}

/**
 * Get comments for a specific post with nested replies
 */
export async function getPostComments(postId: string, statusFilter: string = 'approved') {
  // Get all approved comments for the post
  const allComments = await db
    .select({
      comment: comments,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.postId, postId), eq(comments.status, statusFilter as any)))
    .orderBy(asc(comments.createdAt));

  // Build nested structure
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create map of all comments
  allComments.forEach((item) => {
    const commentWithReplies = {
      ...item.comment,
      user: item.user,
      replies: [],
    };
    commentMap.set(item.comment.id, commentWithReplies);
  });

  // Second pass: build tree structure
  allComments.forEach((item) => {
    const comment = commentMap.get(item.comment.id);
    if (item.comment.parentId) {
      const parent = commentMap.get(item.comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(id: string) {
  const [comment] = await db
    .select({
      comment: comments,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, id));

  return comment || null;
}

/**
 * Create a new comment
 */
export async function createComment(userId: string, data: CreateCommentInput) {
  // Verify post exists
  const [post] = await db.select().from(posts).where(eq(posts.id, data.postId));

  if (!post) {
    throw new Error('Post not found');
  }

  // If parentId is provided, verify parent comment exists
  if (data.parentId) {
    const [parentComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, data.parentId));

    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    // Verify parent belongs to the same post
    if (parentComment.postId !== data.postId) {
      throw new Error('Parent comment does not belong to this post');
    }
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      userId,
      postId: data.postId,
      parentId: data.parentId || null,
      content: data.content,
      status: 'approved', // Auto-approve for now, can add moderation later
    })
    .returning();

  return newComment;
}

/**
 * Update a comment
 */
export async function updateComment(id: string, userId: string, data: UpdateCommentInput) {
  // Get existing comment
  const [existing] = await db.select().from(comments).where(eq(comments.id, id));

  if (!existing) {
    throw new Error('Comment not found');
  }

  // Verify ownership
  if (existing.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const [updated] = await db
    .update(comments)
    .set({
      content: data.content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  return updated;
}

/**
 * Delete a comment (soft delete by setting status to 'deleted')
 */
export async function deleteComment(id: string, userId: string, isAdmin: boolean = false) {
  // Get existing comment
  const [existing] = await db.select().from(comments).where(eq(comments.id, id));

  if (!existing) {
    throw new Error('Comment not found');
  }

  // Verify ownership or admin
  if (!isAdmin && existing.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Soft delete
  await db
    .update(comments)
    .set({
      status: 'deleted',
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id));

  return true;
}

/**
 * Moderate a comment (admin only)
 */
export async function moderateComment(id: string, data: ModerateCommentInput) {
  const [existing] = await db.select().from(comments).where(eq(comments.id, id));

  if (!existing) {
    throw new Error('Comment not found');
  }

  const [updated] = await db
    .update(comments)
    .set({
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  return updated;
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.status, 'approved')));

  return Number(count);
}

/**
 * Get comment counts for multiple posts
 */
export async function getCommentCounts(postIds: string[]) {
  const counts = await db
    .select({
      postId: comments.postId,
      count: sql<number>`count(*)`,
    })
    .from(comments)
    .where(and(sql`${comments.postId} = ANY(${postIds})`, eq(comments.status, 'approved')))
    .groupBy(comments.postId);

  return counts.reduce(
    (acc, { postId, count }) => {
      acc[postId] = Number(count);
      return acc;
    },
    {} as Record<string, number>
  );
}

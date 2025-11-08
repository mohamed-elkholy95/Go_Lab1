import { db } from '@/db';
import { posts, postCategories, postTags, categories, tags, users } from '@/db/schema';
import { eq, desc, asc, and, or, like, sql, inArray } from 'drizzle-orm';
import type { CreatePostInput, UpdatePostInput, PostQueryInput } from '../validations/posts';
import { calculateReadingTime } from '../validations/posts';

/**
 * Get all posts with pagination and filters
 */
export async function getPosts(query: PostQueryInput) {
  const { page, limit, status, authorId, categoryId, tagId, search, sort } = query;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (status) {
    conditions.push(eq(posts.status, status));
  }

  if (authorId) {
    conditions.push(eq(posts.authorId, authorId));
  }

  if (search) {
    conditions.push(
      or(
        like(posts.title, `%${search}%`),
        like(posts.content, `%${search}%`),
        like(posts.excerpt, `%${search}%`)
      )!
    );
  }

  // Determine sort order
  let orderBy;
  switch (sort) {
    case 'oldest':
      orderBy = asc(posts.createdAt);
      break;
    case 'views':
      orderBy = desc(posts.views);
      break;
    case 'title':
      orderBy = asc(posts.title);
      break;
    case 'newest':
    default:
      orderBy = desc(posts.createdAt);
      break;
  }

  // Execute query
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    posts: result,
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  };
}

/**
 * Get a single post by ID with author and categories/tags
 */
export async function getPostById(id: string) {
  const [post] = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id));

  if (!post) {
    return null;
  }

  // Get categories
  const postCats = await db
    .select({ category: categories })
    .from(postCategories)
    .leftJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, id));

  // Get tags
  const postTgs = await db
    .select({ tag: tags })
    .from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id));

  return {
    ...post,
    categories: postCats.map((c) => c.category).filter(Boolean),
    tags: postTgs.map((t) => t.tag).filter(Boolean),
  };
}

/**
 * Get a single post by slug with author and categories/tags
 */
export async function getPostBySlug(slug: string) {
  const [post] = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug));

  if (!post) {
    return null;
  }

  // Get categories
  const postCats = await db
    .select({ category: categories })
    .from(postCategories)
    .leftJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, post.post.id));

  // Get tags
  const postTgs = await db
    .select({ tag: tags })
    .from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.post.id));

  return {
    ...post,
    categories: postCats.map((c) => c.category).filter(Boolean),
    tags: postTgs.map((t) => t.tag).filter(Boolean),
  };
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostInput, authorId: string) {
  const { categoryIds, tagIds, ...postData } = data;

  // Calculate reading time
  const readingTime = calculateReadingTime(postData.content);

  // Create post
  const [newPost] = await db
    .insert(posts)
    .values({
      ...postData,
      authorId,
      readingTime,
      publishedAt: postData.status === 'published' ? new Date() : null,
    })
    .returning();

  // Add categories
  if (categoryIds && categoryIds.length > 0) {
    await db.insert(postCategories).values(
      categoryIds.map((categoryId) => ({
        postId: newPost.id,
        categoryId,
      }))
    );
  }

  // Add tags
  if (tagIds && tagIds.length > 0) {
    await db.insert(postTags).values(
      tagIds.map((tagId) => ({
        postId: newPost.id,
        tagId,
      }))
    );
  }

  return newPost;
}

/**
 * Update a post
 */
export async function updatePost(id: string, data: UpdatePostInput) {
  const { categoryIds, tagIds, ...postData } = data;

  // Calculate reading time if content changed
  const updateData: any = { ...postData, updatedAt: new Date() };

  if (postData.content) {
    updateData.readingTime = calculateReadingTime(postData.content);
  }

  // Update published date if status changed to published
  if (postData.status === 'published') {
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, id));
    if (existingPost && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  // Update post
  const [updatedPost] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  // Update categories if provided
  if (categoryIds !== undefined) {
    await db.delete(postCategories).where(eq(postCategories.postId, id));
    if (categoryIds.length > 0) {
      await db.insert(postCategories).values(
        categoryIds.map((categoryId) => ({
          postId: id,
          categoryId,
        }))
      );
    }
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    await db.delete(postTags).where(eq(postTags.postId, id));
    if (tagIds.length > 0) {
      await db.insert(postTags).values(
        tagIds.map((tagId) => ({
          postId: id,
          tagId,
        }))
      );
    }
  }

  return updatedPost;
}

/**
 * Delete a post
 */
export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}

/**
 * Increment post views
 */
export async function incrementViews(id: string) {
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, id));
}

/**
 * Get recent posts
 */
export async function getRecentPosts(limit = 5) {
  return await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

/**
 * Get popular posts (by views)
 */
export async function getPopularPosts(limit = 5) {
  return await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.views))
    .limit(limit);
}

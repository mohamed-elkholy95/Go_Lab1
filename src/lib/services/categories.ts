import { db } from '@/db';
import { categories, tags, postCategories, postTags } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTagInput,
  UpdateTagInput,
} from '../validations/categories';

/**
 * Get all categories with post count
 */
export async function getCategories() {
  return await db
    .select({
      category: categories,
      postCount: sql<number>`count(${postCategories.postId})`,
    })
    .from(categories)
    .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
    .groupBy(categories.id)
    .orderBy(categories.name);
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  const [category] = await db.select().from(categories).where(eq(categories.id, id));
  return category;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
  return category;
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryInput) {
  const [newCategory] = await db.insert(categories).values(data).returning();
  return newCategory;
}

/**
 * Update a category
 */
export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const [updatedCategory] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return updatedCategory;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

/**
 * Get all tags with post count
 */
export async function getTags() {
  return await db
    .select({
      tag: tags,
      postCount: sql<number>`count(${postTags.postId})`,
    })
    .from(tags)
    .leftJoin(postTags, eq(tags.id, postTags.tagId))
    .groupBy(tags.id)
    .orderBy(tags.name);
}

/**
 * Get tag by ID
 */
export async function getTagById(id: string) {
  const [tag] = await db.select().from(tags).where(eq(tags.id, id));
  return tag;
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string) {
  const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
  return tag;
}

/**
 * Create a new tag
 */
export async function createTag(data: CreateTagInput) {
  const [newTag] = await db.insert(tags).values(data).returning();
  return newTag;
}

/**
 * Update a tag
 */
export async function updateTag(id: string, data: UpdateTagInput) {
  const [updatedTag] = await db.update(tags).set(data).where(eq(tags.id, id)).returning();
  return updatedTag;
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string) {
  await db.delete(tags).where(eq(tags.id, id));
}

/**
 * Get popular tags (most used)
 */
export async function getPopularTags(limit = 10) {
  return await db
    .select({
      tag: tags,
      postCount: sql<number>`count(${postTags.postId})`,
    })
    .from(tags)
    .leftJoin(postTags, eq(tags.id, postTags.tagId))
    .groupBy(tags.id)
    .orderBy(sql`count(${postTags.postId}) desc`)
    .limit(limit);
}

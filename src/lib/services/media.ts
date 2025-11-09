import { db } from '@/db';
import { mediaFiles, mediaThumbnails, videoEmbeds, type NewMediaFile, type NewMediaThumbnail, type NewVideoEmbed } from '@/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

/**
 * Media service for database operations
 */

// Media Files
export async function createMediaFile(data: NewMediaFile) {
  const [media] = await db.insert(mediaFiles).values(data).returning();
  return media;
}

export async function getMediaFileById(id: string) {
  const [media] = await db
    .select()
    .from(mediaFiles)
    .where(and(eq(mediaFiles.id, id), isNull(mediaFiles.deletedAt)));
  return media;
}

export async function getMediaFilesByUser(userId: string, limit: number = 50) {
  return await db
    .select()
    .from(mediaFiles)
    .where(and(eq(mediaFiles.uploadedBy, userId), isNull(mediaFiles.deletedAt)))
    .orderBy(desc(mediaFiles.uploadedAt))
    .limit(limit);
}

export async function getMediaFilesByPost(postId: string) {
  return await db
    .select()
    .from(mediaFiles)
    .where(and(eq(mediaFiles.postId, postId), isNull(mediaFiles.deletedAt)))
    .orderBy(desc(mediaFiles.uploadedAt));
}

export async function updateMediaFile(id: string, data: Partial<NewMediaFile>) {
  const [updated] = await db
    .update(mediaFiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(mediaFiles.id, id))
    .returning();
  return updated;
}

export async function softDeleteMediaFile(id: string) {
  const [deleted] = await db
    .update(mediaFiles)
    .set({ deletedAt: new Date() })
    .where(eq(mediaFiles.id, id))
    .returning();
  return deleted;
}

export async function hardDeleteMediaFile(id: string) {
  await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
}

// Media Thumbnails
export async function createMediaThumbnail(data: NewMediaThumbnail) {
  const [thumbnail] = await db.insert(mediaThumbnails).values(data).returning();
  return thumbnail;
}

export async function getThumbnailsByMediaId(mediaId: string) {
  return await db
    .select()
    .from(mediaThumbnails)
    .where(eq(mediaThumbnails.mediaId, mediaId));
}

export async function deleteThumbnailsByMediaId(mediaId: string) {
  await db.delete(mediaThumbnails).where(eq(mediaThumbnails.mediaId, mediaId));
}

// Video Embeds
export async function createVideoEmbed(data: NewVideoEmbed) {
  const [video] = await db.insert(videoEmbeds).values(data).returning();
  return video;
}

export async function getVideoEmbedById(id: string) {
  const [video] = await db
    .select()
    .from(videoEmbeds)
    .where(eq(videoEmbeds.id, id));
  return video;
}

export async function getVideoEmbedsByUser(userId: string, limit: number = 50) {
  return await db
    .select()
    .from(videoEmbeds)
    .where(eq(videoEmbeds.addedBy, userId))
    .orderBy(desc(videoEmbeds.createdAt))
    .limit(limit);
}

export async function getVideoEmbedsByPost(postId: string) {
  return await db
    .select()
    .from(videoEmbeds)
    .where(eq(videoEmbeds.postId, postId))
    .orderBy(desc(videoEmbeds.createdAt));
}

export async function updateVideoEmbed(id: string, data: Partial<NewVideoEmbed>) {
  const [updated] = await db
    .update(videoEmbeds)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(videoEmbeds.id, id))
    .returning();
  return updated;
}

export async function deleteVideoEmbed(id: string) {
  await db.delete(videoEmbeds).where(eq(videoEmbeds.id, id));
}

/**
 * Get media library for a user with thumbnails
 */
export async function getMediaLibrary(userId: string, limit: number = 50) {
  const media = await db
    .select()
    .from(mediaFiles)
    .where(and(eq(mediaFiles.uploadedBy, userId), isNull(mediaFiles.deletedAt)))
    .orderBy(desc(mediaFiles.uploadedAt))
    .limit(limit);

  // Fetch thumbnails for each media file
  const mediaWithThumbnails = await Promise.all(
    media.map(async (item) => {
      const thumbnails = await getThumbnailsByMediaId(item.id);
      return {
        ...item,
        thumbnails,
      };
    })
  );

  return mediaWithThumbnails;
}

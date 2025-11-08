import type { APIRoute } from 'astro';
import { db } from '@/db';
import { posts, users, categories, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://pythoughts.com';

  // Fetch all published posts
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'));

  // Fetch all categories
  const allCategories = await db.select().from(categories);

  // Fetch all tags
  const allTags = await db.select().from(tags);

  // Fetch all users (for author pages)
  const allUsers = await db.select().from(users);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${siteUrl}/auth/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${siteUrl}/auth/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Posts -->
  ${publishedPosts
    .map(
      (post) => `
  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

  <!-- Categories -->
  ${allCategories
    .map(
      (category) => `
  <url>
    <loc>${siteUrl}/categories/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}

  <!-- Tags -->
  ${allTags
    .map(
      (tag) => `
  <url>
    <loc>${siteUrl}/tags/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
    )
    .join('')}

  <!-- Author Pages -->
  ${allUsers
    .map(
      (user) => `
  <url>
    <loc>${siteUrl}/users/${user.username}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

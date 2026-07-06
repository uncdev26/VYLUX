---
import { db, posts, pages } from '../lib/db';
import { eq, and, sql, desc } from 'drizzle-orm';

const siteUrl = Astro.site?.toString() || 'http://localhost:4321';

// Fetch all published posts
const publishedPosts = await db
  .select({
    slug: posts.slug,
    updatedAt: posts.updatedAt,
    publishedAt: posts.publishedAt,
  })
  .from(posts)
  .where(and(eq(posts.status, 'published'), sql`${posts.deletedAt} IS NULL`))
  .orderBy(desc(posts.publishedAt));

// Fetch all published pages
const publishedPages = await db
  .select({
    slug: pages.slug,
    updatedAt: pages.updatedAt,
  })
  .from(pages)
  .where(and(eq(pages.status, 'published'), sql`${pages.deletedAt} IS NULL`));

function formatDate(date: Date | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}
---

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>{siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Blog posts -->
  {publishedPosts.map((post) => (
    <url>
      <loc>{siteUrl}blog/{post.slug}</loc>
      <lastmod>{formatDate(post.updatedAt || post.publishedAt)}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  ))}

  <!-- Static pages -->
  {publishedPages.map((page) => (
    <url>
      <loc>{siteUrl}{page.slug}</loc>
      <lastmod>{formatDate(page.updatedAt)}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  ))}
</urlset>

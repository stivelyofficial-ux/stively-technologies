import "server-only";

/**
 * The latest articles from blog.stively.com, for the student dashboard.
 *
 * The blog is a separate deployment with no public API or RSS feed, so this
 * reads what it does publish: its sitemap (post URLs + last-modified dates)
 * and each post's own Open Graph tags (title, description, cover image).
 * Everything is cached for an hour (Next's fetch cache), every request has a
 * short timeout, and ANY failure returns an empty list - a slow or down blog
 * must never slow down or break the dashboard; the section just links out.
 */
const BLOG_ORIGIN = "https://blog.stively.com";
const REVALIDATE_SECONDS = 3600;
const TIMEOUT_MS = 4000;

export interface BlogPostPreview {
  url: string;
  title: string;
  description: string;
  imageUrl: string | null;
  publishedAt: Date | null;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "Stively-Dashboard/1.0" },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(`<meta[^>]*(?:property|name)="${property}"[^>]*content="([^"]*)"`, "i");
  const match = re.exec(html);
  return match ? decodeEntities(match[1]).trim() : null;
}

/** Post URLs from the sitemap, newest first. Exported for tests. */
export function parseSitemapPosts(xml: string): { url: string; lastmod: number }[] {
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  return entries
    .map((m) => {
      const url = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1]?.trim();
      const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1];
      return { url, lastmod: lastmod ? Date.parse(lastmod) : 0 };
    })
    .filter(
      (e): e is { url: string; lastmod: number } =>
        !!e.url && e.url.startsWith(`${BLOG_ORIGIN}/blog/`)
    )
    .sort((a, b) => b.lastmod - a.lastmod);
}

export function parsePostMeta(html: string, url: string): BlogPostPreview | null {
  const title = metaContent(html, "og:title");
  if (!title) return null;
  const published = metaContent(html, "article:published_time");
  const publishedAt = published ? new Date(published) : null;
  return {
    url,
    title,
    description: metaContent(html, "og:description") ?? metaContent(html, "description") ?? "",
    imageUrl: metaContent(html, "og:image"),
    publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
  };
}

export async function getLatestBlogPosts(limit = 3): Promise<BlogPostPreview[]> {
  const xml = await fetchText(`${BLOG_ORIGIN}/sitemap.xml`);
  if (!xml) return [];
  const posts = parseSitemapPosts(xml).slice(0, limit);
  const previews = await Promise.all(
    posts.map(async (post) => {
      const html = await fetchText(post.url);
      return html ? parsePostMeta(html, post.url) : null;
    })
  );
  return previews.filter((p): p is BlogPostPreview => p != null);
}

export { BLOG_HOME_URL } from "../lib/constants";

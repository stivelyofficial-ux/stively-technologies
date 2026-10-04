import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Newspaper } from "lucide-react";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { PageHeader } from "@/components/dashboard-shell/widgets/page-header";
import { EmptyState } from "@/components/sections/empty-state";
import { Container } from "@/components/shared/container";
import { getLatestBlogPosts } from "@/features/blog/server/blog-feed";
import { BLOG_HOME_URL } from "@/features/blog/lib/constants";

export const metadata: Metadata = { title: "Blogs" };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** The latest articles from blog.stively.com (read from its sitemap and post metadata, cached for an hour - see features/blog/server/blog-feed.ts). Each opens on the blog itself. */
export default async function StudentBlogsPage() {
  await requireRole("STUDENT");
  const posts = await getLatestBlogPosts(12);

  return (
    <>
      <SetPageTitle title="Blogs" />
      <Container className="flex flex-col gap-7 pt-7 pb-16 sm:pt-9">
        <PageHeader
          title="Blogs"
          description="Guides on careers, freelancing, AI and building software."
          action={
            <a
              href={BLOG_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              Visit blog.stively.com <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          }
        />

        {posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Our articles are on the Stively blog"
            description="We couldn't load the latest posts just now - open the blog to read them."
            actionLabel="Open blog.stively.com"
            actionHref={BLOG_HOME_URL}
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.url}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border-border hover:border-primary/50 flex h-full flex-col overflow-hidden rounded-2xl border transition-colors"
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt=""
                      width={800}
                      height={420}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
                      className="aspect-[1.9/1] w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-muted aspect-[1.9/1] w-full" aria-hidden="true" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    {post.publishedAt && (
                      <span className="text-muted-foreground text-xs">
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                    <h2 className="text-foreground group-hover:text-primary text-lg leading-snug font-bold">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

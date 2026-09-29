import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { richTextContentSchema } from "../../lib/block-types";
import { ReadingAutoComplete } from "./reading-auto-complete";
import type { LessonBlock } from "@prisma/client";

/**
 * The reading-material page's own theme, deliberately distinct from the
 * rest of the app's Geist/Bricolage sans-serif brand type - a warm,
 * paper-like "reading mode" (reference: the Figma-style reading-notes
 * mockup shared 2026-09-29), not the marketing/product chrome around it.
 * Scoped to this component only via next/font's local className, so it
 * never touches the site's global font stack.
 */
const readingSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"] });

/**
 * Every descendant selector below styles plain markdown output - authors
 * write normal markdown (headings, paragraphs, `1. ` ordered lists, ```
 * code fences, `> ` blockquotes, GFM tables via remark-gfm), no custom
 * syntax. Two patterns map onto real HTML rather than invented markdown
 * extensions: the reference's numbered "idea rows" are just an ordered
 * list with a large, colored ::marker (the `marker:` variant below), and
 * its "card" callouts are just a blockquote with a tinted background.
 */
const READING_THEME_CLASSES = [
  "text-[#201e1d] dark:text-[#efece9]",
  "[&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight sm:[&_h2]:text-[28px]",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
  "[&_p]:mb-3 [&_p]:text-pretty [&_p]:leading-7",
  "[&_strong]:font-semibold",
  "[&_a]:text-[#0088b0] [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-[#4fc3e0]",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-7",
  // The "idea row" pattern: a big serif, accent-colored number as the
  // native list marker - no counter hacks, just ::marker styling on a
  // completely ordinary <ol>.
  "[&_ol]:mb-4 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-3 [&_ol]:pl-9",
  "[&_ol_li]:leading-7 [&_ol_li]:marker:font-semibold [&_ol_li]:marker:text-xl",
  "[&_ol_li]:marker:text-[#0088b0] dark:[&_ol_li]:marker:text-[#4fc3e0]",
  "[&_li]:mt-1",
  // Code: a plain inline `code` chip, and fenced blocks in a tinted panel -
  // the reference's token colors are decorative syntax highlighting this
  // app doesn't run, so blocks render as clean, readable monospace instead
  // of half-highlighted code.
  "[&_code]:rounded-sm [&_code]:bg-[#e2e0e0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] dark:[&_code]:bg-[#2f2b2a]",
  "[&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-[#eae9e9] [&_pre]:p-5 [&_pre]:leading-relaxed dark:[&_pre]:bg-[#262322]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  // Blockquote-as-card: the reference's tinted callout ("The house
  // analogy", "Rule to remember"), reached with the one markdown syntax
  // (`> `) that already means "set this apart from the flow."
  "[&_blockquote]:my-4 [&_blockquote]:rounded [&_blockquote]:border-0 [&_blockquote]:bg-[#eae9e9] [&_blockquote]:px-5 [&_blockquote]:py-4 dark:[&_blockquote]:bg-[#262322]",
  "[&_blockquote_p]:mb-0",
  // GFM tables (remark-gfm) - small uppercase headers, hairline rules,
  // matching the reference's "house analogy" table exactly.
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px]",
  "[&_th]:border-b [&_th]:border-[#201e1d]/15 [&_th]:pb-2 [&_th]:text-left [&_th]:text-[11.5px] [&_th]:font-normal [&_th]:tracking-wider [&_th]:text-[#7d7979] [&_th]:uppercase dark:[&_th]:border-white/15 dark:[&_th]:text-[#a8a39f]",
  "[&_td]:border-b [&_td]:border-[#201e1d]/8 [&_td]:py-2 dark:[&_td]:border-white/8",
  "[&_hr]:my-10 [&_hr]:border-[#201e1d]/15 dark:[&_hr]:border-white/15",
].join(" ");

/** Shown under a reading-material block regardless of MARKDOWN/RICH_TEXT - the PDF route itself only serves those two types, matching block-renderer.tsx's dispatch. */
function ReadingDownload({ enrollmentId, blockId, canDownload }: { enrollmentId: string; blockId: string; canDownload: boolean }) {
  return canDownload ? (
    <Button asChild variant="outline" size="sm" className="w-fit">
      <a href={`/api/learning/${enrollmentId}/blocks/${blockId}/pdf`}>
        <Download aria-hidden="true" />
        Download as PDF
      </a>
    </Button>
  ) : (
    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Lock className="size-3.5" aria-hidden="true" />
      Downloading reading material is a{" "}
      <Link href="/checkout/prime-membership" className="text-primary underline underline-offset-4">
        Prime Membership
      </Link>{" "}
      perk.
    </p>
  );
}

/** RICH_TEXT and MARKDOWN share this renderer (and the same {text} content shape) - RICH_TEXT preserves line breaks as plain paragraphs (no HTML sanitizer in this codebase, so no dangerouslySetInnerHTML), MARKDOWN renders through react-markdown (safe by default, no raw HTML passthrough). */
function BlockText({
  block,
  enrollmentId,
  canDownload,
  lessonAlreadyCompleted,
}: {
  block: LessonBlock;
  enrollmentId: string;
  /** access-policy.ts's canDownloadResources (Prime Membership) - gates the download button below, not the on-page reading itself, which stays open to every enrolled student either way. */
  canDownload: boolean;
  lessonAlreadyCompleted: boolean;
}) {
  const parsed = richTextContentSchema.safeParse(block.content);
  if (!parsed.success) return null;
  const content = parsed.data;

  if (block.type === "MARKDOWN") {
    // No @tailwindcss/typography plugin in this project - styled directly
    // via descendant selectors instead of pulling in a second new
    // dependency just for prose defaults. The "-mx" negative margins let
    // the paper background bleed to the lesson column's edges without
    // this block needing to know its container's own padding.
    return (
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            readingSerif.className,
            "-mx-4 rounded-lg bg-[#f3f2f2] px-4 py-6 sm:-mx-6 sm:px-8 sm:py-8 dark:bg-[#1c1a19]",
            READING_THEME_CLASSES
          )}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{content.text}</Markdown>
        </div>
        <ReadingDownload enrollmentId={enrollmentId} blockId={block.id} canDownload={canDownload} />
        <ReadingAutoComplete enrollmentId={enrollmentId} lessonId={block.lessonId} lessonAlreadyCompleted={lessonAlreadyCompleted} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground text-base whitespace-pre-line text-pretty">{content.text}</p>
      <ReadingDownload enrollmentId={enrollmentId} blockId={block.id} canDownload={canDownload} />
      <ReadingAutoComplete enrollmentId={enrollmentId} lessonId={block.lessonId} lessonAlreadyCompleted={lessonAlreadyCompleted} />
    </div>
  );
}

export { BlockText };

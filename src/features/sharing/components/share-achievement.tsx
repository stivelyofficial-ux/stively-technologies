"use client";

import * as React from "react";
import { Check, Copy, MessageCircle, Share2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { FacebookIcon, LinkedinIcon, XIcon } from "./brand-icons";
import {
  facebookShareUrl,
  linkedinShareUrl,
  twitterShareUrl,
  whatsappShareUrl,
} from "../lib/share-links";

export interface ShareAchievementProps {
  /** Heading, e.g. "Share your certificate". */
  title: string;
  /** One line on why it helps them (recruiters can verify it, etc.). */
  benefit: string;
  /** The public, verifiable page being shared. */
  url: string;
  /** Ready-to-paste post text (already contains the url). */
  caption: string;
  /** Optional LinkedIn "Add to profile" deep link - the primary action for certificates. */
  linkedinProfileUrl?: string;
  linkedinProfileLabel?: string;
  /** Short text for X, which has a length limit. */
  shortText: string;
  className?: string;
}

const BTN =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary";

/**
 * "Share this achievement" - the learner's one-tap path to LinkedIn and
 * friends. LinkedIn gets two routes on purpose: "Add to profile" (the
 * credential itself, with a verification link recruiters can click) and
 * "Share as a post" (visibility to their network). The post caption is
 * copied to the clipboard first because LinkedIn won't take prefilled text.
 */
function ShareAchievement({
  title,
  benefit,
  url,
  caption,
  linkedinProfileUrl,
  linkedinProfileLabel = "Add to LinkedIn profile",
  shortText,
  className,
}: ShareAchievementProps) {
  const [copied, setCopied] = React.useState<"link" | "caption" | undefined>();

  async function copy(kind: "link" | "caption", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(undefined), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function shareToLinkedInPost() {
    // LinkedIn drops prefilled text, so put the caption on the clipboard before opening the composer.
    await copy("caption", caption);
    window.open(linkedinShareUrl(url), "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: caption, url });
    } catch {
      /* dismissed - nothing to do */
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section
      aria-label={title}
      className={cn(
        "bg-primary/5 border-primary/20 flex flex-col gap-4 rounded-2xl border p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Share2 className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-foreground text-lg font-bold">{title}</h3>
          <p className="text-muted-foreground flex items-start gap-1.5 text-sm text-pretty">
            <ShieldCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {benefit}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {linkedinProfileUrl && (
          <a
            href={linkedinProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#084f96]"
          >
            <LinkedinIcon className="size-4" />
            {linkedinProfileLabel}
          </a>
        )}
        <button type="button" onClick={shareToLinkedInPost} className={BTN}>
          <LinkedinIcon className="size-4" />
          {copied === "caption" ? "Caption copied - paste it" : "Share as a LinkedIn post"}
        </button>
        <a
          href={whatsappShareUrl(caption)}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp
        </a>
        <a
          href={twitterShareUrl(shortText, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN}
        >
          <XIcon className="size-4" />X
        </a>
        <a href={facebookShareUrl(url)} target="_blank" rel="noopener noreferrer" className={BTN}>
          <FacebookIcon className="size-4" />
          Facebook
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={cn(BTN, "sm:hidden")}>
            <Share2 className="size-4" aria-hidden="true" />
            More
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <button
          type="button"
          onClick={() => copy("link", url)}
          className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          {copied === "link" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => copy("caption", caption)}
          className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          {copied === "caption" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied === "caption" ? "Caption copied" : "Copy post text"}
        </button>
      </div>
    </section>
  );
}

export { ShareAchievement };

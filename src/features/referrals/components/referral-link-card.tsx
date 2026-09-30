"use client";

import * as React from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ReferralLinkCard({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  const shareText = `I'm learning with Stively - use my link to get started: ${link}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={link} readOnly onFocus={(e) => e.currentTarget.select()} className="font-mono text-sm" />
        <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex w-fit items-center gap-1.5 text-sm font-medium hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Share on WhatsApp
      </a>
    </div>
  );
}

export { ReferralLinkCard };

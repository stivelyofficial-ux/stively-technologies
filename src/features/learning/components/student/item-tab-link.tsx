"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

/** Shows a small spinner in place of the item's icon while this specific Link's navigation is pending - must be a child of <Link>, that's what useLinkStatus requires. */
function PendingIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }> }) {
  const { pending } = useLinkStatus();
  if (pending) return <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />;
  return <Icon className="size-4 shrink-0" aria-hidden="true" />;
}

/**
 * Switching between a lesson's video/reading/quiz items is a real
 * server-navigation (new ?item= search param re-renders the page) - with
 * nothing but the bare icon, a tap on a slower connection looked like it
 * hadn't registered at all. useLinkStatus (Next.js's own per-Link pending
 * state) swaps the item's icon for a spinner for exactly as long as that
 * navigation is actually in flight, no manual state wiring needed.
 */
function ItemTabLink({
  href,
  icon,
  isActive,
  index,
  title,
  done,
  doneIcon,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  isActive: boolean;
  index: number;
  title: string;
  done: boolean;
  doneIcon: React.ReactNode;
  className: string;
}) {
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} className={className}>
      {done ? doneIcon : <PendingIcon icon={icon} />}
      <span className="text-muted-foreground/70 tabular-nums">{index + 1}.</span>
      {title}
    </Link>
  );
}

export { ItemTabLink };

"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

/**
 * Shows a small spinner in place of the item's icon while this specific
 * Link's navigation is pending - must be a child of <Link>, that's what
 * useLinkStatus requires. `icon` is an already-rendered element (e.g.
 * `<PlayCircle ... />`), not a bare component reference - a Server
 * Component can't pass a component function/forwardRef object as a prop to
 * a Client Component (React Flight can't serialize it: "Only plain objects
 * can be passed... Classes or other objects with methods are not
 * supported"), but it can pass JSX it already rendered, same as `doneIcon`
 * below.
 */
function PendingIcon({ icon }: { icon: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) return <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />;
  return icon;
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
  showIndex = true,
}: {
  href: string;
  /** Pre-rendered by the caller (a Server Component) - see PendingIcon's comment on why this can't be a bare component reference. */
  icon: React.ReactNode;
  isActive: boolean;
  index: number;
  title: string;
  done: boolean;
  doneIcon: React.ReactNode;
  className: string;
  /** The numbered prefix ("1.") suits a tab strip; a segmented control reads better without it. */
  showIndex?: boolean;
}) {
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} className={className}>
      {done ? doneIcon : <PendingIcon icon={icon} />}
      {showIndex && <span className="text-muted-foreground/70 tabular-nums">{index + 1}.</span>}
      {title}
    </Link>
  );
}

export { ItemTabLink };

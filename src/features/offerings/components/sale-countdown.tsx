"use client";

import * as React from "react";
import { Flame } from "lucide-react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Ticks down to a real, server-provided `endsAt` timestamp (Offering.saleEndsAt) -
 * not a per-visit fake countdown. Renders nothing once it passes; the price
 * itself (computed server-side via getOfferingPricing, same source of truth)
 * has already reverted by then, so there's nothing left to claim here.
 *
 * `label` defaults to the pricing-page framing ("Offer price ends in") but
 * is overridable - the pre-enrolled-student banner on the learning overview
 * page (my-learning-view.tsx) reuses this exact ticking logic with "Official
 * launch in" instead, since that's a different true fact about the same
 * deadline, not a second countdown to build.
 */
function SaleCountdown({ endsAt, className, label = "Offer price ends in" }: { endsAt: string; className?: string; label?: string }) {
  const target = React.useMemo(() => new Date(endsAt).getTime(), [endsAt]);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    const tick = () => {
      const next = target - Date.now();
      if (next <= 0) {
        setExpired(true);
        return;
      }
      setRemaining(next);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // Renders the icon + label immediately (identical on server and first
  // client render - remaining starts null both places, no hydration
  // mismatch) instead of the old "return null until the first tick", which
  // popped this whole badge into existence about a second after paint -
  // measured as a real, reproducible layout shift (PageSpeed CLS) on every
  // visit, in all three places this badge appears on the course page. The
  // caller only ever renders this component once the server has already
  // confirmed `endsAt` is in the future (see course-detail-view.tsx), so
  // `expired` only has to handle the rarer case of the deadline passing
  // *during* an active visit - an acceptable one-time collapse, not the
  // common-path shift this fix removes.
  if (expired) return null;

  return (
    <span className={className}>
      <Flame className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
      {remaining != null ? ` ${formatRemaining(remaining)}` : ""}
    </span>
  );
}

export { SaleCountdown };

"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MAX_WAIT_MS = 20_000;

/**
 * Instant feedback for every in-app link click inside the portal. Next.js
 * navigations are server round-trips, and with nothing visible changing in
 * the gap a tap felt like it hadn't registered. Instead of wiring a pending
 * state into each of the dozens of <Link>s (sidebar, curriculum, lesson
 * pager, cards...), one capture-phase listener does it for all of them:
 *
 *   - a thin progress bar runs across the top until the URL changes, and
 *   - the clicked link gets `data-navigating`, which globals.css dims and
 *     marks as busy, so the exact thing you pressed visibly reacts.
 *
 * "Done" is the pathname/search params changing (the new page committed);
 * a timeout clears it if a navigation never lands (e.g. an error page).
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentKey = `${pathname}?${searchParams.toString()}`;
  // The URL the page was on when a click started navigating. The bar is "on"
  // exactly while that is still the current URL - when the new route commits,
  // currentKey changes and it switches off with no effect-driven setState.
  const [startedFrom, setStartedFrom] = React.useState<string | null>(null);
  const [seenKey, setSeenKey] = React.useState(currentKey);
  // Route committed: drop the pending marker during render, so coming back to
  // this same URL later can't resurrect a stale bar.
  if (seenKey !== currentKey) {
    setSeenKey(currentKey);
    setStartedFrom(null);
  }
  const active = startedFrom !== null && startedFrom === currentKey;
  const currentKeyRef = React.useRef(currentKey);
  const activeLinkRef = React.useRef<HTMLAnchorElement | null>(null);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  // The new route committed (or we gave up) - clear the clicked link's busy state.
  React.useEffect(() => {
    currentKeyRef.current = currentKey;
    window.clearTimeout(timeoutRef.current);
    activeLinkRef.current?.removeAttribute("data-navigating");
    activeLinkRef.current = null;
  }, [currentKey]);

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (incl. in-page #anchors) won't trigger a navigation, so don't start a bar that never ends.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      activeLinkRef.current?.removeAttribute("data-navigating");
      anchor.setAttribute("data-navigating", "true");
      activeLinkRef.current = anchor;
      setStartedFrom(currentKeyRef.current);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        activeLinkRef.current?.removeAttribute("data-navigating");
        activeLinkRef.current = null;
        setStartedFrom(null);
      }, MAX_WAIT_MS);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-hidden={!active}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
      style={{ opacity: active ? 1 : 0, transition: "opacity 200ms ease-out" }}
    >
      {active && <div className="nav-progress-bar bg-primary h-full w-full" />}
    </div>
  );
}

function NavigationProgress() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressInner />
    </React.Suspense>
  );
}

export { NavigationProgress };

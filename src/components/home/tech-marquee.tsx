"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

import { TECH_LOGOS } from "./tech-logos";

const SPEED_PX_PER_SECOND = 42;

function Logos({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-x-12 pr-12 sm:gap-x-20 sm:pr-20"
    >
      {TECH_LOGOS.map((logo) => (
        <li
          key={logo.name}
          className="text-foreground/55 flex shrink-0 items-center gap-3 whitespace-nowrap transition-colors duration-300 hover:text-[var(--logo-color)]"
          style={{ "--logo-color": logo.color } as React.CSSProperties}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="size-6 shrink-0 sm:size-8"
          >
            <path d={logo.path} />
          </svg>
          <span className="text-base font-semibold tracking-tight sm:text-xl">{logo.name}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Seamless horizontal logo marquee, tuned not to lag on phones:
 *  - motion is a single compositor-friendly transform (translate3d) on one
 *    element - no layout or paint work per frame;
 *  - the loop width is measured once (and on resize), never read per frame;
 *  - the animation loop only runs while the strip is on screen AND the tab is
 *    visible, so it costs nothing while you read the rest of the page;
 *  - frame time is clamped, so returning to the tab never makes it jump.
 * It is JS-driven (not a CSS animation) so it still moves where the OS asks
 * for reduced motion - the site's global rule freezes CSS animations. A
 * visible pause button keeps it accessible, and it also pauses on hover.
 */
function TechMarquee() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const hoverRef = React.useRef(false);
  const [paused, setPaused] = React.useState(false);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    let offset = 0;
    let half = track.scrollWidth / 2;
    let last = 0;
    let frame = 0;
    let onScreen = false;
    let tabVisible = document.visibilityState === "visible";

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 50) / 1000 : 0;
      last = now;
      if (!pausedRef.current && !hoverRef.current && half > 0) {
        offset = (offset + SPEED_PX_PER_SECOND * dt) % half;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = onScreen && tabVisible;
      if (shouldRun && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      half = track.scrollWidth / 2;
    });
    ro.observe(track);

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      <div
        ref={wrapRef}
        className="home-marquee-mask relative min-w-0 flex-1 overflow-hidden py-1"
        role="group"
        aria-label="Technologies we build with"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        onFocus={() => (hoverRef.current = true)}
        onBlur={() => (hoverRef.current = false)}
      >
        <div ref={trackRef} className="flex w-max transform-gpu will-change-transform">
          <Logos />
          <Logos hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play technology logos animation" : "Pause technology logos animation"}
        className="text-muted-foreground hover:text-foreground border-border/70 hover:border-foreground/30 flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors"
      >
        {paused ? (
          <Play className="size-3.5" aria-hidden="true" />
        ) : (
          <Pause className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export { TechMarquee };

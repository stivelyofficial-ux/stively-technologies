"use client";

import * as React from "react";
import { ListTree, PanelLeftClose, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface OutlineState {
  /** Desktop: the outline column is shown. Mobile: the drawer is open. */
  visible: boolean;
  toggle: () => void;
  close: () => void;
}

const OutlineContext = React.createContext<OutlineState | null>(null);

function useOutline(): OutlineState {
  const ctx = React.useContext(OutlineContext);
  if (!ctx) throw new Error("useOutline must be used inside PlayerShell");
  return ctx;
}

/**
 * The course player's two-pane frame: a collapsible course outline and the
 * scrolling lesson area. At lg+ the outline is a static column (shown by
 * default, hideable); below lg it becomes an off-canvas drawer over a scrim,
 * closed by default, so a phone gets the whole screen for the lesson. The
 * outline and the lesson are server-rendered and passed in - this owns only
 * the show/hide mechanic.
 */
function PlayerShell({
  outline,
  children,
}: {
  outline: React.ReactNode;
  children: React.ReactNode;
}) {
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Close the drawer with Escape; lock nothing else - the lesson area stays scrollable behind the scrim.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const state = React.useMemo<OutlineState>(
    () => ({
      // `visible` is read by the toggle pill; on desktop it reflects the column, on mobile the drawer.
      visible: desktopOpen,
      toggle: () => {
        if (window.matchMedia("(min-width: 1024px)").matches) setDesktopOpen((v) => !v);
        else setDrawerOpen((v) => !v);
      },
      close: () => {
        setDrawerOpen(false);
      },
    }),
    [desktopOpen]
  );

  return (
    <OutlineContext.Provider value={state}>
      <div className="relative flex min-h-0 flex-1">
        {/* Desktop column */}
        <aside
          className={cn(
            "border-border bg-background hidden w-[340px] shrink-0 flex-col border-r",
            desktopOpen && "lg:flex"
          )}
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="text-muted-foreground text-[13px] font-semibold">Course content</span>
            <button
              type="button"
              onClick={() => setDesktopOpen(false)}
              aria-label="Hide course outline"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            >
              <PanelLeftClose className="size-5" aria-hidden="true" />
            </button>
          </div>
          {outline}
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <>
            <button
              type="button"
              aria-label="Close course outline"
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            />
            <aside className="bg-background border-border fixed inset-y-0 left-0 z-50 flex w-[min(340px,88vw)] flex-col border-r shadow-2xl lg:hidden">
              <div className="flex items-center justify-between px-5 pt-5">
                <span className="text-muted-foreground text-[13px] font-semibold">
                  Course content
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close course outline"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              {outline}
            </aside>
          </>
        )}

        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </OutlineContext.Provider>
  );
}

/** The "Course outline" pill - always shown on mobile, and on desktop only while the column is hidden. */
function OutlineToggle() {
  const { visible, toggle } = useOutline();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "border-border bg-card text-foreground hover:border-primary hover:text-primary items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
        visible ? "flex lg:hidden" : "flex"
      )}
    >
      <ListTree className="size-4" aria-hidden="true" />
      Course outline
    </button>
  );
}

export { PlayerShell, OutlineToggle, useOutline };

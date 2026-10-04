"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { SearchDialog } from "@/components/dashboard-shell/search/search-dialog";

/**
 * Renders as a fake, inert-looking input that actually opens SearchDialog
 * on click - the Linear/Vercel/GitHub convention (a search "field" in the
 * topbar is really a button). Also owns the global ⌘K/Ctrl+K shortcut,
 * since this is the one place on every dashboard page that shortcut
 * should be registered.
 */
function SearchBar() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="border-border bg-card text-muted-foreground hover:border-primary/40 flex h-11 w-full max-w-[260px] items-center gap-2.5 rounded-full border px-3.5 text-sm transition-colors duration-150 ease-out"
      >
        <Search className="size-[18px] shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left">Search courses…</span>
        <kbd className="border-border text-muted-foreground hidden shrink-0 rounded-md border px-1.5 py-px text-xs sm:inline-block">
          ⌘K
        </kbd>
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export { SearchBar };

"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeft, MessageCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Desktop three-column shell for the lesson player - collapsible course
 * sidebar on the left, the lesson itself in the middle, a collapsible AI
 * Tutor + Notes panel on the right (reference: the Figma-style learning-page
 * design review, 2026-09-30). Both sides are plain server-rendered content
 * passed in as props; this component only owns the show/hide mechanic, so
 * CourseSidebar and LessonAssistantPanel stay Server Components.
 *
 * Mobile is untouched by this shell - the page's own CourseNavDrawer still
 * handles the course-content drawer there, and the assistant panel renders
 * inline below the lesson content (mobileAssistant) rather than as a third
 * collapsible column, which would be cramped on a phone.
 */
function LessonPanelsShell({
  sidebar,
  assistantPanel,
  mobileAssistant,
  children,
}: {
  sidebar: React.ReactNode;
  assistantPanel: React.ReactNode;
  mobileAssistant: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [assistantOpen, setAssistantOpen] = React.useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-border/70 hidden items-center gap-1 border-b px-3 py-1.5 lg:flex">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Hide course content" : "Show course content"}
          aria-pressed={sidebarOpen}
        >
          {sidebarOpen ? <PanelLeftClose className="size-4" aria-hidden="true" /> : <PanelLeft className="size-4" aria-hidden="true" />}
        </Button>
        <span className="flex-1" />
        <Button
          variant={assistantOpen ? "secondary" : "ghost"}
          size="icon"
          className="size-8"
          onClick={() => setAssistantOpen((v) => !v)}
          aria-label={assistantOpen ? "Hide AI Tutor & notes" : "Show AI Tutor & notes"}
          aria-pressed={assistantOpen}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 lg:flex-row">
        {sidebarOpen && (
          <aside className="border-border/70 hidden w-[300px] shrink-0 border-r lg:block xl:w-[340px]">
            <div className="sticky top-0 h-[calc(100vh-4rem-41px)]">{sidebar}</div>
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {children}
          <div className="lg:hidden">{mobileAssistant}</div>
        </div>

        {assistantOpen && (
          <aside className={cn("border-border/70 hidden w-[320px] shrink-0 border-l lg:flex lg:flex-col")}>
            <div className="border-border/70 flex items-center justify-between border-b px-3 py-1.5">
              <span className="text-muted-foreground text-xs font-medium">Assistant</span>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setAssistantOpen(false)} aria-label="Close">
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">{assistantPanel}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export { LessonPanelsShell };

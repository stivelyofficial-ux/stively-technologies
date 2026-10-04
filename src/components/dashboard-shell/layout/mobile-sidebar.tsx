"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { NavItem } from "@/components/dashboard-shell/layout/nav-item";
import type { NavigationConfig } from "@/config/navigation";

export interface MobileSidebarProps {
  navigation: NavigationConfig;
}

/**
 * The same NavigationConfig, the same NavItem renderer as Sidebar - only
 * the chrome around it differs (a Sheet drawer instead of a persistent
 * column), per this phase's "never duplicate dashboard layouts" rule.
 * Shown below `lg`, where Sidebar (layout/sidebar.tsx) hides itself.
 */
function MobileSidebar({ navigation }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <div className="flex h-[76px] shrink-0 items-center border-b px-6">
          <Logo />
        </div>
        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
          aria-label="Dashboard"
        >
          {navigation.map((section, index) => (
            <div key={section.title ?? `section-${index}`} className="flex flex-col gap-0.5">
              {section.title && (
                <p className="text-muted-foreground px-3.5 pt-5 pb-2 text-xs font-semibold tracking-[0.08em] uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <NavItem
                  key={item.href + item.label}
                  item={item}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="border-border border-t">
          <SheetClose asChild>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground flex items-center gap-3 px-6 py-5 text-[15px] transition-colors duration-150 ease-out"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to site
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileSidebar };

import Link from "next/link";

import { BookCallButton } from "@/components/shared/book-call-button";
import { Button } from "@/components/ui/button";

/**
 * The standard pair of hero buttons for the business pages: book a call
 * (config/booking.ts) plus a secondary action - "Start a project" by default.
 */
function HeroActions({
  secondary = { label: "Start a project", href: "/start-project" },
  location = "hero",
}: {
  secondary?: { label: string; href: string } | null;
  location?: "hero" | "cta" | "other";
}) {
  return (
    <>
      <BookCallButton location={location} size="lg" className="sm:w-auto [&_a]:h-12 [&_a]:px-7" />
      {secondary && (
        <Button size="lg" variant="outline" asChild className="h-12 px-7">
          <Link href={secondary.href}>{secondary.label}</Link>
        </Button>
      )}
    </>
  );
}

export { HeroActions };

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/container";

/** Training is a secondary path: one quiet line near the bottom, not a section. */
function TrainingStrip() {
  return (
    <div className="border-border/60 border-y">
      <Container className="flex flex-col items-start justify-between gap-2 py-5 sm:flex-row sm:items-center">
        <span className="text-muted-foreground text-sm">Looking to learn instead?</span>
        <Link
          href="/training"
          className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        >
          Explore training <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </div>
  );
}

export { TrainingStrip };

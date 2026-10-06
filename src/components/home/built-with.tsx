import { Container } from "@/components/shared/container";
import { TechMarquee } from "./tech-marquee";

/**
 * "The stack we build with" - the tools Stively's own platform and client
 * work actually run on, shown as a logo marquee. Deliberately NOT "trusted
 * by" client logos: no client has agreed to be named, and BRAND_PRINCIPLES
 * #6 bars implying endorsements.
 */
function BuiltWith() {
  return (
    <div className="border-border/60 border-y">
      <Container className="flex flex-col gap-5 py-9 lg:flex-row lg:items-center lg:gap-12">
        <span className="text-muted-foreground shrink-0 font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
          The stack we build with
        </span>
        <TechMarquee />
      </Container>
    </div>
  );
}

export { BuiltWith };

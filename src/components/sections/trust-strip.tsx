import { ShieldCheck, Eye, Users, FileCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

interface TrustPoint {
  icon: LucideIcon;
  label: string;
}

const TRUST_POINTS: TrustPoint[] = [
  { icon: Users, label: "Every developer trained and evaluated first" },
  { icon: Eye, label: "You see the plan and progress, no black box" },
  { icon: ShieldCheck, label: "Direct access to the people building it" },
  { icon: FileCheck, label: "NDA on request, before any details are shared" },
];

/**
 * Four real, verifiable claims about how Stively operates - deliberately NOT
 * client logos or stats, none of which exist to show honestly (see
 * BRAND_PRINCIPLES #6). A quiet band right under a business page's hero.
 */
function TrustStrip() {
  return (
    <div className="border-border/60 border-y">
      <Container className="grid grid-cols-1 gap-x-8 gap-y-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((point, index) => (
          <Reveal key={point.label} delay={index * 60}>
            <div className="flex items-start gap-3">
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <point.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-foreground pt-2 text-sm leading-snug font-medium">
                {point.label}
              </span>
            </div>
          </Reveal>
        ))}
      </Container>
    </div>
  );
}

export { TrustStrip };

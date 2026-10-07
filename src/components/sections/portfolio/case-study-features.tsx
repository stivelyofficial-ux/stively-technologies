import { Sparkles } from "lucide-react";

import { Container } from "@/components/shared/container";
import { FeatureCards } from "@/components/biz/feature-cards";
import { SectionHeading } from "@/components/home/section-heading";

interface Feature {
  title: string;
  description: string;
}

/** Feature-highlight grid - only rendered by the caller when `features` is non-empty. */
function CaseStudyFeatures({ features }: { features: Feature[] }) {
  return (
    <Container className="flex flex-col gap-10">
      <SectionHeading eyebrow="Feature highlights" title="What it can do" />
      <FeatureCards items={features.map((f) => ({ ...f, icon: Sparkles }))} />
    </Container>
  );
}

export { CaseStudyFeatures };

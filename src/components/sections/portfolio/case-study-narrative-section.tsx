import { Eyebrow } from "@/components/shared/eyebrow";

/** Challenge / Solution card - same layout, different content, so one component. Only rendered by the caller when the field is present. */
function CaseStudyNarrativeSection({
  eyebrow,
  heading,
  body,
}: {
  eyebrow: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="border-border/70 bg-card flex h-full flex-col gap-4 rounded-3xl border p-8 shadow-[0_1px_2px_rgba(18,32,92,0.04)] sm:p-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
        {heading}
      </h2>
      <p className="text-muted-foreground text-base leading-relaxed text-pretty whitespace-pre-line sm:text-lg">
        {body}
      </p>
    </div>
  );
}

export { CaseStudyNarrativeSection };

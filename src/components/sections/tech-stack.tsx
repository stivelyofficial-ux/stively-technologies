import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/home/section-heading";

const TECH_GROUPS: { label: string; items: string[] }[] = [
  { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { label: "Backend", items: ["Node.js", "Prisma", "PostgreSQL"] },
  { label: "Cloud & Infrastructure", items: ["Vercel", "AWS"] },
  { label: "Mobile", items: ["React Native"] },
];

/**
 * Genuinely honest, not aspirational - this is literally the stack Stively's
 * own platform is built on, plus the adjacent technologies a team working in
 * this stack would reasonably offer (React Native, AWS). Nothing here is a
 * claim we can't back.
 */
function TechStack() {
  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeading
          eyebrow="Stack"
          title="Technology we build with"
          description="Modern, widely used tools, chosen for your problem rather than our habits."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {TECH_GROUPS.map((group) => (
            <div
              key={group.label}
              className="border-border/70 bg-card flex flex-col gap-4 rounded-3xl border p-7 shadow-[0_1px_2px_rgba(18,32,92,0.04)]"
            >
              <h3 className="text-muted-foreground font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-border bg-muted/50 text-foreground rounded-full border px-4 py-1.5 text-sm font-semibold"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export { TechStack };

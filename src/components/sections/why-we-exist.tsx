import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/home/section-heading";

/** The "why Stively exists" story: heading on the left, the three paragraphs on the right. */
function WhyWeExist() {
  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeading eyebrow="Our story" title="Why Stively exists" />
        <div className="flex flex-col gap-5">
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            Businesses that need real software built usually end up choosing between two bad
            options: a traditional agency, priced and paced for enterprise budgets, or a freelancer
            marketplace, where quality is a gamble and there&apos;s no one to hold accountable when
            it goes wrong.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            Neither gives you what you actually need - a team you can trust, a process you can see,
            and software built by people who&apos;ve already proven they can do the work, not people
            learning on your dime.
          </p>
          <p className="text-foreground text-lg leading-relaxed font-medium text-pretty">
            Stively exists to be that middle path: a real software company, built around a trained,
            evaluated team and a process where every project is reviewed before it reaches you - not
            an afterthought bolted onto something else.
          </p>
        </div>
      </Container>
    </Section>
  );
}

export { WhyWeExist };

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { FOUNDER } from "@/config/team";

/** The founder, in a card: initials avatar, name, role and the principles behind the company. */
function FounderNote() {
  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container>
        <div className="border-border/70 bg-card grid gap-8 rounded-[32px] border p-8 shadow-[0_1px_2px_rgba(18,32,92,0.04)] sm:p-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-14">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>Founder</Eyebrow>
            {FOUNDER.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- small fixed-size portrait from /public
              <img
                src={FOUNDER.photo}
                alt={`${FOUNDER.name}, ${FOUNDER.role}`}
                width={96}
                height={96}
                className="size-24 rounded-3xl object-cover"
              />
            ) : (
              <span className="from-primary/20 to-primary/5 text-primary font-display flex size-24 items-center justify-center rounded-3xl bg-linear-to-br text-3xl font-semibold">
                AK
              </span>
            )}
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{FOUNDER.name}</h2>
              <p className="text-muted-foreground text-sm font-medium">{FOUNDER.role}</p>
              {FOUNDER.linkedin && (
                <a
                  href={FOUNDER.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-1 text-sm font-semibold hover:underline"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
          <p className="text-muted-foreground self-center text-lg leading-relaxed text-pretty">
            Abhijit Karande founded Stively to build software the way it should be built - by a
            software engineer&apos;s standard, not an agency&apos;s. He set the principles the team
            builds against: developers trained and evaluated before they touch client work, every
            project reviewed before it ships, and a transparent process instead of a black box.
          </p>
        </div>
      </Container>
    </Section>
  );
}

export { FounderNote };

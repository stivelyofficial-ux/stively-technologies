import { TEAM, TEAM_LOCATION_LINE, type TeamMemberData } from "@/config/team";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "./section-heading";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** One person: photo (or initials), name, role, one real line of background, optional LinkedIn. */
function TeamMember({ member }: { member: TeamMemberData }) {
  return (
    <article className="border-border/70 bg-card flex flex-col items-start gap-4 rounded-3xl border p-6">
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small, fixed-size avatar from /public
        <img
          src={member.photo}
          alt={`${member.name}, ${member.role}`}
          className="size-20 rounded-2xl object-cover"
          width={80}
          height={80}
        />
      ) : (
        <span className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-2xl text-xl font-semibold">
          {initials(member.name)}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-semibold tracking-tight">{member.name}</h3>
        <span className="text-primary text-sm font-medium">{member.role}</span>
        <p className="text-muted-foreground mt-1 text-sm text-pretty">{member.bio}</p>
      </div>
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm font-semibold hover:underline"
        >
          LinkedIn
        </a>
      )}
    </article>
  );
}

/** The people behind Stively. Renders nothing until config/team.ts has real entries - no invented bios or placeholder photos. */
function TeamSection({ compact = false }: { compact?: boolean }) {
  if (TEAM.length === 0) return null;

  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="The team"
          title={compact ? "Talk to the people building it" : "Meet the team"}
          description={TEAM_LOCATION_LINE || undefined}
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <li key={member.name}>
              <TeamMember member={member} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { TeamSection, TeamMember };

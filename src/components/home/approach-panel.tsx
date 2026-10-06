import { BadgeCheck, Cpu, GraduationCap, Rocket } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Trained and evaluated",
    text: "Every developer is trained on real project work and evaluated before touching yours.",
  },
  {
    icon: GraduationCap,
    title: "Practical experience",
    text: "Our team builds on client-style projects, not toy exercises.",
  },
  {
    icon: Cpu,
    title: "Modern tech stack",
    text: "Current, maintainable tools chosen for your problem, not our habits.",
  },
  {
    icon: Rocket,
    title: "Support after launch",
    text: "A support period is included, and we stay available beyond it.",
  },
] as const;

/** The dark inset panel: the company thesis plus four proof pillars. */
function ApproachPanel() {
  return (
    <section className="pb-16 md:pb-20">
      <Container>
        <Reveal>
          <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 700px 420px at 100% 0%, oklch(0.541 0.216 265.75 / 0.32), transparent 60%)," +
                  "radial-gradient(ellipse 600px 420px at 0% 100%, oklch(0.746 0.127 200.01 / 0.14), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col gap-3">
              <span className="text-ink-muted-foreground font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
                Our approach
              </span>
              <h2 className="font-display max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl">
                More than just development
              </h2>
              <p className="text-ink-muted-foreground max-w-2xl text-base text-pretty sm:text-lg">
                We train and evaluate our own developers, then put them on your project - so you get
                a team that has built before, with a plan you can see.
              </p>
            </div>

            <ul className="relative mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((pillar) => (
                <li key={pillar.title} className="bg-ink flex flex-col gap-4 p-6 sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white/[0.06] text-[#7da2ff] ring-1 ring-white/10">
                    <pillar.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold">{pillar.title}</h3>
                    <p className="text-ink-muted-foreground text-sm leading-relaxed">
                      {pillar.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export { ApproachPanel };

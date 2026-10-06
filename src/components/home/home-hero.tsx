import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { BookCallButton } from "@/components/shared/book-call-button";
import { Button } from "@/components/ui/button";
import { HeroScene } from "./hero-scene";

/**
 * Stats row = real operating facts, not invented metrics (BRAND_PRINCIPLES
 * #6: no fabricated proof). Each is something Stively commits to on every
 * engagement and says elsewhere on the site.
 */
const FACTS = [
  { value: "Free", label: "First consultation" },
  { value: "Fixed", label: "Written estimate before work" },
  { value: "NDA", label: "On request, before details" },
] as const;

function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* canvas: wash + grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 8% -10%, oklch(0.541 0.216 265.75 / 0.10), transparent 60%)," +
            "radial-gradient(ellipse 800px 600px at 95% 15%, oklch(0.62 0.18 300 / 0.12), transparent 60%)",
        }}
      />
      <div aria-hidden="true" className="home-grid absolute inset-0 -z-10" />

      <Container className="grid items-center gap-12 pt-10 pb-16 md:pt-12 md:pb-20 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:py-10">
        <div className="flex flex-col items-start gap-6">
          <span className="border-primary/15 bg-primary/[0.07] text-primary inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
            <span className="bg-primary size-1.5 rounded-full" />
            Websites &amp; custom software for businesses
          </span>

          <h1 className="font-display text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
            Ideas into
            <br />
            Real <span className="text-primary">Software</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty sm:text-xl">
            Websites and software that bring you customers, built by a trained team. Fixed price.
            Visible progress at every stage. You talk directly to the people building it.
          </p>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <BookCallButton
                location="hero"
                size="lg"
                className="sm:w-auto [&_a]:h-13 [&_a]:px-8 [&_a]:text-base"
              />
              <Button size="lg" variant="outline" asChild className="h-13 px-8 text-base">
                <Link href="/start-project">Start a project</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              20 minutes. No pitch. We&apos;ll tell you honestly if we&apos;re a fit.{" "}
              <Link
                href="/process"
                className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
              >
                See our process <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>

          <dl className="border-border/70 mt-1 grid w-full max-w-xl grid-cols-3 gap-6 border-t pt-6">
            {FACTS.map((fact, i) => (
              <div
                key={fact.value}
                className={`flex flex-col gap-1 ${i > 0 ? "border-border/70 border-l pl-6" : ""}`}
              >
                <dt className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                  {fact.value}
                </dt>
                <dd className="text-muted-foreground text-xs leading-snug sm:text-sm">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroScene />
      </Container>
    </section>
  );
}

export { HomeHero };

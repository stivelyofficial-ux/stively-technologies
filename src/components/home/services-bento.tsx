import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SERVICES } from "@/lib/services-data";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

/** The six capability areas, from the same SERVICES list /services uses (single source of truth). */
function ServicesBento() {
  return (
    <Section
      id="services"
      className="bg-muted/40 border-border/60 border-y py-16 md:py-20 lg:py-24"
    >
      <Container className="flex flex-col gap-12 lg:gap-14">
        <SectionHeading
          eyebrow="Also available"
          title="More of what we build"
          description="Six capability areas, one engineering standard across all of them."
          action={
            <Button variant="outline" asChild>
              <Link href="/services">
                View all services <ArrowRight />
              </Link>
            </Button>
          }
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <li key={service.title}>
              <Reveal delay={index * 60} className="h-full">
                <Link
                  href="/services"
                  className="group border-border/70 bg-card hover:border-primary/30 relative flex h-full flex-col gap-5 rounded-3xl border p-7 shadow-[0_1px_2px_rgba(18,32,92,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(43,89,230,0.35)]"
                >
                  <span className="bg-primary/10 text-primary group-hover:bg-primary flex size-12 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:text-white">
                    <service.icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-[15px] leading-relaxed text-pretty">
                      {service.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-primary absolute top-7 right-7 size-5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { ServicesBento };

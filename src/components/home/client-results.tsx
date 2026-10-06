import { Quote } from "lucide-react";

import { CLIENT_RESULTS } from "@/config/client-results";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "./section-heading";

/** Real client case studies (config/client-results.ts). Renders NOTHING while the list is empty - no heading, no gap. */
function ClientResults() {
  if (CLIENT_RESULTS.length === 0) return null;

  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Client results"
          title="What we have delivered"
          description="Real projects for real businesses."
        />
        <ul className="grid gap-6 md:grid-cols-2">
          {CLIENT_RESULTS.map((result, index) => (
            <li key={result.clientName}>
              <Reveal delay={index * 70} className="h-full">
                <article className="border-border/70 bg-card flex h-full flex-col gap-5 rounded-3xl border p-8">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {result.clientName}
                    </h3>
                    <span className="text-muted-foreground text-sm">{result.industry}</span>
                  </div>
                  <dl className="flex flex-col gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Problem
                      </dt>
                      <dd>{result.problem}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        What we built
                      </dt>
                      <dd>{result.whatWeBuilt}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Result
                      </dt>
                      <dd className="font-medium">{result.result}</dd>
                    </div>
                  </dl>
                  {result.quote && (
                    <blockquote className="bg-muted mt-auto flex gap-3 rounded-2xl p-4 text-sm">
                      <Quote className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <div className="flex flex-col gap-1">
                        <p className="text-pretty">{result.quote.text}</p>
                        <footer className="text-muted-foreground text-xs">
                          {result.quote.author}
                          {result.quote.role ? `, ${result.quote.role}` : ""}
                        </footer>
                      </div>
                    </blockquote>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { ClientResults };

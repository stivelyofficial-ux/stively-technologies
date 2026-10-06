import Link from "next/link";
import { ArrowRight, Eye, FileCheck, Handshake, Wallet } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "./section-heading";

/** Only commitments that are already true and written down (Terms of Service, Refund Policy, SOP). */
const ITEMS = [
  {
    icon: Wallet,
    title: "A fixed estimate you approve first",
    text: "You see the scope, timeline and price in writing before any work starts. Changes are quoted before they are built.",
  },
  {
    icon: FileCheck,
    title: "NDA on request",
    text: "Sign before any details are shared - standard, not an extra.",
  },
  {
    icon: Eye,
    title: "Visible progress at every stage",
    text: "Regular check-ins and a clear view of what is done and what is next, in plain language.",
  },
  {
    icon: Handshake,
    title: "Support after launch",
    text: "Every package includes a support period, and we stay available beyond it.",
  },
] as const;

function RiskReduction() {
  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-12 lg:gap-14">
        <SectionHeading
          eyebrow="Our commitments"
          title="How we reduce your risk"
          description="Hiring a new company is a risk. Here is what we do about it."
          action={
            <Link
              href="/legal/refund-policy"
              className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              Read our refund policy <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <ul className="border-border/70 bg-border/70 grid gap-px overflow-hidden rounded-3xl border sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, index) => (
            <li key={item.title} className="bg-card">
              <Reveal delay={index * 50} className="h-full">
                <div className="flex h-full flex-col gap-4 p-7">
                  <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { RiskReduction };

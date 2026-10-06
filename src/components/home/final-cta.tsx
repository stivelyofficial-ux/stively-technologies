import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { BookCallButton } from "@/components/shared/book-call-button";
import { Button } from "@/components/ui/button";
import { WhatsAppTrackedLink } from "./whatsapp-tracked-link";

/** Closing ask: book a call first, WhatsApp as the fast alternative. */
function FinalCta() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <Reveal>
          <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-7 py-16 sm:px-14 sm:py-20 lg:px-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 800px 460px at 100% 100%, oklch(0.541 0.216 265.75 / 0.5), transparent 60%)," +
                  "radial-gradient(ellipse 600px 400px at 0% 0%, oklch(0.62 0.18 300 / 0.2), transparent 60%)",
              }}
            />
            <div className="relative flex max-w-2xl flex-col gap-6">
              <span className="text-ink-muted-foreground font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
                Let&apos;s build together
              </span>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                Have a project in mind?
              </h2>
              <p className="text-ink-muted-foreground max-w-xl text-lg text-pretty">
                Tell us what you want to build. We reply with a clear plan and a fixed estimate -
                free consultation, no obligation.
              </p>
              <div className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookCallButton
                    location="footer"
                    variant="inverse"
                    size="lg"
                    className="[&_a]:h-13 [&_a]:px-8 [&_a]:text-base"
                  />
                  <Button
                    size="lg"
                    variant="outline-inverse"
                    asChild
                    className="h-13 px-8 text-base"
                  >
                    <WhatsAppTrackedLink href={getWhatsAppUrl("/")}>
                      <MessageCircle /> WhatsApp us
                    </WhatsAppTrackedLink>
                  </Button>
                </div>
                <p className="text-ink-muted-foreground text-sm">
                  20 minutes. No pitch. We&apos;ll tell you honestly if we&apos;re a fit. Prefer a
                  form?{" "}
                  <Link
                    href="/start-project"
                    className="text-ink-foreground font-semibold underline"
                  >
                    Start a project
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export { FinalCta };

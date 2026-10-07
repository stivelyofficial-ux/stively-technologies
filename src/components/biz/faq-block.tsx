import { ChevronDown } from "lucide-react";

import { JsonLd } from "@/components/shared/json-ld";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/home/section-heading";

export interface FaqBlockItem {
  question: string;
  answer: string;
}

/** FAQ in the homepage style (native <details>, no JS) with optional FAQPage structured data. */
function FaqBlock({
  items,
  title = "Questions we are often asked",
  description = "Straight answers. If yours is not here, ask on the call.",
  structuredData = true,
  muted = true,
}: {
  items: FaqBlockItem[];
  title?: string;
  description?: string;
  structuredData?: boolean;
  muted?: boolean;
}) {
  return (
    <Section
      className={
        muted
          ? "bg-muted/40 border-border/60 border-y py-16 md:py-20 lg:py-24"
          : "py-16 md:py-20 lg:py-24"
      }
    >
      {structuredData && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }}
        />
      )}
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeading eyebrow="FAQ" title={title} description={description} />
        <ul className="flex flex-col gap-3">
          {items.map((faq) => (
            <li key={faq.question}>
              <details className="group border-border/70 bg-card rounded-2xl border px-6 py-4 open:shadow-[0_12px_30px_-18px_rgba(18,32,92,0.3)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="text-muted-foreground size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed text-pretty">
                  {faq.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { FaqBlock };

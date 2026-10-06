import { Check, Info } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { PRICING_ESTIMATE_NOTE, PRICING_TIERS } from "@/lib/pricing";
import { FOUNDING_OFFER } from "@/config/founding-offer";
import { Reveal } from "@/components/shared/reveal";
import { BookCallButton } from "@/components/shared/book-call-button";

/**
 * The pricing cards, shared by the homepage and /pricing so the tiers are
 * defined (lib/pricing.ts) and presented in exactly one place. Every price is
 * a "From" price, the top tier is custom scope, and each card says what it
 * does not include.
 */
function PricingGrid() {
  return (
    <div className="flex flex-col gap-8">
      {FOUNDING_OFFER.enabled && (
        <div className="border-primary/25 from-primary/[0.08] to-brand-teal/[0.06] flex flex-col items-start justify-between gap-4 rounded-2xl border bg-linear-to-r p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex flex-col gap-1">
            <span className="text-primary font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
              {FOUNDING_OFFER.headline}
            </span>
            <p className="text-foreground max-w-2xl text-[15px] text-pretty">
              {FOUNDING_OFFER.text}
            </p>
          </div>
          <BookCallButton location="banner" label={FOUNDING_OFFER.cta} variant="outline" />
        </div>
      )}

      <ul className="grid items-stretch gap-6 lg:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <li key={tier.name} className={cn(tier.highlighted && "lg:-my-4")}>
            <Reveal delay={index * 70} className="h-full">
              <article
                className={cn(
                  "relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border p-8",
                  tier.highlighted
                    ? "bg-ink text-ink-foreground border-transparent shadow-[0_40px_80px_-30px_rgba(43,89,230,0.55)]"
                    : "border-border/70 bg-card shadow-[0_1px_2px_rgba(18,32,92,0.04)]"
                )}
              >
                {tier.highlighted && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse 420px 260px at 100% 0%, oklch(0.541 0.216 265.75 / 0.4), transparent 60%)",
                      }}
                    />
                    <span className="bg-primary relative w-fit rounded-full px-3 py-1 text-xs font-semibold text-white">
                      Most chosen
                    </span>
                  </>
                )}

                <div className="relative flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p
                    className={cn(
                      "text-sm font-medium text-pretty",
                      tier.highlighted ? "text-brand-teal" : "text-primary"
                    )}
                  >
                    {tier.outcome}
                  </p>
                  <p className="font-display mt-1 text-4xl font-semibold tracking-[-0.03em] tabular-nums">
                    <span
                      className={cn(
                        "mr-1.5 text-base font-normal tracking-normal",
                        tier.highlighted ? "text-ink-muted-foreground" : "text-muted-foreground"
                      )}
                    >
                      From
                    </span>
                    {formatPrice(tier.priceInPaise)}
                  </p>
                  <p
                    className={cn(
                      "text-sm text-pretty",
                      tier.highlighted ? "text-ink-muted-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tier.description}
                  </p>
                </div>

                <div className="relative flex flex-col gap-3">
                  {tier.customScope && (
                    <span
                      className={cn(
                        "font-mono text-[11px] font-semibold tracking-[0.18em] uppercase",
                        tier.highlighted ? "text-ink-muted-foreground" : "text-muted-foreground"
                      )}
                    >
                      Typical inclusions
                    </span>
                  )}
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            tier.highlighted ? "text-brand-teal" : "text-primary"
                          )}
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {tier.scopeNote && (
                    <p
                      className={cn(
                        "flex items-start gap-2 rounded-xl p-3 text-xs",
                        tier.highlighted ? "bg-white/[0.06]" : "bg-muted"
                      )}
                    >
                      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      {tier.scopeNote}
                    </p>
                  )}
                </div>

                <details
                  className={cn(
                    "relative text-xs",
                    tier.highlighted ? "text-ink-muted-foreground" : "text-muted-foreground"
                  )}
                >
                  <summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
                    What&apos;s not included
                  </summary>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
                    {tier.notIncluded.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>

                <BookCallButton
                  location="pricing"
                  label={tier.ctaLabel ?? "Book a free call"}
                  variant={tier.highlighted ? "inverse" : "outline"}
                  size="lg"
                  className="relative mt-auto"
                />
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground text-center text-sm text-pretty">
        {PRICING_ESTIMATE_NOTE}
      </p>
    </div>
  );
}

export { PricingGrid };

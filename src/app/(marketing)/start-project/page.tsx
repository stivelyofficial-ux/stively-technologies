import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  FileCheck,
  LayoutDashboard,
  Lock,
  MessageCircle,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getFeaturedPortfolioItems } from "@/lib/queries/portfolio";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { StartProjectForm } from "@/components/forms/start-project-form";
import { Card } from "@/components/ui/card";

const TITLE = "Start Your Project - Get a Callback Today";
const DESCRIPTION =
  "Tell us what you're building and we'll call you back the same day. Real quotes you approve before we start, real payments through Razorpay, and a dashboard where you can track everything.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/start-project" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}/start-project`,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: TITLE,
    description: DESCRIPTION,
  },
  // Ad-landing page - not meant to rank organically or dilute /contact's
  // search equity, so it's excluded from the sitemap and from indexing.
  robots: { index: false, follow: true },
};

const STEPS = [
  {
    icon: Phone,
    title: "We call you",
    description: "Our team will reach out the same day to understand your needs.",
  },
  {
    icon: MessagesSquare,
    title: "Free 20-min discussion",
    description: "We discuss your goals, show relevant solutions and suggest the best approach.",
  },
  {
    icon: FileCheck,
    title: "Get a fixed quote",
    description: "You receive a clear proposal with timeline and cost. No hidden charges.",
  },
];

const VALUE_POINTS = [
  { icon: ShieldCheck, title: "No Hidden Fees", description: "Clear & upfront pricing" },
  { icon: Zap, title: "Direct Team Support", description: "Talk to real experts" },
  { icon: BarChart3, title: "On-Time Delivery", description: "Track progress in your dashboard" },
];

/**
 * Only things Stively actually does and can show - the founder's design mock
 * had client stats and a client testimonial in this band, but there are no
 * such numbers or quotes to back them yet (BRAND_PRINCIPLES #6: no fabricated
 * proof). These four are real, verifiable commitments instead.
 */
const COMMITMENTS = [
  { icon: FileCheck, label: "You approve the quote before anything starts" },
  { icon: CreditCard, label: "Secure payments through Razorpay" },
  { icon: LayoutDashboard, label: "Progress, chat and files in your own dashboard" },
  { icon: Lock, label: "NDA on request, before any details are shared" },
];

/**
 * Dedicated Google Ads landing page - a single, form-first page built for
 * paid traffic, not a variant of the Contact page (different intent: this
 * visitor is already sold, they just need a fast way to hand over details).
 * Dark ambient hero with the pitch and "what happens next" on the left and
 * the bright form card on the right (2026-10 redesign): the card reads as a
 * clear, high-contrast counter set against the dark canvas.
 */
export default async function StartProjectPage() {
  const [portfolioItems, session] = await Promise.all([getFeaturedPortfolioItems(3), auth()]);
  // Only a CLIENT's own email is worth prefilling here - anyone else logged
  // in (staff, a student account, etc.) has no reason to have their session
  // email attached to a new business inquiry.
  const defaultEmail =
    session?.user?.role === "CLIENT" ? (session.user.email ?? undefined) : undefined;
  const proof = portfolioItems[0];

  return (
    <>
      <Section
        background="inverted"
        className="texture-noise relative overflow-hidden pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-10 lg:pb-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 1000px 560px at 10% 0%, oklch(0.541 0.216 265.75 / 0.35), transparent 60%)," +
              "radial-gradient(ellipse 700px 520px at 55% -10%, oklch(0.58 0.19 232.9 / 0.28), transparent 55%)," +
              "radial-gradient(ellipse 760px 600px at 95% 60%, oklch(0.746 0.127 200.01 / 0.2), transparent 55%)",
          }}
        />
        <div
          aria-hidden="true"
          className="text-ink-foreground/[0.05] bg-dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
        />

        <Container className="relative grid items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12">
          {/* order-2/order-1 puts the form first on mobile - a paid-search
              visitor should reach it without scrolling past the pitch they
              already believed when they clicked the ad. lg: restores the
              visual layout (pitch left, form right). */}
          <div className="order-2 flex min-w-0 flex-col gap-10 lg:order-1">
            <div className="flex flex-col items-start gap-6">
              <span className="border-ink-border-strong text-ink-muted-foreground inline-flex items-center gap-3 rounded-full border bg-white/[0.04] px-4 py-1.5 font-mono text-xs font-medium tracking-widest uppercase">
                <span className="text-brand-teal">&bull; Build</span>
                <span className="text-brand-teal">&bull; Launch</span>
                <span className="text-brand-teal">&bull; Grow</span>
              </span>

              <h1
                className="font-display font-semibold tracking-[-0.03em] text-balance"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1.05 }}
              >
                Turn Your Idea Into a High-Performing{" "}
                <span className="from-brand-teal to-primary bg-linear-to-r bg-clip-text text-transparent">
                  Website or App
                </span>
              </h1>

              <p className="text-ink-muted-foreground max-w-xl text-lg text-pretty">
                Get a modern, fast and conversion-focused website or mobile app built by our team.
                We handle design, development and deployment so you can focus on your business.
              </p>
            </div>

            <ul className="grid gap-5 sm:grid-cols-3">
              {VALUE_POINTS.map((point) => (
                <li
                  key={point.title}
                  className="flex items-center gap-3.5 sm:flex-col sm:items-start"
                >
                  <span className="bg-brand-teal/15 text-brand-teal flex size-12 shrink-0 items-center justify-center rounded-2xl">
                    <point.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <strong className="text-ink-foreground text-base font-semibold">
                      {point.title}
                    </strong>
                    <span className="text-ink-muted-foreground text-sm">{point.description}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-5">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">
                What happens next?
              </h2>
              <ol className="grid gap-4 md:grid-cols-3">
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="border-ink-border-strong relative flex flex-col gap-3 rounded-2xl border bg-white/[0.04] p-5"
                  >
                    <span className="bg-brand-teal text-ink absolute -top-3 -left-2 flex size-7 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="bg-brand-teal/15 text-brand-teal flex size-11 items-center justify-center rounded-xl">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <strong className="text-ink-foreground text-base font-semibold">
                      {step.title}
                    </strong>
                    <span className="text-ink-muted-foreground text-sm text-pretty">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {proof && (
              <div className="border-ink-border-strong grid items-center gap-5 overflow-hidden rounded-2xl border bg-white/[0.04] p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={proof.imageUrl}
                    alt={`Cover image for ${proof.title}`}
                    fill
                    sizes="(min-width: 1024px) 320px, 90vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col items-start gap-3">
                  <span className="bg-brand-teal/20 text-brand-teal rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest uppercase">
                    {proof.clientName ? "Client project" : "Portfolio concept"}
                  </span>
                  <h3 className="font-display text-xl font-semibold">{proof.title}</h3>
                  {proof.tagline && (
                    <p className="text-ink-muted-foreground text-sm text-pretty">{proof.tagline}</p>
                  )}
                  <Link
                    href={proof.slug ? `/work/${proof.slug}` : "/work"}
                    className="border-ink-border-strong text-ink-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-white/[0.06]"
                  >
                    View demo
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            <ul className="border-ink-border-strong grid gap-5 border-t pt-8 sm:grid-cols-2">
              {COMMITMENTS.map((item) => (
                <li key={item.label} className="flex items-center gap-3.5">
                  <span className="bg-brand-teal/15 text-brand-teal flex size-11 shrink-0 items-center justify-center rounded-full">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-ink-foreground/90 text-sm leading-snug">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 w-full lg:order-2">
            {/* No Reveal wrapper here, deliberately - this card is the page's
                entire point, and it's the very first thing in the mobile
                viewport (see order-1 above). It's never scrolled into view;
                it's just there on load. */}
            <Card className="shadow-glow-xl mx-auto max-w-xl gap-0 p-6 md:p-8">
              <h2 className="text-foreground font-display mb-1 text-2xl font-semibold">
                Start your project
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Takes under a minute. We&apos;ll call you back to discuss your requirements.
              </p>
              <StartProjectForm defaultEmail={defaultEmail} />
            </Card>
          </div>
        </Container>
      </Section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-7 py-14 text-center sm:px-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 800px 460px at 50% 0%, oklch(0.541 0.216 265.75 / 0.4), transparent 65%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl">
                Prefer to just message us?
              </h2>
              <p className="text-ink-muted-foreground max-w-xl text-lg text-pretty">
                Skip the form entirely and start a conversation on WhatsApp right now.
              </p>
              <a
                href={getWhatsAppUrl("/start-project")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                <MessageCircle className="size-4.5" aria-hidden="true" />
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

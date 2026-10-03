import { Fragment } from "react";
import { Check, Minus, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

type Verdict = "yes" | "partial" | "no";

interface ComparisonRow {
  label: string;
  stively: string;
  youtube: string;
  bootcamp: string;
  youtubeVerdict: Verdict;
  bootcampVerdict: Verdict;
}

/**
 * Deliberately not a Stively-sweeps-every-row strawman - Verdict.partial on
 * the bootcamp column wherever that's genuinely fair (structure, real
 * projects) is what keeps this readable as an honest comparison instead of
 * marketing theater, same "no fabricated proof" principle as the founding-
 * price section above. Kept topic-neutral (no course-specific tech named)
 * since this renders on every TRAINING offering through course-detail-view.
 */
const ROWS: ComparisonRow[] = [
  {
    label: "Structure",
    stively: "One sequenced path, each lesson builds on the last",
    youtube: "Scattered videos, no real order",
    bootcamp: "Usually structured",
    youtubeVerdict: "no",
    bootcampVerdict: "partial",
  },
  {
    label: "Real projects",
    stively: "Every module ends in something you built, not a copy-paste demo",
    youtube: "Mostly watch-and-follow-along",
    bootcamp: "Usually included",
    youtubeVerdict: "no",
    bootcampVerdict: "partial",
  },
  {
    label: "Checks along the way",
    stively: "A quiz after every lesson, so gaps get caught early",
    youtube: "None - you find out what you missed later",
    bootcamp: "Rarely graded until the end",
    youtubeVerdict: "no",
    bootcampVerdict: "partial",
  },
  {
    label: "Git, GitHub & deployment",
    stively: "A dedicated bonus module - not an afterthought",
    youtube: "Rarely covered properly",
    bootcamp: "Rarely covered properly",
    youtubeVerdict: "no",
    bootcampVerdict: "no",
  },
  {
    label: "Certificate",
    stively: "Verifiable, only issued once you actually pass the quizzes",
    youtube: "None",
    bootcamp: "Often just for attending",
    youtubeVerdict: "no",
    bootcampVerdict: "partial",
  },
  {
    label: "Direct support",
    stively: "Message the team that built the course, on WhatsApp",
    youtube: "A comments section, if anyone replies",
    bootcamp: "Varies a lot by program",
    youtubeVerdict: "no",
    bootcampVerdict: "partial",
  },
  {
    label: "Price",
    stively: "One transparent, one-time price",
    youtube: "Free, but you're on your own",
    bootcamp: "Often ₹15,000+",
    youtubeVerdict: "yes",
    bootcampVerdict: "no",
  },
];

const VERDICT_STYLE: Record<Verdict, { icon: typeof Check; className: string }> = {
  yes: { icon: Check, className: "text-success" },
  partial: { icon: Minus, className: "text-warning" },
  no: { icon: X, className: "text-muted-foreground/60" },
};

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const { icon: Icon, className } = VERDICT_STYLE[verdict];
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}

type ComparisonColumnKey = "stively" | "youtube" | "bootcamp";

/** Stively has no verdict field of its own - it's the reference column, always "yes". */
function getVerdict(row: ComparisonRow, key: ComparisonColumnKey): Verdict {
  if (key === "stively") return "yes";
  return key === "youtube" ? row.youtubeVerdict : row.bootcampVerdict;
}

/**
 * Renders on every TRAINING offering (shared with course-detail-view.tsx) -
 * a genuine "why this instead of the usual options" answer instead of the
 * empty space a generic-feeling course page tends to leave here. Table on
 * desktop; each option becomes its own card with the same rows stacked on
 * mobile, both reading off the same ROWS data so they can never drift.
 */
function CourseComparison() {
  return (
    <Section background="muted" className="py-12 md:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-foreground font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Why not just watch it for free?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">
            You could. Here&apos;s the honest trade-off against the two things people actually try
            first.
          </p>
        </div>

        {/* Desktop / tablet: full table, Stively's column visually raised */}
        <div className="border-border bg-card hidden overflow-hidden rounded-2xl border shadow-sm sm:block">
          <div className="grid grid-cols-[1.1fr_1.3fr_1fr_1fr]">
            <div className="border-border/70 border-r border-b p-4" />
            <div className="bg-primary/5 border-border/70 border-b p-4">
              <span className="text-primary text-sm font-semibold">Stively</span>
            </div>
            <div className="border-border/70 border-b border-l p-4">
              <span className="text-muted-foreground text-sm font-semibold">
                Free YouTube tutorials
              </span>
            </div>
            <div className="border-border/70 border-b border-l p-4">
              <span className="text-muted-foreground text-sm font-semibold">
                Typical paid bootcamp
              </span>
            </div>

            {ROWS.map((row, i) => (
              <Fragment key={row.label}>
                <div
                  className={cn(
                    "group-hover:bg-accent/40 border-r p-4",
                    i < ROWS.length - 1 && "border-border/70 border-b"
                  )}
                >
                  <span className="text-foreground text-sm font-medium">{row.label}</span>
                </div>
                <div
                  className={cn(
                    "bg-primary/5 hover:bg-primary/10 p-4 transition-colors",
                    i < ROWS.length - 1 && "border-border/70 border-b"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <VerdictIcon verdict="yes" />
                    <span className="text-foreground text-sm text-pretty">{row.stively}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "hover:bg-accent/40 border-l p-4 transition-colors",
                    i < ROWS.length - 1 && "border-border/70 border-b"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <VerdictIcon verdict={row.youtubeVerdict} />
                    <span className="text-muted-foreground text-sm text-pretty">{row.youtube}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "hover:bg-accent/40 border-l p-4 transition-colors",
                    i < ROWS.length - 1 && "border-border/70 border-b"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <VerdictIcon verdict={row.bootcampVerdict} />
                    <span className="text-muted-foreground text-sm text-pretty">
                      {row.bootcamp}
                    </span>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Mobile: one card per option, same rows stacked */}
        <div className="flex flex-col gap-4 sm:hidden">
          {[
            { name: "Stively", key: "stively" as const, highlight: true },
            { name: "Free YouTube tutorials", key: "youtube" as const, highlight: false },
            { name: "Typical paid bootcamp", key: "bootcamp" as const, highlight: false },
          ].map((col) => (
            <Card key={col.name} className={cn(col.highlight && "border-primary/40 bg-primary/5")}>
              <CardContent className="flex flex-col gap-3">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    col.highlight ? "text-primary" : "text-foreground"
                  )}
                >
                  {col.name}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {ROWS.map((row) => (
                    <li key={row.label} className="flex items-start gap-2">
                      <VerdictIcon verdict={getVerdict(row, col.key)} />
                      <span className="text-sm">
                        <span className="text-foreground font-medium">{row.label}: </span>
                        <span className="text-muted-foreground">{row[col.key]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export { CourseComparison };

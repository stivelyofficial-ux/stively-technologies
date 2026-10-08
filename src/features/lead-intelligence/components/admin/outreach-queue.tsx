"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, SkipForward, Inbox, UserCheck, ThumbsDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/sections/empty-state";
import { markOutreachSent, markOutreachOutcome } from "../../actions/outreach-actions";
import { promoteToSalesLead } from "../../actions/promote-actions";
import { buildWhatsAppUrl, OUTREACH_SEGMENT_LABEL } from "../../lib/outreach";
import type { OutreachCard, OutreachStats, SentOutreachRow } from "../../server/outreach-queries";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card flex flex-col gap-0.5 rounded-xl border px-4 py-3">
      <span className="text-foreground text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

interface OutreachQueueProps {
  cards: OutreachCard[];
  stats: OutreachStats;
  awaitingReply: SentOutreachRow[];
}

/**
 * The working surface for daily outreach: one business at a time, message
 * pre-written and editable, one tap opens WhatsApp with it filled in, and the
 * queue advances. The send itself is always the user's own tap inside
 * WhatsApp - nothing here sends automatically.
 */
function OutreachQueue({ cards, stats, awaitingReply }: OutreachQueueProps) {
  const router = useRouter();
  const [queue, setQueue] = React.useState(cards);
  const [sentThisSession, setSentThisSession] = React.useState(0);
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const current = queue[0];
  const message = current ? (draft[current.id] ?? current.message) : "";

  function advance(id: string) {
    setQueue((prev) => prev.filter((card) => card.id !== id));
  }

  function handleSend() {
    if (!current) return;
    setError(null);
    // Open WhatsApp synchronously inside the click so the browser doesn't treat it as a blocked popup.
    window.open(buildWhatsAppUrl(current.waNumber, message), "_blank", "noopener,noreferrer");
    const id = current.id;
    advance(id);
    setSentThisSession((n) => n + 1);
    void markOutreachSent(id, message).then((result) => {
      if (!result.success) setError(result.error);
    });
  }

  async function handleSkip() {
    if (!current) return;
    setError(null);
    const id = current.id;
    advance(id);
    const result = await markOutreachOutcome(id, "SKIPPED");
    if (!result.success) setError(result.error);
  }

  async function handleReplied(row: SentOutreachRow) {
    setBusyId(row.id);
    setError(null);
    const marked = await markOutreachOutcome(row.id, "REPLIED");
    if (!marked.success) {
      setError(marked.error);
      setBusyId(null);
      return;
    }
    const promoted = await promoteToSalesLead(row.id);
    setBusyId(null);
    if (!promoted.success) setError(promoted.error);
    router.refresh();
  }

  async function handleNotInterested(row: SentOutreachRow) {
    setBusyId(row.id);
    setError(null);
    const result = await markOutreachOutcome(row.id, "NOT_INTERESTED");
    setBusyId(null);
    if (!result.success) setError(result.error);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sent today" value={stats.contactedToday + sentThisSession} />
        <Stat label="In queue" value={Math.max(stats.queued - sentThisSession, 0)} />
        <Stat label="No website" value={stats.noWebsite} />
        <Stat label="Replied (all time)" value={stats.repliedTotal} />
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {current ? (
        <div className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                {current.businessName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {[current.industry, current.city].filter(Boolean).join(" · ") || "No details"} ·{" "}
                {current.displayNumber}
              </p>
              {current.website && (
                <a
                  href={current.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {current.website.replace(/^https?:\/\//i, "")}
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={current.segment === "NO_WEBSITE" ? "default" : "warning"}>
                {OUTREACH_SEGMENT_LABEL[current.segment]}
              </Badge>
              <span className="text-muted-foreground text-xs">{current.reason}</span>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-foreground text-sm font-medium">Message (edit if you like)</span>
            <textarea
              value={message}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, [current.id]: event.target.value }))
              }
              rows={7}
              className="border-input bg-background focus-visible:ring-ring w-full rounded-lg border p-3 text-sm leading-relaxed focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={handleSend}>
              <MessageCircle aria-hidden="true" />
              Send on WhatsApp
            </Button>
            <Button size="lg" variant="outline" onClick={handleSkip}>
              <SkipForward aria-hidden="true" />
              Skip
            </Button>
            <span className="text-muted-foreground text-xs">
              WhatsApp opens with the message filled in. Tap send there, then come back - the next
              business is ready.
            </span>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Queue is empty"
          description={
            stats.needsAnalysis > 0
              ? `${stats.needsAnalysis} businesses with websites haven't been analyzed yet, so they can't be sorted into an offer. Analyze them from the Businesses tab, or discover more businesses.`
              : "Discover more businesses to fill the queue. Only businesses with a mobile number and either no website or a weak one appear here."
          }
          actionLabel="Discover businesses"
          actionHref="/admin/lead-intelligence/discover"
        />
      )}

      {queue.length > 1 && (
        <p className="text-muted-foreground text-sm">
          Up next:{" "}
          {queue
            .slice(1, 4)
            .map((card) => card.businessName)
            .join(", ")}
          {queue.length > 4 ? ` and ${queue.length - 4} more` : ""}
        </p>
      )}

      {awaitingReply.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Sent - waiting for a reply
            </h2>
            <p className="text-muted-foreground text-sm">
              Replies arrive on your WhatsApp. When someone replies, tap &quot;Got a reply&quot; to
              move them into the Sales CRM.
            </p>
          </div>
          <ul className="border-border bg-card divide-border divide-y rounded-2xl border">
            {awaitingReply.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/admin/lead-intelligence/businesses/${row.id}`}
                    className="text-foreground text-sm font-medium hover:underline"
                  >
                    {row.businessName}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {row.city ? `${row.city} · ` : ""}
                    sent{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(row.contactedAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={busyId === row.id} onClick={() => handleReplied(row)}>
                    <UserCheck aria-hidden="true" />
                    Got a reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => handleNotInterested(row)}
                  >
                    <ThumbsDown aria-hidden="true" />
                    Not interested
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export { OutreachQueue };

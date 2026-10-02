"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { createReferrer, recordPayout, setReferrerBlocked } from "../../actions/admin-actions";
import { courseReferralLink, DEFAULT_REFERRAL_SLUG } from "../../lib/shareable";
import { FLAG_LABELS, type ReferralFlag } from "../../lib/fraud";
import { MIN_PAYOUT_PAISE } from "../../lib/payout";

export interface ReferrersPanelRow {
  id: string;
  name: string;
  email: string | null;
  code: string;
  clicks: number;
  signedUp: number;
  converted: number;
  owed: number;
  paid: number;
  payoutTo: string | null;
  flags: ReferralFlag[];
  conversionRate: number | null;
  blocked: boolean;
  blockedReason: string | null;
}

function BlockControl({ row }: { row: ReferrersPanelRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function run(blocked: boolean) {
    setIsPending(true);
    setError(undefined);
    const result = await setReferrerBlocked(row.id, blocked, reason);
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (row.blocked) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        loading={isPending}
        onClick={() => run(false)}
      >
        Unblock
      </Button>
    );
  }
  if (!open) {
    return (
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Pause
      </Button>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="h-8 w-40 text-xs"
        />
        <Button
          type="button"
          size="sm"
          variant="destructive"
          loading={isPending}
          onClick={() => run(true)}
        >
          Pause
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={copy}
      aria-label="Copy referral link"
      className="gap-1"
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

function RecordPayoutCell({ row }: { row: ReferrersPanelRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reference, setReference] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  if (row.owed < MIN_PAYOUT_PAISE) {
    return (
      <span className="text-muted-foreground text-xs">
        Below {formatPrice(MIN_PAYOUT_PAISE)} minimum
      </span>
    );
  }
  if (!row.payoutTo) {
    return <span className="text-warning text-xs">Eligible - no payout details yet</span>;
  }
  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Record payout
      </Button>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);
    const result = await recordPayout({ referrerId: row.id, reference });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setReference("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-end gap-1.5">
      <p className="text-muted-foreground max-w-[260px] text-right text-xs">
        Send {formatPrice(row.owed)} to{" "}
        <span className="text-foreground font-medium">{row.payoutTo}</span>, then enter the UTR:
      </p>
      <div className="flex gap-2">
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="UTR / reference"
          className="h-8 w-40 text-xs"
          required
        />
        <Button type="submit" size="sm" loading={isPending}>
          Confirm paid
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </form>
  );
}

function AddReferrerForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [customCode, setCustomCode] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [createdLink, setCreatedLink] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);
    setCreatedLink(undefined);
    const result = await createReferrer({ name, email, customCode });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCreatedLink(result.link);
    setName("");
    setEmail("");
    setCustomCode("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border/70 flex flex-col gap-3 rounded-lg border p-4"
    >
      <div>
        <h2 className="text-foreground text-sm font-semibold">Add a referrer</h2>
        <p className="text-muted-foreground text-xs">
          For a partner or influencer who isn&apos;t a student. We create their account if needed,
          assign the link and email them access to the same referral dashboard students use.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ref-name">Name</Label>
          <Input id="ref-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ref-email">Email</Label>
          <Input
            id="ref-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ref-code">Custom code (optional)</Label>
          <Input
            id="ref-code"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="e.g. RAHUL10"
            maxLength={20}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {createdLink && (
        <p className="text-sm">
          Created. Link: <span className="font-mono">{createdLink}</span>{" "}
          <CopyLinkButton link={createdLink} />
        </p>
      )}
      <Button type="submit" loading={isPending} className="w-fit">
        Create referral link
      </Button>
    </form>
  );
}

function ReferrersPanel({ rows, siteUrl }: { rows: ReferrersPanelRow[]; siteUrl: string }) {
  return (
    <div className="flex flex-col gap-4">
      <AddReferrerForm />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-foreground text-sm font-semibold">Referrers</h2>
        <Button asChild size="sm" variant="outline">
          <a href="/api/admin/referrals/payouts.csv" download>
            Export payout sheet (CSV)
          </a>
        </Button>
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
            <tr>
              <th className="px-4 py-2.5 font-medium">Referrer</th>
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
              <th className="px-4 py-2.5 text-right font-medium">Signed up</th>
              <th className="px-4 py-2.5 text-right font-medium">Converted</th>
              <th className="px-4 py-2.5 text-right font-medium">Rate</th>
              <th className="px-4 py-2.5 text-right font-medium">Owed</th>
              <th className="px-4 py-2.5 text-right font-medium">Paid</th>
              <th className="px-4 py-2.5 text-right font-medium">Payout</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-muted-foreground px-4 py-6 text-center">
                  No referrers yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{row.name}</div>
                    {row.email && <div className="text-muted-foreground text-xs">{row.email}</div>}
                    {(row.blocked || row.flags.length > 0) && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {row.blocked && (
                          <span
                            title={row.blockedReason ?? undefined}
                            className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-[11px] font-medium"
                          >
                            Paused
                          </span>
                        )}
                        {row.flags.map((flag) => (
                          <span
                            key={flag}
                            title={FLAG_LABELS[flag].hint}
                            className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-[11px] font-medium"
                          >
                            {FLAG_LABELS[flag].label}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.clicks}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.signedUp}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.converted}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.conversionRate == null ? "-" : `${row.conversionRate}%`}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(row.owed)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(row.paid)}</td>
                  <td className="px-4 py-3 text-right">
                    <RecordPayoutCell row={row} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BlockControl row={row} />
                    <CopyLinkButton
                      link={courseReferralLink(siteUrl, DEFAULT_REFERRAL_SLUG, row.code)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { ReferrersPanel };

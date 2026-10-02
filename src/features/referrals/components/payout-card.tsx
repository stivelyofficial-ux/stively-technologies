"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { savePayoutDetails } from "../actions/payout-actions";

export interface PayoutCardProps {
  /** Paise owed (CONVERTED, not yet paid). */
  owedAmount: number;
  minPayout: number;
  /** Null until the referrer saves details. Account number arrives already masked. */
  saved: {
    method: "UPI" | "BANK";
    upiId: string | null;
    accountHolder: string | null;
    accountMasked: string;
    ifsc: string | null;
  } | null;
  payouts: { id: string; amount: number; destination: string; reference: string; paidAt: string }[];
}

function PayoutCard({ owedAmount, minPayout, saved, payouts }: PayoutCardProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(saved == null);
  const [method, setMethod] = React.useState<"UPI" | "BANK">(saved?.method ?? "UPI");
  const [upiId, setUpiId] = React.useState(saved?.upiId ?? "");
  const [accountHolder, setAccountHolder] = React.useState(saved?.accountHolder ?? "");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifsc, setIfsc] = React.useState(saved?.ifsc ?? "");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);
    const result = await savePayoutDetails(
      method === "UPI" ? { method, upiId } : { method, accountHolder, accountNumber, ifsc }
    );
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditing(false);
    setAccountNumber("");
    router.refresh();
  }

  const reached = owedAmount >= minPayout;
  const percent = Math.min(100, Math.round((owedAmount / minPayout) * 100));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-foreground text-sm font-medium">Next payout</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatPrice(owedAmount)} of {formatPrice(minPayout)} minimum
          </span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full" aria-hidden="true">
          <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-muted-foreground text-xs">
          {reached
            ? saved
              ? "You've reached the minimum - we'll send your payout to the details below shortly."
              : "You've reached the minimum - add payout details below so we can pay you."
            : `Earn ${formatPrice(minPayout - owedAmount)} more to reach the minimum payout.`}
        </p>
      </div>

      {!editing && saved ? (
        <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="text-foreground font-medium">
              {saved.method === "UPI"
                ? `UPI: ${saved.upiId}`
                : `Bank: ${saved.accountHolder} · ${saved.accountMasked}`}
            </span>
            {saved.method === "BANK" && (
              <span className="text-muted-foreground text-xs">IFSC {saved.ifsc}</span>
            )}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            Change
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div
            className="border-border bg-muted flex w-fit gap-1 rounded-full border p-1"
            role="radiogroup"
            aria-label="Payout method"
          >
            {(["UPI", "BANK"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={method === option}
                onClick={() => setMethod(option)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors " +
                  (method === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {option === "UPI" ? "UPI" : "Bank account"}
              </button>
            ))}
          </div>

          {method === "UPI" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payout-upi">UPI ID</Label>
              <Input
                id="payout-upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@bank"
                required
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payout-holder">Account holder</Label>
                <Input
                  id="payout-holder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payout-account">Account number</Label>
                <Input
                  id="payout-account"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder={
                    saved?.method === "BANK" ? `Re-enter (${saved.accountMasked})` : undefined
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payout-ifsc">IFSC</Label>
                <Input
                  id="payout-ifsc"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001234"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={isPending} size="sm">
              Save payout details
            </Button>
            {saved && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {payouts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">Payout history</span>
          <ul className="flex flex-col gap-2">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="border-border/70 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="text-success size-4" aria-hidden="true" />
                    {formatPrice(p.amount)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(p.paidAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &middot; ref {p.reference}
                  </span>
                </div>
                <span className="text-muted-foreground max-w-[50%] truncate text-xs">
                  {p.destination.split(",")[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { PayoutCard };

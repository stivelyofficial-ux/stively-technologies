"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DatabaseMaintenanceDialog } from "@/components/shared/database-maintenance-dialog";
import { formatPrice } from "@/lib/utils";
import "@/lib/razorpay-client-types";
import { trackMetaPurchase, trackMetaInitiateCheckout } from "@/lib/meta-pixel";
import { createGuestOrder, verifyGuestPayment, setGuestLearnerName } from "../actions/guest-checkout-actions";

export interface GuestCheckoutFormProps {
  offering: {
    id: string;
    title: string;
    price: number;
    currency: string;
    promptsPackPrice: number | null;
    /** Second, higher-tier either/or bump alongside promptsPackPrice - see Offering.promptsPack500Price. */
    promptsPack500Price?: number | null;
  };
  /** CSP nonce from src/proxy.ts, read via `headers()` on the offering page. */
  nonce?: string;
  /** "Enroll Now" reads right for a course, wrong for a one-off product - the call site names its own verb. Defaults to the original course wording so every existing caller is unaffected. */
  ctaLabel?: string;
  /**
   * Shows the "set up your learner profile" name step right after payment
   * succeeds, before redirecting - on by default (every course this form
   * sells issues a certificate that needs a real name, and there's no
   * account/profile page reason to ask for it any earlier). digital-store
   * passes false: a one-off download has no certificate to put a name on,
   * so there's nothing to justify the extra step for that buyer.
   */
  collectLearnerName?: boolean;
  /** Overrides the prompt-pack add-on's label/description - lets a course page point the bonus at the real, purchasable Digital Store product instead of the original unlinked promise. Ignored when the offering has no matching price set. */
  promptsPackCopy?: { label: string; description: string };
  /** Same, for the promptsPack500 tier. Ignored when the offering has no promptsPack500Price. */
  promptsPack500Copy?: { label: string; description: string };
}

/**
 * The zero-login checkout path for an Offering with allowsGuestCheckout on
 * - just an email captured right here, no account exists until payment
 * actually succeeds (see fulfillGuestOrder). Deliberately minimal: no
 * multi-step wizard before payment, one field, one button, matching the
 * "cold Instagram traffic, ready-to-buy audience, zero distraction" brief
 * this was built for. No name field, no phone field and no three-way
 * add-on choice (2026-09-27) - every field/decision before Razorpay opens
 * is a real reason a cold visitor hesitates; see
 * guest-checkout-schemas.ts's comment for the name/phone removal, and the
 * single checkbox below for the add-on simplification. The name moves to
 * a one-field "set up your learner profile" step right after payment
 * succeeds instead (see the `profileStep` render below) - asked for once
 * there's already a paying customer on the other end, not before.
 */
function GuestCheckoutForm({
  offering,
  nonce,
  ctaLabel = "Enroll Now for",
  collectLearnerName = true,
  promptsPackCopy,
  promptsPack500Copy,
}: GuestCheckoutFormProps) {
  const [scriptReady, setScriptReady] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [addPromptPack, setAddPromptPack] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [alreadyOwned, setAlreadyOwned] = React.useState<{ message: string; redirectUrl?: string } | undefined>();
  const [showMaintenance, setShowMaintenance] = React.useState(false);
  // Set once verifyGuestPayment succeeds - holds everything the profile
  // step and its eventual redirect need, so the redirect itself only ever
  // happens from one place (handleProfileSubmit) instead of being
  // duplicated between "collect name" and "skip straight there" paths.
  const [paidResult, setPaidResult] = React.useState<{ orderId: string; email: string; redirectTo: string } | undefined>();
  const [learnerName, setLearnerName] = React.useState("");
  const [profilePending, setProfilePending] = React.useState(false);
  // Guards against Razorpay's documented "handler can fire more than once"
  // edge case double-reporting the same purchase to the Meta Pixel - see
  // the handler below. A ref, not state: it must survive without
  // triggering a re-render, and only needs to live for this one component
  // instance's lifetime (there's no success page to revisit that could
  // reset it - see trackMetaPurchase's own comment on why that's the real
  // duplicate-prevention boundary here).
  const purchaseTrackedRef = React.useRef(false);

  // Whichever tier this offering actually has - the 500-pack when
  // available (better value per prompt), otherwise the 100-pack. Mirrors
  // createGuestOrder's own server-side resolution exactly, so the price
  // shown here can never drift from what actually gets charged.
  const availableAddon: { tier: "promptsPack500" | "promptsPack"; price: number; label: string; description: string; badge?: string } | null =
    offering.promptsPack500Price != null
      ? {
          tier: "promptsPack500",
          price: offering.promptsPack500Price,
          label: promptsPack500Copy?.label ?? "500 AI Prompt Templates",
          description: promptsPack500Copy?.description ?? "PDF download, delivered by email",
          badge:
            offering.promptsPackPrice != null
              ? `5x the prompts, just ${formatPrice(offering.promptsPack500Price - offering.promptsPackPrice, offering.currency)} more`
              : "Best value",
        }
      : offering.promptsPackPrice != null
        ? {
            tier: "promptsPack",
            price: offering.promptsPackPrice,
            label: promptsPackCopy?.label ?? "100 Practical AI Prompts",
            description: promptsPackCopy?.description ?? "PDF download, delivered by email",
          }
        : null;

  const addonPrice = addPromptPack && availableAddon ? availableAddon.price : 0;
  const total = offering.price + addonPrice;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);

    const result = await createGuestOrder({
      offeringId: offering.id,
      email,
      addPromptPack,
    });
    if (!result.success) {
      setIsPending(false);
      if ("alreadyOwned" in result && result.alreadyOwned) {
        setAlreadyOwned({ message: result.error, redirectUrl: result.redirectUrl });
        return;
      }
      setError(result.error);
      if ("isDbMaintenance" in result && result.isDbMaintenance) setShowMaintenance(true);
      return;
    }

    if (!scriptReady || typeof window.Razorpay !== "function") {
      setIsPending(false);
      setError("Payment couldn't load - please refresh and try again.");
      return;
    }

    // Meta Pixel InitiateCheckout - right here, not on form submit: this is
    // the first point a real order (createGuestOrder succeeded above) is
    // about to actually reach Razorpay's modal, so a failed/already-owned
    // submission never fires it. `result.amount` is the real order total
    // (base price + any add-on chosen), same paise->rupees conversion as
    // the Purchase event below.
    trackMetaInitiateCheckout({ contentName: offering.title, value: result.amount / 100, currency: result.currency });

    const razorpay = new window.Razorpay({
      key: result.keyId,
      amount: result.amount,
      currency: result.currency,
      order_id: result.razorpayOrderId,
      name: "Stively",
      description: offering.title,
      // No `contact` - Razorpay collects a phone number itself, in its own
      // flow, only where it actually needs one (UPI, etc.) - see
      // guest-checkout-schemas.ts's comment on why this form no longer
      // asks for it upfront.
      prefill: { email },
      theme: { color: "#ec3013" },
      handler: async (response) => {
        const verifyResult = await verifyGuestPayment({
          orderId: result.orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        setIsPending(false);
        if (!verifyResult.success) {
          setError(verifyResult.error);
          return;
        }

        // Meta Pixel Purchase - fired here and only here: after the
        // backend has actually verified the Razorpay signature (or
        // confirmed the webhook already did), never on the Razorpay
        // `handler` callback alone. `amount`/`currency` are the real,
        // verified transaction value from the server response (paise ->
        // rupees), so an order that included a paid prompt-pack add-on
        // reports what was genuinely charged, not a hardcoded course
        // price. The ref guard covers Razorpay's own documented "handler
        // can fire more than once" case within this one checkout session;
        // there's no separate reloadable success page for this flow (see
        // the redirect below) for a stale duplicate to replay from.
        if (!purchaseTrackedRef.current && verifyResult.amount != null && verifyResult.currency) {
          purchaseTrackedRef.current = true;
          trackMetaPurchase(verifyResult.amount / 100, verifyResult.currency);
        }

        // autoLoginLink resolves to the right place for what was actually
        // bought (My Purchases with a real download button for a digital
        // product, My Learning for a course) - see acceptOrderAutoLogin.
        // downloadUrl is the fallback only if fulfillment somehow produced
        // a file but no account link.
        const redirectTo = verifyResult.autoLoginLink ?? verifyResult.downloadUrl ?? "/login";
        if (collectLearnerName) {
          // One more screen before that redirect: the name this account
          // was created without (see guest-checkout-schemas.ts). Held in
          // state, not followed immediately - handleProfileSubmit does the
          // actual navigation once a name is in.
          setPaidResult({ orderId: result.orderId, email, redirectTo });
          return;
        }
        window.location.href = redirectTo;
      },
      modal: { ondismiss: () => setIsPending(false) },
    });

    razorpay.on("payment.failed", () => {
      setIsPending(false);
      setError("Payment didn't go through - please try again.");
    });

    razorpay.open();
  }

  /**
   * The one-field "set up your learner profile" step's submit. Best-effort
   * on the name save: a paying customer never gets trapped here by a
   * server hiccup on a purely cosmetic field - the redirect always fires
   * once this resolves, name saved or not, same as fulfillGuestOrder's own
   * philosophy of never blocking real access behind non-essential steps.
   */
  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!paidResult) return;
    setProfilePending(true);
    try {
      await setGuestLearnerName({ orderId: paidResult.orderId, email: paidResult.email, name: learnerName });
    } catch (err) {
      console.error("setGuestLearnerName failed:", err);
    }
    window.location.href = paidResult.redirectTo;
  }

  if (paidResult) {
    return (
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-center">
          <span className="text-foreground font-display text-xl font-semibold">🎉 You&apos;re enrolled!</span>
          <span className="text-muted-foreground text-sm">Let&apos;s set up your learner profile.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gc-learner-name">Full name</Label>
          <Input
            id="gc-learner-name"
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            placeholder="Your name"
            autoFocus
            required
          />
          <span className="text-muted-foreground text-xs">This name will appear on your Stively Certificate of Completion.</span>
        </div>
        <Button type="submit" size="lg" loading={profilePending} className="w-full">
          Continue to Course
        </Button>
      </form>
    );
  }

  return (
    <form id="guest-checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DatabaseMaintenanceDialog open={showMaintenance} onOpenChange={setShowMaintenance} />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" nonce={nonce} onLoad={() => setScriptReady(true)} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gc-email">Email</Label>
        <Input id="gc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For your account" required />
      </div>

      {availableAddon && (
        <label
          htmlFor="gc-addon"
          className="border-border hover:border-primary/40 flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
        >
          <Checkbox id="gc-addon" checked={addPromptPack} onCheckedChange={(v) => setAddPromptPack(v === true)} className="mt-0.5" />
          <span className="flex-1">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-foreground text-sm font-medium">Add {availableAddon.label}</span>
              {availableAddon.badge && (
                <Badge variant="success" className="font-normal">
                  {availableAddon.badge}
                </Badge>
              )}
            </span>
            <span className="text-muted-foreground block text-sm">
              {availableAddon.description} · {formatPrice(availableAddon.price, offering.currency)}
            </span>
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        {ctaLabel} {formatPrice(total, offering.currency)}
      </Button>
      <p className="text-primary -mt-2 text-center text-xs font-medium">
        You&apos;re one step away - no distractions, just enroll.
      </p>

      <Dialog open={!!alreadyOwned} onOpenChange={(open) => !open && setAlreadyOwned(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You already have this</DialogTitle>
            <DialogDescription>{alreadyOwned?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {alreadyOwned?.redirectUrl ? (
              <Button asChild>
                <Link href={alreadyOwned.redirectUrl}>Go to my account</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

export { GuestCheckoutForm };

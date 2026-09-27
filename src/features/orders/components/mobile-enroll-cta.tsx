"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The mobile sticky purchase bar's CTA - a plain scroll-to-anchor link
 * would let a visitor who already typed their email into the
 * GuestCheckoutForm below (see guest-checkout-form.tsx's `id`s this reads)
 * tap this persistent bar expecting payment to open, only to get bounced
 * back to a form they'd already filled in with nothing visibly happening.
 * When that form is on the page and already has an email in it, this
 * submits it directly instead - same handleSubmit, same Razorpay modal, no
 * extra tap. Otherwise it's the original anchor-scroll link, plus focusing
 * the email field once it's in view.
 */
function MobileEnrollCta({ href, label, hasGuestForm, className }: { href: string; label: string; hasGuestForm: boolean; className?: string }) {
  function handleClick(event: React.MouseEvent) {
    if (!hasGuestForm) return;
    const email = document.getElementById("gc-email") as HTMLInputElement | null;
    const form = document.getElementById("guest-checkout-form") as HTMLFormElement | null;
    if (email && form && email.value.trim().length > 0) {
      event.preventDefault();
      form.requestSubmit();
      return;
    }
    window.requestAnimationFrame(() => {
      document.getElementById("gc-email")?.focus();
    });
  }

  return (
    <Button asChild className={className} onClick={handleClick}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export { MobileEnrollCta };

"use client";

import * as React from "react";
import Link from "next/link";

import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Every "#enroll" scroll-to-anchor CTA on a guest-checkout offering page
 * (hero, mid-page reinforcement, the persistent mobile bar) - a plain
 * scroll link leaves a visitor to find and tap the email field themselves,
 * and worse, bounces someone who already filled it in back to a form that
 * visibly does nothing when tapped again. This reads the GuestCheckoutForm
 * below (see guest-checkout-form.tsx's `id`s) and does the next right thing
 * instead: an empty form gets scrolled to and the email field focused
 * automatically, ready to type; an already-filled form gets submitted
 * directly - same handleSubmit, same Razorpay modal, no extra tap.
 */
function EnrollCta({
  href,
  label,
  hasGuestForm,
  className,
  variant,
  size,
}: {
  href: string;
  label: string;
  hasGuestForm: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  function handleClick(event: React.MouseEvent) {
    if (!hasGuestForm) return;
    const email = document.getElementById("gc-email") as HTMLInputElement | null;
    const form = document.getElementById("guest-checkout-form") as HTMLFormElement | null;
    if (email && form && email.value.trim().length > 0) {
      event.preventDefault();
      form.requestSubmit();
      return;
    }
    // A rAF fires too early here - the click itself focuses this anchor
    // first, and Next.js's own hash-navigation still has to scroll and
    // settle after that, which reclaims focus if we jump in before it's
    // done. A short delay after that settles reliably wins the race in
    // practice; there's no DOM event to hang this off instead since
    // fragment navigation fires no scroll-end signal.
    window.setTimeout(() => {
      document.getElementById("gc-email")?.focus();
    }, 400);
  }

  return (
    <Button asChild variant={variant} size={size} className={className} onClick={handleClick}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export { EnrollCta };

"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { trackMetaCta } from "@/lib/meta-pixel";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  BOOKING_IS_EXTERNAL,
  BOOKING_LABEL,
  BOOKING_NOTE,
  BOOKING_URL,
  type BookingLocation,
} from "@/config/booking";

interface BookCallButtonProps {
  /** Where the button sits - reported to the Meta Pixel as the Schedule event's content_name. */
  location: BookingLocation;
  /** Overrides the default label ("Book a free 20-min call"). */
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  /** Shows the one-line "20 minutes. No pitch..." reassurance under the button. */
  showNote?: boolean;
  /** Tone for the note on dark surfaces. */
  noteTone?: "default" | "inverse";
  children?: React.ReactNode;
}

/**
 * THE booking CTA: label, destination and tracking live here and in
 * config/booking.ts. Goes to NEXT_PUBLIC_BOOKING_URL when set, otherwise to
 * the contact page, and fires a Meta Pixel "Schedule" event on click.
 */
function BookCallButton({
  location,
  label = BOOKING_LABEL,
  variant = "primary",
  size = "default",
  className,
  showNote = false,
  noteTone = "default",
  children,
}: BookCallButtonProps) {
  const onClick = () => trackMetaCta("Schedule", location);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button variant={variant} size={size} asChild className="w-full sm:w-auto">
        {BOOKING_IS_EXTERNAL ? (
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {children ?? label}
          </a>
        ) : (
          <Link href={BOOKING_URL} onClick={onClick}>
            {children ?? label}
          </Link>
        )}
      </Button>
      {showNote && (
        <p
          className={cn(
            "text-xs",
            noteTone === "inverse" ? "text-ink-muted-foreground" : "text-muted-foreground"
          )}
        >
          {BOOKING_NOTE}
        </p>
      )}
    </div>
  );
}

export { BookCallButton };

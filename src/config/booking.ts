/**
 * The one place the "book a call" CTA's label, link and reassurance line live.
 * Set NEXT_PUBLIC_BOOKING_URL (Cal.com, Calendly, a Google Calendar
 * appointment page...) to send visitors straight to a calendar; while it is
 * unset every booking CTA falls back to the business project form (/start-project), so nothing breaks.
 */
export const BOOKING_FALLBACK_URL = "/start-project";

export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || BOOKING_FALLBACK_URL;

/** True when the link leaves the site (a real calendar page) - such links open in a new tab. */
export const BOOKING_IS_EXTERNAL = /^https?:\/\//i.test(BOOKING_URL);

export const BOOKING_LABEL = "Book a free 20-min call";
export const BOOKING_LABEL_SHORT = "Book a call";
export const BOOKING_NOTE = "20 minutes. No pitch. We'll tell you honestly if we're a fit.";

/** Where a click came from - sent to the Meta Pixel so booking intent can be split by placement. */
export type BookingLocation = "hero" | "pricing" | "header" | "footer" | "banner" | "cta" | "other";

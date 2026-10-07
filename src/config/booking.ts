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

/** True once a real calendar link is configured. Without one, we never promise a "booking" - the CTA is a callback request. */
export const HAS_BOOKING_CALENDAR = BOOKING_URL !== BOOKING_FALLBACK_URL;

export const BOOKING_LABEL = HAS_BOOKING_CALENDAR
  ? "Book a free 20-min call"
  : "Request a callback";
export const BOOKING_LABEL_SHORT = HAS_BOOKING_CALENDAR ? "Book a call" : "Request a callback";
export const BOOKING_NOTE = HAS_BOOKING_CALENDAR
  ? "20 minutes. No pitch. We'll tell you honestly if we're a fit."
  : "Tell us what you need and we'll call you back. No pitch, just an honest view on fit.";

/** Where a click came from - sent to the Meta Pixel so booking intent can be split by placement. */
export type BookingLocation = "hero" | "pricing" | "header" | "footer" | "banner" | "cta" | "other";

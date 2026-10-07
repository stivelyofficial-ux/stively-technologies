import { HAS_BOOKING_CALENDAR } from "@/config/booking";

/**
 * Founding-client program banner on the pricing section. One flag turns it
 * off. Set `slots` and/or `discountPercent` (and optionally `price`) and they
 * appear in the banner automatically; while null nothing is stated publicly.
 */
export const FOUNDING_OFFER = {
  enabled: true,
  headline: "Founding client program",
  text: "Limited slots at a reduced price, in exchange for a testimonial and a case study.",
  cta: HAS_BOOKING_CALENDAR
    ? "Book a call to see if you qualify"
    : "Request a callback to see if you qualify",
  // [FOUNDER TO SET] - each is shown in the banner only once set:
  /** e.g. "From ₹25,000" */
  price: null as string | null,
  slots: null as number | null,
  discountPercent: null as number | null,
};

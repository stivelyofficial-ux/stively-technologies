/**
 * Founding-client program banner on the pricing section. One flag turns it
 * off. The discount and slot count are deliberately NOT stated publicly
 * until the founders decide them - the banner invites a call instead.
 */
export const FOUNDING_OFFER = {
  enabled: true,
  headline: "Founding client program",
  text: "Limited slots at a reduced price, in exchange for a testimonial and a case study.",
  cta: "Book a call to see if you qualify",
  // [FOUNDER TO SET] - not shown on the site yet:
  slots: null as number | null,
  discountPercent: null as number | null,
};

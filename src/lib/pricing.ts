export interface PricingTier {
  /** Outcome-based name: what the client gets, not a generic Starter/Business/Enterprise rung. */
  name: string;
  /** One line on the result this tier buys. */
  outcome: string;
  /** Smallest INR unit, same convention as Program.price (see prisma/schema.prisma) - passed straight to formatPrice, never reformatted independently. */
  priceInPaise: number;
  description: string;
  /** Features of a fixed-scope tier, or the "Typical inclusions" of a custom-scope tier. */
  features: string[];
  /** Shown instead of "Get a quote" when set - e.g. the custom-scope tier books a scoping call. */
  ctaLabel?: string;
  /** Custom-scope tier: no bundled "everything" list, scope is agreed on a call. */
  customScope?: boolean;
  /** Extra line under the features, e.g. what is scoped separately. */
  scopeNote?: string;
  /** What this tier does NOT include, so nothing surprises the client later. */
  notIncluded: string[];
  highlighted?: boolean;
}

/**
 * THE pricing config - every price, tier name and inclusion on the site
 * (homepage, /pricing, JSON-LD) is read from here, so a change is made once.
 * Prices are "From" prices: the fixed estimate is given after a free
 * discovery call. Founders: confirm the numbers below before launch.
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Launch",
    outcome: "Get your business online, properly.",
    priceInPaise: 899_900,
    description: "A fast, professional website for a business getting online.",
    features: [
      "Responsive website",
      "Up to 5 pages",
      "SEO ready",
      "Contact form",
      "Fast performance",
      "1 month support",
    ],
    notIncluded: [
      "Hosting and domain costs",
      "Written content (unless agreed)",
      "Work beyond the 1-month support period",
    ],
  },
  {
    name: "Grow",
    outcome: "A site that brings in leads, not just visitors.",
    priceInPaise: 2_499_900,
    description:
      "A custom-designed, lead-generating site with the content tools and integrations a growing business needs.",
    features: [
      "Custom design",
      "CMS",
      "Blog",
      "SEO optimization",
      "Dashboard",
      "API integration",
      "Performance optimization",
      "3 months support",
    ],
    notIncluded: [
      "Hosting and domain costs",
      "Third-party licences and subscriptions",
      "Written content (unless agreed)",
    ],
    highlighted: true,
  },
  {
    name: "Platform",
    outcome: "A custom web application or e-commerce platform.",
    priceInPaise: 4_999_900,
    description:
      "Custom scope: we agree what is built on a short scoping call, then fix the estimate.",
    customScope: true,
    ctaLabel: "Book a scoping call",
    features: [
      "Custom web application or e-commerce",
      "Admin panel",
      "Payment gateway",
      "Authentication and user accounts",
      "Analytics",
      "Advanced security",
    ],
    scopeNote: "Mobile apps and AI features are scoped and priced separately.",
    notIncluded: [
      "Mobile apps and AI features (priced separately)",
      "Hosting and third-party licences",
      "Work beyond the agreed support period",
    ],
  },
];

/** The sentence shown under every pricing grid. */
export const PRICING_ESTIMATE_NOTE =
  "Fixed estimate after a free discovery call. Scope changes are quoted before work starts.";

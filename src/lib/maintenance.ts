/**
 * The one real target for "when is the database back" - computed once
 * (2026-09-30, ~9:30pm IST) from the founder's own "back in 3.5 hours"
 * estimate, not a per-visit/per-render guess. Every maintenance message
 * site-wide (error.tsx, global-error.tsx, the DatabaseMaintenanceDialog,
 * any page-level fallback) reads this one constant, so they can never
 * disagree with each other - same "one real deadline, not N copies of a
 * guess" reasoning as Offering.saleEndsAt elsewhere in this codebase.
 *
 * Update this single line if the real ETA changes; everything downstream
 * follows automatically.
 */
export const DB_MAINTENANCE_UNTIL = new Date("2026-09-30T19:30:00Z");

/** "around 1:00 AM" style - IST, since that's the founder's own timezone and every real user of this site's. */
export function formatMaintenanceEta(): string {
  return DB_MAINTENANCE_UNTIL.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const MAINTENANCE_HEADLINE = "We're under maintenance";
export const MAINTENANCE_BODY = `We're doing maintenance on our database and expect to be back online by around ${formatMaintenanceEta()} IST. Everything else on the site works fine in the meantime - only sign-in, checkout, and account pages need it. Sorry for the inconvenience - reach out at team@stively.com if it's urgent.`;

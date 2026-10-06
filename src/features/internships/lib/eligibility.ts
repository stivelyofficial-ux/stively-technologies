/**
 * Which courses lead into the paid internship. Today only Frontend
 * Development does - every other course (e.g. Generative AI & Prompt
 * Engineering) is training only, with its own certificate and nothing after.
 * One list so the unlock logic, the course player, the certificate card and
 * the checkout promise can never disagree. To open another course up, add
 * its slug here (it also needs its own internship project templates).
 */
export const INTERNSHIP_OFFERING_SLUGS = ["frontend-development"] as const;

export function offeringHasInternship(slug: string | null | undefined): boolean {
  return !!slug && (INTERNSHIP_OFFERING_SLUGS as readonly string[]).includes(slug);
}

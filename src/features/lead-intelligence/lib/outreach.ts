/**
 * Cold-outreach logic for the Outreach queue: who is worth messaging, which
 * offer they get, and the WhatsApp message itself. Pure functions only (no
 * server-only imports) so the client queue can re-use buildWhatsAppUrl.
 *
 * Messages are templates filled from REAL data - the business name, city and,
 * for websites, a problem the analyzer actually measured. Never an invented
 * claim: the analyzer cannot judge visual design, so a weak-website message
 * only ever cites a measured load/security/search/contact problem.
 */

export const OUTREACH_SENDER_NAME = "Abhijit";

export type OutreachSegment = "NO_WEBSITE" | "WEAK_WEBSITE";

export const OUTREACH_SEGMENT_LABEL: Record<OutreachSegment, string> = {
  NO_WEBSITE: "No website - free sample offer",
  WEAK_WEBSITE: "Weak website - fix offer",
};

/** Minimal shape of the analyzer's stored `checks` Json that outreach reads. */
interface StoredFinding {
  label: string;
  passed: boolean;
  detail?: string;
}
interface StoredChecks {
  security?: { findings?: StoredFinding[] };
  seo?: { findings?: StoredFinding[] };
  performance?: { findings?: StoredFinding[] };
  business?: { findings?: StoredFinding[] };
}

export interface OutreachAnalysis {
  performanceScore: number | null;
  overallScore: number | null;
  checks: unknown;
}

/**
 * A mobile number that can plausibly have WhatsApp: 10 digits starting 6-9
 * (Indian mobiles), after stripping a +91 / 91 / leading-0 prefix. Landlines
 * (starting 0/1-5 after the area code) return null and are skipped. Returns
 * the digits in wa.me format (91XXXXXXXXXX).
 */
export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `91${digits}`;
}

/** Weak = slow/heavy page (performance proxy 50 or less) or a low overall score (under 60). */
export function isWeakWebsite(analysis: OutreachAnalysis): boolean {
  return (analysis.performanceScore ?? 100) <= 50 || (analysis.overallScore ?? 100) < 60;
}

/** Social pages and listing directories are not a business's own website - those businesses still need one. */
const NON_WEBSITE_HOSTS =
  /(^|.)(instagram|facebook|fb|linktr|linktree|justdial|indiamart|sulekha|wa|whatsapp|youtube|google|maps.app.goo)./i;

export function hasOwnWebsite(website: string | null | undefined): website is string {
  if (!website) return false;
  return !NON_WEBSITE_HOSTS.test(websiteHost(website));
}

export function pickSegment(
  business: { website: string | null },
  analysis: OutreachAnalysis | null
): OutreachSegment | null {
  if (!hasOwnWebsite(business.website)) return "NO_WEBSITE";
  if (analysis && isWeakWebsite(analysis)) return "WEAK_WEBSITE";
  return null;
}

function findFailed(
  checks: unknown,
  group: keyof StoredChecks,
  labelStart: string
): StoredFinding | undefined {
  const findings = (checks as StoredChecks | null)?.[group]?.findings ?? [];
  return findings.find((f) => !f.passed && f.label.startsWith(labelStart));
}

/** Up to two real, measured problems, phrased for a business owner (no jargon). Most impactful first. */
export function describeIssues(checks: unknown): string[] {
  const issues: string[] = [];

  const slow = findFailed(checks, "performance", "Responds in under");
  if (slow) {
    const ms = Number.parseInt(slow.detail ?? "", 10);
    issues.push(
      Number.isFinite(ms)
        ? `it takes about ${(ms / 1000).toFixed(1)} seconds to load`
        : "it loads slowly"
    );
  }
  if (findFailed(checks, "security", "Serves over HTTPS")) {
    issues.push('it shows a "Not secure" warning in browsers');
  }
  const heavy = findFailed(checks, "performance", "HTML payload");
  if (heavy && issues.length < 2) issues.push(`the page is heavy (${heavy.detail ?? "large"})`);
  if (findFailed(checks, "seo", "Has a meta description") && issues.length < 2) {
    issues.push("it is missing basic Google search setup");
  }
  if (findFailed(checks, "business", "Contact form") && issues.length < 2) {
    issues.push("it has no easy way for customers to contact you");
  }

  return issues.slice(0, 2);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function websiteHost(website: string): string {
  return website
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

export interface OutreachMessageInput {
  id: string;
  businessName: string;
  city: string | null;
  website: string | null;
  segment: OutreachSegment;
  checks: unknown;
}

/**
 * Builds the opening message. The variant is picked deterministically from
 * the business id, so a 100-message day is not 100 identical texts, yet
 * reopening the same business shows the same message.
 */
export function buildOutreachMessage(input: OutreachMessageInput): string {
  const name = input.businessName.trim();
  const where = input.city ? ` in ${input.city}` : "";
  const variant = hashString(input.id) % 3;
  const sign = `- ${OUTREACH_SENDER_NAME}, Stively`;

  if (input.segment === "NO_WEBSITE") {
    const variants = [
      `Hi, ${OUTREACH_SENDER_NAME} from Stively here. I couldn't find a website for ${name}${where}. We'd like to design a sample website for you, free of cost, ready in 2 days. If you like it, we can talk further. If not, that's completely fine and there are no charges. Shall I go ahead?\n${sign}`,
      `Hello, this is ${OUTREACH_SENDER_NAME} from Stively. Looks like ${name}${where} doesn't have a website yet. We'll make a sample design for you in 2 days at no cost. Only if you like it will we discuss anything further, otherwise no charges at all. Want to see it?\n${sign}`,
      `Hi, ${OUTREACH_SENDER_NAME} here from Stively. We build websites for local businesses, and we'd like to create a free sample website for ${name} in 2 days. No obligation: if you don't like it, you pay nothing. Can I send it over once it's ready?\n${sign}`,
    ];
    return variants[variant];
  }

  const host = input.website ? websiteHost(input.website) : "your website";
  const issues = describeIssues(input.checks);
  const issueText =
    issues.length > 0
      ? issues.join(" and ")
      : "I noticed a few things that could be working better";
  const variants = [
    `Hi, ${OUTREACH_SENDER_NAME} from Stively here. I had a quick look at ${name}'s website (${host}) and ${issueText}. We fix exactly this for businesses. I can send you a short free note on how to improve it. Would that help?\n${sign}`,
    `Hello, this is ${OUTREACH_SENDER_NAME} from Stively. I checked ${host} for ${name}${where}: ${issueText}. We can fix that, and we'd be happy to share a free quick report. Interested?\n${sign}`,
    `Hi, ${OUTREACH_SENDER_NAME} at Stively. While looking at ${host}, I found that ${issueText}. It's usually a quick fix and it brings in more customers. Shall I send a free summary of what to change?\n${sign}`,
  ];
  return variants[variant];
}

export function buildWhatsAppUrl(waNumber: string, message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

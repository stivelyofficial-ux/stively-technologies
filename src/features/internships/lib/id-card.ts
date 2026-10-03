/**
 * Intern ID: STV-<program code>-<4-digit running number>, e.g. STV-FEI-0042.
 * The number is InternshipTrack.sequence (stable, unique); the program code
 * says which internship it is. Plain functions - no server-only imports - so
 * the verification page, the card and scripts all derive it the same way.
 */
export function programCode(trackTitle: string): string {
  const t = trackTitle.toLowerCase();
  if (t.includes("frontend")) return "FEI";
  if (t.includes("ai") || t.includes("prompt")) return "AII";
  return "INT";
}

export function formatInternId(sequence: number, trackTitle: string): string {
  return `STV-${programCode(trackTitle)}-${String(sequence).padStart(4, "0")}`;
}

/** The running number out of an Intern ID, or null if it isn't one. */
export function parseInternId(id: string): number | null {
  const match = /^STV-[A-Z]{3}-(\d{1,9})$/i.exec(id.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export function formatCardDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

import { mentorWhatsappUrl } from "@/features/mentors/lib/whatsapp";

/**
 * The one WhatsApp line every student and intern sees for help - the business
 * number, never a mentor's personal mobile. Mentors' own numbers stay stored
 * on Mentor.whatsappNumber for admin use only.
 */
export const SUPPORT_WHATSAPP_NUMBER = "8010881507";

export type SupportSender =
  | { kind: "STUDENT"; name: string; course?: string | null; progress?: number | null }
  | { kind: "INTERN"; name: string; internId: string; program: string };

/**
 * The prefilled WhatsApp message. It states plainly whether the sender is a
 * STUDENT (still in the course) or an INTERN (with their Intern ID), so the
 * mentor knows who is writing and what to ask before replying.
 */
export function buildMentorMessage(
  sender: SupportSender,
  mentorName?: string | null,
  topic = "I need help with: "
): string {
  const first = mentorName?.trim().split(/\s+/)[0];
  const greeting = `Hi${first ? ` ${first}` : ""}, I'm ${sender.name}`;
  if (sender.kind === "INTERN") {
    return `${greeting}, a Stively INTERN (ID ${sender.internId} · ${sender.program}). ${topic}`;
  }
  const detail = sender.course
    ? ` (${sender.course}${sender.progress != null ? `, ${sender.progress}% complete` : ""})`
    : "";
  return `${greeting}, a Stively STUDENT${detail}. ${topic}`;
}

export function mentorSupportUrl(number: string, message: string): string {
  return mentorWhatsappUrl(number, message);
}

import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { formatInternId } from "@/features/internships/lib/id-card";
import {
  buildMentorMessage,
  SUPPORT_WHATSAPP_NUMBER,
  mentorSupportUrl,
  type SupportSender,
} from "../lib/mentor-whatsapp";

export interface MentorSupportContact {
  url: string;
  mentorName: string | null;
  kind: SupportSender["kind"];
  /** True when the link goes to the mentor (post-purchase), false for the founder's number. */
  isMentor: boolean;
}

/**
 * Where a signed-in learner's "Message on WhatsApp" goes: their mentor
 * (the supervisor), with a prefilled message that says whether they are a
 * student or an intern - but ONLY once they have bought a course (an active,
 * paused or completed enrollment, or a started internship). Anyone who has
 * not purchased yet - e.g. a signed-in account that never paid - keeps the
 * founder's number, exactly like the public pages.
 */
export async function getMentorSupportContact(topic?: string): Promise<MentorSupportContact> {
  const session = await auth();
  const userId = session?.user?.id;
  const name = session?.user?.name?.trim() || "a Stively learner";
  const purchased = userId
    ? (await prisma.offeringEnrollment.count({
        where: { studentId: userId, status: { in: ["ACTIVE", "PAUSED", "COMPLETED"] } },
      })) > 0 ||
      (await prisma.internshipTrack.count({
        where: { studentId: userId, onboardedAt: { not: null } },
      })) > 0
    : false;
  if (!purchased) {
    const text = `Hi Stively, ${topic ?? "I have a question."}`;
    return {
      url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      mentorName: null,
      kind: "STUDENT",
      isMentor: false,
    };
  }
  // Every learner gets the business line, never a mentor's personal number.
  // The mentor's name is deliberately not used: the message goes to the shared line.
  const number = SUPPORT_WHATSAPP_NUMBER;
  const mentorName = null;

  let sender: SupportSender = { kind: "STUDENT", name };
  if (userId) {
    const track = await prisma.internshipTrack.findFirst({
      where: { studentId: userId, onboardedAt: { not: null } },
      select: { sequence: true, title: true },
    });
    if (track) {
      sender = {
        kind: "INTERN",
        name,
        internId: formatInternId(track.sequence, track.title),
        program: track.title,
      };
    } else {
      const enrollment = await prisma.offeringEnrollment.findFirst({
        where: { studentId: userId },
        orderBy: { updatedAt: "desc" },
        select: { progressPercentage: true, offering: { select: { title: true } } },
      });
      sender = {
        kind: "STUDENT",
        name,
        course: enrollment?.offering.title ?? null,
        progress: enrollment?.progressPercentage ?? null,
      };
    }
  }

  return {
    url: mentorSupportUrl(number, buildMentorMessage(sender, mentorName, topic)),
    mentorName,
    kind: sender.kind,
    isMentor: false,
  };
}

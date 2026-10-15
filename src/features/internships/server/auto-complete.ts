import "server-only";

import { prisma } from "@/lib/prisma";
import { issueCompletionDocuments } from "@/features/internship-documents/server/issuance";
import { createNotification, notifyAllAdmins } from "@/features/notifications/server/creation";

const BATCH_SIZE = 25;

export interface AutoCompleteResult {
  completed: number;
  failed: number;
}

/**
 * Closes internships whose fixed period has ended. The period is set when the
 * internship starts (startedAt -> endsAt) and never moves, whether or not a
 * project is assigned, so reaching endsAt is the one thing that completes an
 * internship on its own - issuing the certificate and letters the same way an
 * admin marking it Completed does.
 *
 * Left alone on purpose:
 * - PAUSED internships: an admin paused those deliberately.
 * - A final project still SUBMITTED (awaiting review): the review closes the
 *   internship itself once the period is over (see reviewFinalSubmission).
 *
 * Each track is claimed with a conditional update (ACTIVE -> COMPLETED) before
 * its documents are issued, so a retried or overlapping run can never close or
 * announce the same internship twice.
 */
export async function completeExpiredInternships(): Promise<AutoCompleteResult> {
  const now = new Date();
  const due = await prisma.internshipTrack.findMany({
    where: {
      status: "ACTIVE",
      onboardedAt: { not: null },
      endsAt: { lte: now },
      NOT: { project: { finalStatus: "SUBMITTED" } },
    },
    select: { id: true, studentId: true, title: true, student: { select: { name: true } } },
    orderBy: { endsAt: "asc" },
    take: BATCH_SIZE,
  });

  let completed = 0;
  let failed = 0;
  const names: string[] = [];

  for (const track of due) {
    try {
      const claim = await prisma.internshipTrack.updateMany({
        where: { id: track.id, status: "ACTIVE" },
        data: { status: "COMPLETED", completedAt: now },
      });
      if (claim.count === 0) continue;

      await issueCompletionDocuments(track.id);
      await createNotification({
        userId: track.studentId,
        type: "FEEDBACK_RECEIVED",
        title: "Your internship is complete",
        body: "Your internship period has ended. Your completion certificate, letter of recommendation and experience letter are ready in Documents.",
        link: "/intern/documents",
      }).catch((error) => console.error("autoCompleteInternships: notify intern failed:", error));
      completed += 1;
      names.push(track.student.name ?? "an intern");
    } catch (error) {
      failed += 1;
      console.error(`autoCompleteInternships: track ${track.id} failed:`, error);
    }
  }

  if (completed > 0) {
    await notifyAllAdmins({
      type: "FEEDBACK_RECEIVED",
      title: `${completed} internship${completed === 1 ? "" : "s"} completed automatically`,
      body: `The period ended for ${names.join(", ")}. Certificates and letters were issued.`,
      link: "/admin/internships",
    }).catch((error) => console.error("autoCompleteInternships: notify admins failed:", error));
  }

  return { completed, failed };
}

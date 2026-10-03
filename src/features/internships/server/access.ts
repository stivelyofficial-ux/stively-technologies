import "server-only";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/session";
import { getInternshipTrackForStudent } from "./queries";

/**
 * Gate for every /intern page. Any signed-in STUDENT/INTERN reaches the
 * portal (middleware only checks the role); what actually unlocks it is
 * having an InternshipTrack, which exists only after finishing a course.
 *
 * - no track        -> `track: null` (the page renders its own "finish the course" state)
 * - track, not onboarded, `requireOnboarded` -> redirect to /intern/start
 */
export async function getInternContext(options: { requireOnboarded?: boolean } = {}) {
  const user = await requireUser();
  const track = await getInternshipTrackForStudent(user.id);
  if (track && !track.onboardedAt && options.requireOnboarded) redirect("/intern/start");
  return { user, track };
}

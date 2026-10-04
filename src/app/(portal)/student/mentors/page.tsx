import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/dashboard-shell/widgets/page-header";
import { getStudentMentors } from "@/features/mentors/server/queries";
import { MyMentorsList } from "@/features/mentors/components/student/my-mentors-list";

export const metadata: Metadata = { title: "My Mentors" };

export default async function StudentMentorsPage() {
  const user = await requireRole("STUDENT");
  // Mentors are internship supervisors: nothing to show until the internship has started.
  const isIntern =
    (await prisma.internshipTrack.count({
      where: { studentId: user.id, onboardedAt: { not: null } },
    })) > 0;
  if (!isIntern) redirect("/student/dashboard");
  const assignments = await getStudentMentors(user.id);

  return (
    <>
      <SetPageTitle title="My Mentors" />
      <Container className="flex flex-col gap-7 pt-7 pb-16 sm:pt-9">
        <PageHeader
          title="My Mentors"
          description="The mentors guiding you, and a place to message them."
        />
        <MyMentorsList assignments={assignments} />
      </Container>
    </>
  );
}

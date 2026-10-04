import Link from "next/link";
import { Users } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/sections/empty-state";
import { MentorAvatar } from "../shared/mentor-avatar";
import type { getMyAssignedStudents } from "../../server/queries";

type Assignment = Awaited<ReturnType<typeof getMyAssignedStudents>>[number];

function AssignedStudentsList({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students assigned yet"
        description="Students assigned to you by an admin will show up here."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => (
        <Link key={assignment.id} href={`/mentor/students/${assignment.studentId}`}>
          <Card variant="interactive" className="h-full">
            <CardHeader className="flex flex-row items-start gap-3">
              <MentorAvatar name={assignment.student.name} />
              <div className="flex flex-col gap-1">
                <CardTitle className="font-display">{assignment.student.name}</CardTitle>
                <CardDescription>{assignment.student.email}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="border-border/70 mt-auto flex flex-wrap gap-2 border-t pt-4">
              {assignment.student.internshipTracks[0]?.onboardedAt ? (
                <Badge variant="success">Intern</Badge>
              ) : (
                <Badge variant="secondary">In course</Badge>
              )}
              {assignment.student.offeringEnrollments.slice(0, 2).map((enrollment) => (
                <Badge key={enrollment.id} variant="outline">
                  {enrollment.offering.title} · {enrollment.progressPercentage}%
                </Badge>
              ))}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export { AssignedStudentsList };

import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { EmptyState } from "@/components/sections/empty-state";
import { ProjectPending } from "@/features/internships/components/intern/project-card";
import { TaskBoard } from "@/features/internships/components/intern/task-board";

export const metadata: Metadata = { title: "Tasks" };

export default async function InternTasksPage() {
  const { track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Your internship unlocks after you finish a course"
        description="Complete all lessons and quizzes of your training program - your tasks appear here."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }

  if (!track.project) return <ProjectPending />;

  return (
    <TaskBoard
      tasks={track.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        isAddon: t.isAddon,
        progress: t.progress,
      }))}
    />
  );
}

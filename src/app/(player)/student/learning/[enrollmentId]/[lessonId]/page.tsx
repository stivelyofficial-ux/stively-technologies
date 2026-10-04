import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/session";
import { getAccessPolicyForEnrollment } from "@/features/enrollments/server/access-policy";
import {
  getCurriculumForEnrollment,
  getLessonForStudent,
} from "@/features/learning/server/queries";
import { markLessonStarted } from "@/features/learning/actions/progress-actions";
import { flattenLessons, isLessonUnlocked } from "@/features/learning/lib/progress";
import { LessonViewer } from "@/features/learning/components/student/lesson-viewer";
import { LessonAssistantPanel } from "@/features/learning/components/student/lesson-assistant-panel";
import { PlayerHeader } from "@/features/learning/components/player/player-header";
import { PlayerShell } from "@/features/learning/components/player/player-shell";
import { Outline, type OutlineModule } from "@/features/learning/components/player/outline";

interface LessonPageProps {
  params: Promise<{ enrollmentId: string; lessonId: string }>;
  searchParams: Promise<{ item?: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { enrollmentId, lessonId } = await params;
  const user = await requireRole("STUDENT");
  const lessonView = await getLessonForStudent(lessonId, enrollmentId, user.id);
  return { title: lessonView?.lesson.title ?? "Lesson" };
}

/**
 * The course player. Access, ownership and unlock status are all
 * re-verified here - the outline's lock icons are display only, so a
 * hand-typed URL into gated content still bounces back to the course
 * overview rather than rendering it.
 *
 * The selected learning item rides in `?item=` so the browser back button
 * and a refresh both land exactly where the learner was, and every outline
 * entry is a real, shareable URL. Lives in the (player) route group (its own
 * focused chrome - see (player)/layout.tsx); the URL is unchanged.
 */
export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const user = await requireRole("STUDENT");
  const { enrollmentId, lessonId } = await params;
  const { item } = await searchParams;

  // Independent of each other's result - run together. getCurriculumForEnrollment and getLessonForStudent
  // are React cache()-wrapped (see queries.ts), so generateMetadata's own call dedupes into one execution.
  const [curriculum, lessonView, policy] = await Promise.all([
    getCurriculumForEnrollment(enrollmentId, user.id),
    getLessonForStudent(lessonId, enrollmentId, user.id),
    getAccessPolicyForEnrollment(enrollmentId, user.id),
  ]);
  if (!curriculum) notFound();
  if (!lessonView) notFound();
  if (!lessonView.isUnlocked) redirect(`/student/learning/${enrollmentId}`);

  if (
    lessonView.progress?.status !== "COMPLETED" &&
    lessonView.progress?.status !== "IN_PROGRESS"
  ) {
    await markLessonStarted(enrollmentId, lessonId);
  }

  // An unknown or missing ?item falls back to the lesson's first item rather than rendering nothing.
  const items = curriculum.itemsByLessonId.get(lessonId) ?? [];
  const activeItemId = items.some((i) => i.id === item) ? item : items[0]?.id;

  // ── Outline data: all lock / progress maths happens here, the client outline just renders it ──
  const orderedLessons = flattenLessons(curriculum.modules);
  const statusById = new Map(
    orderedLessons.map(
      (l) => [l.id, curriculum.progressByLessonId.get(l.id)?.status ?? "NOT_STARTED"] as const
    )
  );
  const modules: OutlineModule[] = curriculum.modules.map((module, index) => {
    const lessons = module.lessons.map((lesson) => {
      const orderIndex = orderedLessons.findIndex((l) => l.id === lesson.id);
      const previous = orderIndex > 0 ? orderedLessons[orderIndex - 1] : undefined;
      const unlocked = isLessonUnlocked(
        lesson,
        previous,
        previous ? statusById.get(previous.id) : undefined
      );
      const completed = statusById.get(lesson.id) === "COMPLETED";
      const lessonItems = curriculum.itemsByLessonId.get(lesson.id) ?? [];
      const isActiveLesson = lesson.id === lessonId;
      const dots = lessonItems.map((it) => {
        const done = it.quizPassed ?? completed;
        return done
          ? ("done" as const)
          : isActiveLesson && it.id === activeItemId
            ? ("current" as const)
            : ("todo" as const);
      });
      const first = lessonItems[0];
      return {
        id: lesson.id,
        title: lesson.title,
        href: `/student/learning/${enrollmentId}/${lesson.id}${first ? `?item=${first.id}` : ""}`,
        locked: !unlocked,
        active: isActiveLesson,
        completed,
        dots,
        minutes: lesson.estimatedMinutes ?? null,
      };
    });
    const doneLessons = module.lessons.filter((l) => statusById.get(l.id) === "COMPLETED").length;
    return {
      id: module.id,
      number: index + 1,
      title: module.title,
      doneLessons,
      totalLessons: module.lessons.length,
      minutes: module.lessons.reduce((sum, l) => sum + (l.estimatedMinutes ?? 0), 0),
      complete: module.lessons.length > 0 && doneLessons === module.lessons.length,
      active: module.lessons.some((l) => l.id === lessonId),
      comingSoon: module.lessons.length === 0,
      lessons,
    };
  });

  const allDots = modules.flatMap((m) => m.lessons.flatMap((l) => l.dots));
  const doneSteps = allDots.filter((d) => d === "done").length;
  const totalSteps = allDots.length;

  const outline = (
    <Outline
      modules={modules}
      doneSteps={doneSteps}
      totalSteps={totalSteps}
      percent={curriculum.progressPercentage}
      trailer={{
        unlocked:
          curriculum.totalLessons > 0 && curriculum.completedLessons === curriculum.totalLessons,
      }}
    />
  );

  return (
    <>
      <PlayerHeader
        courseTitle={curriculum.title}
        percent={curriculum.progressPercentage}
        user={user}
      />
      <PlayerShell outline={outline}>
        <LessonViewer
          enrollmentId={enrollmentId}
          curriculum={curriculum}
          lessonView={lessonView}
          activeItemId={activeItemId}
          // Keyed by lesson so the notes text and the tutor conversation reset cleanly when the learner moves on.
          studyTools={
            <LessonAssistantPanel key={lessonId} enrollmentId={enrollmentId} lessonId={lessonId} />
          }
          canViewCertificate={policy?.canViewCertificates ?? false}
          canDownloadResources={policy?.canDownloadResources ?? false}
        />
      </PlayerShell>
    </>
  );
}

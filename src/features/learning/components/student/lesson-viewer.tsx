import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Check, Lock, PartyPopper } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OutlineToggle } from "../player/player-shell";
import { BlockRenderer } from "./block-renderer";
import { LessonCompleteButton } from "./lesson-complete-button";
import { ItemTabLink } from "./item-tab-link";
import { ITEM_ICON } from "./course-sidebar";
import { flattenLessons, isLessonUnlocked } from "../../lib/progress";
import type { Curriculum, LessonView, CurriculumItem } from "../../server/queries";

/** One entry in the course-wide, item-level reading order the footer's Previous/Next walks. */
interface FlatItem {
  lessonId: string;
  itemId: string | null;
  lessonUnlocked: boolean;
}

/**
 * Builds the whole course as a single ordered list of learning items, so
 * Previous/Next can cross a lesson boundary the same way it moves between
 * a video and its reading. Lock state is evaluated per lesson using the
 * existing rule, so the footer can never offer a link into gated content.
 */
function buildReadingOrder(curriculum: Curriculum): FlatItem[] {
  const orderedLessons = flattenLessons(curriculum.modules);
  const statusByLessonId = new Map(
    orderedLessons.map(
      (l) => [l.id, curriculum.progressByLessonId.get(l.id)?.status ?? "NOT_STARTED"] as const
    )
  );

  return orderedLessons.flatMap((lesson, index): FlatItem[] => {
    const previous = index > 0 ? orderedLessons[index - 1] : undefined;
    const lessonUnlocked = isLessonUnlocked(
      lesson,
      previous,
      previous ? statusByLessonId.get(previous.id) : undefined
    );
    const items = curriculum.itemsByLessonId.get(lesson.id) ?? [];
    if (items.length === 0) return [{ lessonId: lesson.id, itemId: null, lessonUnlocked }];
    return items.map((item) => ({ lessonId: lesson.id, itemId: item.id, lessonUnlocked }));
  });
}

function hrefFor(enrollmentId: string, entry: FlatItem): string {
  const base = `/student/learning/${enrollmentId}/${entry.lessonId}`;
  return entry.itemId ? `${base}?item=${entry.itemId}` : base;
}

/** Short, human step names for the segmented control - the DB title is often long or generic. */
function stepLabel(item: CurriculumItem): string {
  switch (item.type) {
    case "VIDEO":
      return "Watch";
    case "MARKDOWN":
    case "RICH_TEXT":
      return "Read";
    case "QUIZ":
      return "Quiz";
    case "ASSIGNMENT":
    case "PROJECT":
      return "Practice";
    default:
      return item.title;
  }
}

/**
 * The course player's main column: breadcrumb and title, the lesson's steps
 * as a segmented control (Watch / Read / Quiz - one tap apart), the selected
 * learning item, then the study tools (notes + AI tutor). The footer is a
 * sticky Previous / Next bar, so the way forward is always one tap away
 * without scrolling to the bottom of a long reading.
 *
 * Completion belongs to the lesson (that's what LessonProgress tracks), so
 * "Mark as complete" appears once the learner is on the lesson's final item.
 *
 * At 2xl the study tools dock to the right of the lesson (sticky), so the
 * video, the notes and the AI chat are all on screen together; below that
 * they simply follow the lesson.
 */
function LessonViewer({
  enrollmentId,
  curriculum,
  lessonView,
  activeItemId,
  studyTools,
  canViewCertificate = false,
  canDownloadResources = false,
}: {
  enrollmentId: string;
  curriculum: Curriculum;
  lessonView: LessonView;
  activeItemId?: string;
  /** Notes + AI tutor card, rendered by the page (it's a Server Component with its own data). */
  studyTools: React.ReactNode;
  /** Whether this enrollment has cleared access-policy.ts's canViewCertificates gate - same check CertificateCard uses. */
  canViewCertificate?: boolean;
  /** access-policy.ts's canDownloadResources (Prime Membership) - threaded to BlockRenderer for the download buttons. */
  canDownloadResources?: boolean;
}) {
  const { lesson, blocks, progress, isUnlocked, moduleTitle, blockedByUnpassedQuiz } = lessonView;

  const items: CurriculumItem[] = curriculum.itemsByLessonId.get(lesson.id) ?? [];
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeItemId)
  );
  const activeItem: CurriculumItem | undefined = items[activeIndex];
  const activeBlock = activeItem ? blocks.find((b) => b.id === activeItem.id) : undefined;

  const moduleIndex = curriculum.modules.findIndex((m) =>
    m.lessons.some((l) => l.id === lesson.id)
  );
  const lessonCompleted = progress?.status === "COMPLETED";
  const isLastItemOfLesson = items.length === 0 || activeIndex === items.length - 1;

  const order = buildReadingOrder(curriculum);
  const position = order.findIndex(
    (entry) => entry.lessonId === lesson.id && entry.itemId === (activeItem?.id ?? null)
  );
  const previousEntry = position > 0 ? order[position - 1] : null;
  const nextEntry = position >= 0 && position < order.length - 1 ? order[position + 1] : null;
  const nextAvailable =
    !!nextEntry && (nextEntry.lessonId === lesson.id || nextEntry.lessonUnlocked);
  const nextIsNewLesson = !!nextEntry && nextEntry.lessonId !== lesson.id;

  // Real count - modules with no lessons recorded yet (see AD-026). Decides whether the "you've reached the end" reassurance applies.
  const upcomingModuleCount = curriculum.modules.filter((m) => m.lessons.length === 0).length;
  const caughtUpWithMoreComing = !nextEntry && lessonCompleted && upcomingModuleCount > 0;
  const courseFinished =
    curriculum.totalLessons > 0 && curriculum.completedLessons === curriculum.totalLessons;

  if (!isUnlocked) {
    return (
      <div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col px-4 py-10 sm:px-7">
        <div className="border-border bg-muted/30 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
          <span className="bg-muted flex size-11 items-center justify-center rounded-full">
            <Lock className="text-muted-foreground size-5" aria-hidden="true" />
          </span>
          <p className="text-foreground font-medium">This lesson is locked</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Complete the previous lesson and pass its quiz to unlock this one.
          </p>
        </div>
      </div>
    );
  }

  const nextLabel = nextIsNewLesson ? "Next lesson" : "Next";

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[880px] flex-1 px-4 pt-5 pb-10 sm:px-7 sm:pt-7 2xl:max-w-[1340px]">
        <div className="2xl:grid 2xl:grid-cols-[minmax(0,1fr)_380px] 2xl:items-start 2xl:gap-8">
          <article className="flex min-w-0 flex-col gap-5 sm:gap-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <OutlineToggle />
              {moduleIndex >= 0 && (
                <span className="text-primary text-[13px] font-semibold">
                  Module {moduleIndex + 1}
                </span>
              )}
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <span className="text-muted-foreground min-w-0 truncate text-[13px]">
                {moduleTitle}
              </span>
              {lessonCompleted && (
                <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  <Check className="size-3" aria-hidden="true" />
                  Completed
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-foreground text-[clamp(26px,3.4vw,36px)] leading-[1.15] font-bold tracking-tight text-balance">
                {lesson.title}
              </h2>
              {lesson.summary && (
                <p className="text-muted-foreground max-w-2xl text-[15px] text-pretty sm:text-base">
                  {lesson.summary}
                </p>
              )}
            </div>

            {/* ── Steps: the lesson's parts as a segmented control ── */}
            {items.length > 1 && (
              <nav
                aria-label="Lesson steps"
                className="bg-muted/60 border-border overflow-x-auto rounded-2xl border p-1.5"
              >
                <ul className="grid min-w-max auto-cols-fr grid-flow-col gap-2 sm:min-w-0">
                  {items.map((item, index) => {
                    const Icon = ITEM_ICON[item.type];
                    const isActive = index === activeIndex;
                    const done = item.quizPassed ?? lessonCompleted;
                    return (
                      <li key={item.id}>
                        <ItemTabLink
                          href={`/student/learning/${enrollmentId}/${lesson.id}?item=${item.id}`}
                          icon={
                            <Icon
                              className={cn("size-[19px] shrink-0", isActive && "text-primary")}
                              aria-hidden="true"
                            />
                          }
                          isActive={isActive}
                          index={index}
                          title={stepLabel(item)}
                          showIndex={false}
                          done={done}
                          doneIcon={
                            <Check
                              className="text-success size-[19px] shrink-0"
                              aria-hidden="true"
                            />
                          }
                          className={cn(
                            "flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                            isActive
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        />
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            {/* ── The selected learning item ── */}
            <div className="min-w-0">
              {activeBlock ? (
                <BlockRenderer
                  block={activeBlock}
                  enrollmentId={enrollmentId}
                  canDownload={canDownloadResources}
                  lessonAlreadyCompleted={lessonCompleted}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  This lesson doesn&apos;t have any content yet.
                </p>
              )}
            </div>

            {/* ── Completion ── */}
            {isLastItemOfLesson && (
              <div className="flex flex-wrap items-center gap-3">
                <LessonCompleteButton
                  enrollmentId={enrollmentId}
                  lessonId={lesson.id}
                  isCompleted={lessonCompleted}
                  blockedByUnpassedQuiz={blockedByUnpassedQuiz}
                />
              </div>
            )}

            {courseFinished && (
              <div className="bg-success/10 text-foreground flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
                <span className="text-success flex items-center gap-2.5 text-[15px] font-semibold">
                  <PartyPopper className="size-6" aria-hidden="true" />
                  Course complete - your internship is unlocked.
                </span>
                <Button asChild size="sm">
                  <Link href="/intern">Open Intern Portal</Link>
                </Button>
              </div>
            )}

            {/* Caught up, more on the way (AD-026): real count of unbuilt modules, shown only while it's > 0.
                The 24h framing is the founder's standing commitment to learners who reach this point. */}
            {caughtUpWithMoreComing && (
              <div className="border-primary/20 bg-primary/5 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
                <span className="bg-primary/10 flex size-11 items-center justify-center rounded-full">
                  <PartyPopper className="text-primary size-5" aria-hidden="true" />
                </span>
                <p className="text-foreground font-medium">
                  You&apos;re all caught up - nice work.
                </p>
                <p className="text-muted-foreground max-w-md text-sm text-pretty">
                  You&apos;ve completed every lesson available right now. We&apos;re recording the
                  remaining {upcomingModuleCount} module
                  {upcomingModuleCount === 1 ? "" : "s"} and adding them within 24 hours of you
                  reaching this point - you&apos;ll get an email the moment they&apos;re live. Until
                  then, practice what you&apos;ve learned on real prompts, or revisit a lesson to go
                  deeper.
                </p>
                {canViewCertificate && (
                  <Button asChild className="mt-1">
                    <Link href={`/student/learning/${enrollmentId}#certificate`}>
                      <Award aria-hidden="true" />
                      View your certificate
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </article>

          <aside className="mt-6 2xl:sticky 2xl:top-6 2xl:mt-0">{studyTools}</aside>
        </div>
      </div>

      {/* ── Sticky footer: Previous / hint / Next ── */}
      <nav
        aria-label="Lesson navigation"
        className="border-border bg-background sticky bottom-0 z-10 border-t"
      >
        <div className="mx-auto flex w-full max-w-[880px] items-center justify-between gap-3 px-4 py-3 sm:px-7 sm:py-3.5 2xl:max-w-[1340px]">
          {previousEntry ? (
            <Button variant="outline" asChild className="min-w-0">
              <Link href={hrefFor(enrollmentId, previousEntry)}>
                <ArrowLeft aria-hidden="true" />
                <span className="truncate">Previous</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <ArrowLeft aria-hidden="true" />
              Previous
            </Button>
          )}

          <span className="text-muted-foreground hidden min-w-0 flex-1 text-center text-[13px] text-pretty sm:block">
            {nextEntry
              ? nextAvailable
                ? `Step ${position + 1} of ${order.length}`
                : blockedByUnpassedQuiz
                  ? "Pass the quiz to unlock the next lesson."
                  : "Mark this lesson complete to continue."
              : upcomingModuleCount > 0
                ? "More modules coming soon."
                : "You've completed the course!"}
          </span>

          {nextEntry ? (
            nextAvailable ? (
              <Button asChild className="min-w-0">
                <Link href={hrefFor(enrollmentId, nextEntry)}>
                  <span className="truncate">{nextLabel}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button disabled>
                <Lock aria-hidden="true" />
                {nextLabel}
              </Button>
            )
          ) : (
            <Button variant="outline" disabled>
              {upcomingModuleCount > 0 ? "Coming soon" : "Finished"}
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}

export { LessonViewer };

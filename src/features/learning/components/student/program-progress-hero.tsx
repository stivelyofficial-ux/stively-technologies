import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

import type { EnrollmentWithOffering } from "@/features/enrollments/server/queries";
import type { Curriculum } from "../../server/queries";

/**
 * The top of a course's overview page - the same dark hero the dashboard
 * uses, driven by real curriculum data: a real "Continue learning"
 * destination, the real progress figure, the real duration and current
 * module.
 */
function ProgramProgressHero({
  enrollment,
  curriculum,
}: {
  enrollment: EnrollmentWithOffering;
  curriculum: Curriculum;
}) {
  const continueHref = curriculum.nextLesson
    ? `/student/learning/${enrollment.id}/${curriculum.nextLesson.id}`
    : null;
  const percent = enrollment.progressPercentage;
  const finished = enrollment.status === "COMPLETED";

  return (
    <div className="relative grid items-center gap-7 overflow-hidden rounded-[22px] bg-[#0F1B3D] p-6 text-white sm:p-8 lg:grid-cols-[1.3fr_1fr] dark:bg-[#16234A]">
      <div
        className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-[radial-gradient(circle,rgba(91,130,245,0.45),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-start gap-3.5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-1.5 text-[13px] font-semibold">
          {finished ? (
            <CheckCircle2 className="size-4 text-[#5EEAD4]" aria-hidden="true" />
          ) : (
            <BookOpen className="size-4 text-[#5EEAD4]" aria-hidden="true" />
          )}
          {finished ? "Completed" : "In progress"}
        </span>
        <h1 className="text-[clamp(26px,3.2vw,34px)] leading-tight font-bold tracking-tight">
          {curriculum.title}
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-[#C9D3EE]">
          {enrollment.offering.shortDescription}
        </p>
        {continueHref ? (
          <Link
            href={continueHref}
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#0F1B3D] transition-colors hover:bg-[#E6EDFD]"
          >
            {percent > 0 ? "Continue learning" : "Start learning"}{" "}
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        ) : (
          <span className="mt-1 inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-[15px] font-semibold text-white/80">
            All lessons complete
          </span>
        )}
      </div>

      <div className="relative flex flex-col gap-4 rounded-[14px] bg-white/[0.06] p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-semibold">Your progress</span>
          <span className="text-2xl font-bold tabular-nums">{percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#5EEAD4] transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-semibold tracking-wide text-[#A9B6DA] uppercase">
              Duration
            </dt>
            <dd className="font-medium">{enrollment.offering.duration ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-semibold tracking-wide text-[#A9B6DA] uppercase">
              Current module
            </dt>
            <dd className="font-medium">{enrollment.currentModule ?? "Not started yet"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export { ProgramProgressHero };

import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CheckCircle2, CircleDot, Circle, Rocket, AlertCircle } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { EmptyState } from "@/components/sections/empty-state";
import { ProjectPending } from "@/features/internships/components/intern/project-card";
import { FinalSubmitForm } from "@/features/internships/components/intern/final-submit-form";
import { computeTaskStats } from "@/features/internships/lib/stats";

export const metadata: Metadata = { title: "Final submission" };

function formatStamp(date: Date): string {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function InternSubmitPage() {
  const { track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Your internship unlocks after you finish a course"
        description="Complete all lessons and quizzes of your training program - your final submission opens here."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }
  if (!track.project) return <ProjectPending />;

  const project = track.project;
  const status = project.finalStatus;
  const canSubmit = status == null || status === "CHANGES_REQUESTED";
  const stats = computeTaskStats(track.tasks);
  const allCoreDone = stats.coreTotal > 0 && stats.coreDone === stats.coreTotal;

  const timeline = [
    {
      title: "Submitted",
      sub: project.finalSubmittedAt ? formatStamp(project.finalSubmittedAt) : "",
      state: "done" as const,
    },
    {
      title: "Review by your mentor",
      sub:
        status === "APPROVED"
          ? "Reviewed and approved"
          : status === "NOT_ELIGIBLE"
            ? "Reviewed - not eligible for the stipend"
            : "Usually within 2 working days",
      state:
        status === "APPROVED" || status === "NOT_ELIGIBLE"
          ? ("done" as const)
          : ("current" as const),
    },
    {
      title: "Approved · ₹3,000 stipend released",
      sub: "Paid to your registered bank account / UPI",
      state: status === "APPROVED" ? ("done" as const) : ("todo" as const),
    },
    {
      title: "Certificate & letters issued",
      sub: "Internship Certificate, Recommendation and Experience Letter",
      state: "todo" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Final submission</h1>
        <p className="text-muted-foreground">
          Build the whole project first, then submit it once with your live URL and GitHub
          repository. There is no task-by-task submission.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {canSubmit ? (
          <div className="bg-card border-border flex flex-col gap-5 rounded-2xl border p-7">
            <div className="flex items-center gap-2.5">
              <Rocket className="text-primary size-6" aria-hidden="true" />
              <h2 className="text-xl font-bold">{project.title}</h2>
            </div>
            {status === "CHANGES_REQUESTED" && project.finalFeedback && (
              <div className="bg-warning/15 flex gap-2.5 rounded-xl p-4 text-sm">
                <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
                <p className="text-pretty whitespace-pre-line">
                  <span className="font-semibold">Your reviewer asked for changes: </span>
                  {project.finalFeedback}
                </p>
              </div>
            )}
            <FinalSubmitForm isResubmit={status === "CHANGES_REQUESTED"} />
          </div>
        ) : (
          <div className="bg-card border-border flex flex-col gap-6 rounded-2xl border p-7">
            <div className="flex items-center gap-3">
              <span className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-bold">
                  {status === "APPROVED"
                    ? "Project approved"
                    : status === "NOT_ELIGIBLE"
                      ? "Not eligible for the stipend"
                      : "Project submitted"}
                </h2>
                {project.finalSubmittedAt && (
                  <span className="text-muted-foreground text-sm">
                    Submitted on {formatStamp(project.finalSubmittedAt)}
                  </span>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-[90px_1fr] gap-x-3.5 gap-y-2.5 text-[15px]">
              <dt className="text-muted-foreground">Live URL</dt>
              <dd>
                {project.finalLiveUrl && (
                  <Link
                    href={project.finalLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold break-all hover:underline"
                  >
                    {project.finalLiveUrl}
                  </Link>
                )}
              </dd>
              <dt className="text-muted-foreground">GitHub</dt>
              <dd>
                {project.finalRepoUrl && (
                  <Link
                    href={project.finalRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold break-all hover:underline"
                  >
                    {project.finalRepoUrl}
                  </Link>
                )}
              </dd>
              {project.finalNotes && (
                <>
                  <dt className="text-muted-foreground">Your note</dt>
                  <dd className="text-pretty whitespace-pre-line">{project.finalNotes}</dd>
                </>
              )}
            </dl>
            <ol className="flex flex-col">
              {timeline.map((step, i) => (
                <li key={step.title} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    {step.state === "done" ? (
                      <CheckCircle2 className="text-success size-6" aria-hidden="true" />
                    ) : step.state === "current" ? (
                      <CircleDot className="text-primary size-6" aria-hidden="true" />
                    ) : (
                      <Circle className="text-muted-foreground size-6" aria-hidden="true" />
                    )}
                    {i < timeline.length - 1 && <div className="bg-border min-h-4 w-0.5 flex-1" />}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-4">
                    <span className="text-[15px] font-semibold">{step.title}</span>
                    {step.sub && (
                      <span className="text-muted-foreground text-[13px]">{step.sub}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {status === "NOT_ELIGIBLE" && project.finalFeedback && (
              <div className="bg-destructive/10 flex gap-2.5 rounded-xl p-4 text-sm">
                <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
                <p className="text-pretty whitespace-pre-line">
                  <span className="font-semibold">Reviewer&apos;s note: </span>
                  {project.finalFeedback}
                </p>
              </div>
            )}
            {status === "APPROVED" && project.finalFeedback && (
              <p className="text-muted-foreground text-sm text-pretty whitespace-pre-line">
                {project.finalFeedback}
              </p>
            )}
          </div>
        )}

        <div className="bg-card border-border flex flex-col gap-3.5 rounded-2xl border p-6">
          <h3 className="text-lg font-bold">Before you submit</h3>
          {[
            {
              good: allCoreDone,
              title: "All core tasks marked done",
              sub: `${stats.coreDone} of ${stats.coreTotal} core tasks done`,
            },
            {
              good: true,
              title: "Live URL works",
              sub: "Open it in a private window and click through the whole flow",
            },
            {
              good: true,
              title: "README with screenshots",
              sub: "Setup steps, features and the live link in your repo",
            },
            {
              good: true,
              title: "Original work only",
              sub: "No AI tools were used on any part of the project",
            },
          ].map((check) => (
            <div key={check.title} className="flex items-start gap-3">
              {check.good ? (
                <CheckCircle2
                  className="text-success mt-0.5 size-[22px] shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="text-warning mt-0.5 size-[22px] shrink-0"
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{check.title}</span>
                <span className="text-muted-foreground text-[13px]">{check.sub}</span>
              </div>
            </div>
          ))}
          <div className="bg-primary/10 text-foreground mt-1.5 rounded-xl p-3.5 text-sm leading-relaxed font-medium">
            After approval you receive your <b>₹3,000 stipend</b>, Internship Certificate, Letter of
            Recommendation and Experience Letter in this portal.
          </div>
        </div>
      </div>
    </div>
  );
}

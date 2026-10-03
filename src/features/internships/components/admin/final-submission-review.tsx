"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { reviewFinalSubmission } from "../../actions/admin-actions";
import type { InternshipProject } from "@prisma/client";

const STATUS_VARIANT = {
  SUBMITTED: "default",
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
} as const;

/** Where the admin/mentor decides the intern's one final submission - approving makes the stipend payable (stipend terms, sections 4 and 6). */
function FinalSubmissionReview({
  trackId,
  project,
}: {
  trackId: string;
  project: InternshipProject;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState("");
  const [pending, setPending] = React.useState<"APPROVED" | "CHANGES_REQUESTED" | undefined>();
  const [error, setError] = React.useState<string | undefined>();
  const status = project.finalStatus;

  async function decide(decision: "APPROVED" | "CHANGES_REQUESTED") {
    setPending(decision);
    setError(undefined);
    const result = await reviewFinalSubmission({ trackId, status: decision, feedback });
    setPending(undefined);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setFeedback("");
    router.refresh();
  }

  if (!status) {
    return (
      <p className="text-muted-foreground text-sm">
        The intern hasn&apos;t submitted the final project yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={STATUS_VARIANT[status as keyof typeof STATUS_VARIANT] ?? "secondary"}>
          {status === "SUBMITTED"
            ? "Awaiting review"
            : status === "APPROVED"
              ? "Approved"
              : "Changes requested"}
        </Badge>
        {project.finalSubmittedAt && (
          <span className="text-muted-foreground text-xs">
            Submitted{" "}
            {project.finalSubmittedAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {project.finalLiveUrl && (
          <Link
            href={project.finalLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 hover:underline"
          >
            Live project <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        )}
        {project.finalRepoUrl && (
          <Link
            href={project.finalRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 hover:underline"
          >
            GitHub repository <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {project.finalNotes && (
        <p className="bg-muted rounded-md p-2 text-sm whitespace-pre-line">
          Intern&apos;s note: {project.finalNotes}
        </p>
      )}
      {project.finalFeedback && status !== "SUBMITTED" && (
        <p className="text-muted-foreground text-sm whitespace-pre-line">
          Feedback sent: {project.finalFeedback}
        </p>
      )}
      {status === "SUBMITTED" && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback (required if you request changes; shown to the intern)"
            className="min-h-[80px]"
          />
          {error && (
            <p role="alert" className="text-destructive text-xs">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              loading={pending === "APPROVED"}
              disabled={pending != null}
              onClick={() => decide("APPROVED")}
            >
              Approve - stipend eligible
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={pending === "CHANGES_REQUESTED"}
              disabled={pending != null}
              onClick={() => decide("CHANGES_REQUESTED")}
            >
              Request changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { FinalSubmissionReview };

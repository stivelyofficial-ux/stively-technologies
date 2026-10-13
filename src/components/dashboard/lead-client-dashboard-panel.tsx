"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LayoutDashboard, Mail } from "lucide-react";

import { createClientDashboardForLead } from "@/features/leads/actions/client-dashboard-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface LeadClientDashboardPanelProps {
  leadId: string;
  email: string | null;
  /** "none" = no client record yet or no invite; "invited" = invite sent, not accepted; "active" = the client has an account. */
  access: "none" | "invited" | "active";
}

/**
 * One place on the lead page to give a business client a dashboard. The
 * qualify step does this automatically; this button covers leads that were
 * qualified before the automation existed, a lost/expired invite (resend), and
 * "I want to do it now" without touching the status dropdown.
 */
function LeadClientDashboardPanel({ leadId, email, access }: LeadClientDashboardPanelProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | undefined>();
  const [error, setError] = React.useState<string | undefined>();

  async function handleClick() {
    setIsPending(true);
    setError(undefined);
    setMessage(undefined);
    const result = await createClientDashboardForLead(leadId);
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client dashboard</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {access === "active" ? (
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="text-foreground text-sm">
              The client has an account and can sign in to their dashboard.
            </span>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              {access === "invited"
                ? `An invite was emailed to ${email}, but they have not set up their account yet.`
                : email
                  ? `Create a dashboard for this client. We email ${email} a link to set a password and sign in.`
                  : "Add an email to this lead to create a client dashboard."}
            </p>
            <Button
              size="sm"
              loading={isPending}
              disabled={!email}
              onClick={handleClick}
              className="self-start"
            >
              {access === "invited" ? (
                <Mail className="size-4" aria-hidden="true" />
              ) : (
                <LayoutDashboard className="size-4" aria-hidden="true" />
              )}
              {access === "invited" ? "Resend invite" : "Create client dashboard"}
            </Button>
          </>
        )}
        {message && <p className="text-success text-sm">{message}</p>}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { LeadClientDashboardPanel };

import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, MessageCircle } from "lucide-react";

import { requireRole } from "@/lib/session";
import { MentorStatus } from "@/features/mentors/components/shared/mentor-status";
import { getMentorSupportContact } from "@/features/support/server/mentor-contact";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/dashboard-shell/widgets/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportQueryForm } from "@/features/support/components/student/support-query-form";

export const metadata: Metadata = { title: "Support" };

/**
 * Two real paths, not a link out to the public /contact lead form
 * (StudentQuery's whole reason to exist is that a signed-in student
 * shouldn't have to re-enter name/email/phone into a stranger-facing
 * form). WhatsApp for anything time-sensitive, the message form for
 * anything that reads better in writing - both reach the same person.
 */
export default async function StudentSupportPage() {
  await requireRole("STUDENT");
  const contact = await getMentorSupportContact("I have a question about my course: ");

  return (
    <>
      <SetPageTitle title="Support" />
      <Container className="flex flex-col gap-7 pt-7 pb-16 sm:pt-9">
        <PageHeader
          title="Need a hand with something?"
          description="Send us a message and a real person will get back to you - usually within a day."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-start gap-3">
              <span className="bg-success/10 text-success flex size-9 items-center justify-center rounded-lg">
                <MessageCircle className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-foreground text-sm font-semibold">WhatsApp</h2>
                <p className="text-muted-foreground text-sm">
                  Fastest way to reach {contact.isMentor ? `your mentor${contact.mentorName ? `, ${contact.mentorName}` : ""}` : "us"} - a real person replies.
                </p>
                {contact.isMentor && <MentorStatus />}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message on WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-start gap-3">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <LifeBuoy className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-foreground text-sm font-semibold">Send a message</h2>
                <p className="text-muted-foreground text-sm">
                  Prefer writing it out? We&apos;ll reply here or by email.
                </p>
              </div>
              <SupportQueryForm />
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}

import { MentorAvatar } from "@/features/mentors/components/shared/mentor-avatar";
import { WhatsAppButton } from "@/features/mentors/components/shared/whatsapp-button";
import { getPrimaryMentorForStudent } from "../../server/mentor-access";

/**
 * "Your mentor" on the intern overview: who reviews the final project, and a
 * direct WhatsApp chat so questions go to the mentor, not the founder.
 * Renders nothing until a mentor is assigned.
 */
async function MentorCard({ studentId }: { studentId: string }) {
  const mentor = await getPrimaryMentorForStudent(studentId);
  if (!mentor) return null;

  return (
    <section
      aria-label="Your mentor"
      className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-6"
    >
      <div className="flex min-w-0 items-center gap-4">
        <MentorAvatar
          name={mentor.user.name}
          photoUrl={mentor.profilePhotoUrl}
          className="size-14"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Your mentor
          </span>
          <span className="text-foreground text-lg font-bold">{mentor.user.name}</span>
          <span className="text-muted-foreground text-sm">
            {mentor.headline ?? "Reviews your final project and answers your questions"}
          </span>
        </div>
      </div>
      <WhatsAppButton number={mentor.whatsappNumber} mentorName={mentor.user.name} />
    </section>
  );
}

export { MentorCard };

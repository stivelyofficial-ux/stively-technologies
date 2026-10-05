import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { requireUser } from "@/lib/session";
import { MentorStatus } from "@/features/mentors/components/shared/mentor-status";
import { getMentorSupportContact } from "@/features/support/server/mentor-contact";

export const metadata: Metadata = { title: "Help Center" };

const QUESTIONS: [string, string][] = [
  [
    "Is there a deadline for each task?",
    "No. Work at your own pace and tick tasks off whenever you finish them. The only deadline is the end date of your internship, shown on your Overview.",
  ],
  [
    "How do I submit my project?",
    "Build the whole project first, then open Final submission and send your live URL and GitHub repository once. You can only resubmit if your reviewer asks for changes.",
  ],
  [
    "Can I use AI tools?",
    "No. The stipend requires 100% original work with no AI assistance of any kind. The full stipend terms are on the start screen and the course page.",
  ],
  [
    "When is the stipend paid?",
    "After your reviewer approves your final submission. Payment is made manually to your registered bank account or UPI.",
  ],
  [
    "What is my ID card for?",
    "It identifies you as a Stively intern. Anyone can scan its QR code to confirm it is genuine.",
  ],
];

export default async function InternHelpPage() {
  await requireUser();
  const contact = await getMentorSupportContact("I need help with: ");

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Answers for interns, and how to reach us.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="mailto:team@stively.com"
          className="border-border hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Mail className="size-4" aria-hidden="true" />
          team@stively.com
        </a>
        <a
          href={contact.url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp your mentor
        </a>
        <MentorStatus className="self-center" />
      </div>

      <ul className="flex flex-col gap-3">
        {QUESTIONS.map(([q, a]) => (
          <li
            key={q}
            className="bg-card border-border flex flex-col gap-1.5 rounded-2xl border p-5"
          >
            <span className="text-foreground text-base font-semibold">{q}</span>
            <span className="text-muted-foreground text-[15px] leading-relaxed text-pretty">
              {a}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

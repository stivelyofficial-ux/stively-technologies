import { Sparkles, NotebookPen } from "lucide-react";

import { auth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAiTutorConversation, getLessonNote } from "../../server/queries";
import { AiTutorChat } from "./ai-tutor-chat";
import { LessonNotes } from "./lesson-notes";

/**
 * "Study tools" - the lesson's notes and the AI Tutor in one card, always
 * available whichever learning item is active. Both tabs stay MOUNTED
 * (just hidden when inactive): switching to Notes and back used to throw
 * away the conversation on screen, which is the opposite of "alongside".
 * At 2xl the card docks to the right of the lesson (see LessonViewer) so
 * the video, the notes and the chat are all visible at once; below that it
 * sits under the lesson. Keyed by lessonId at the call site so state resets
 * cleanly when the learner moves to another lesson.
 */
async function LessonAssistantPanel({
  enrollmentId,
  lessonId,
}: {
  enrollmentId: string;
  lessonId: string;
}) {
  const session = await auth();
  const studentId = session?.user?.id;

  const [conversation, noteContent] = studentId
    ? await Promise.all([
        getAiTutorConversation(enrollmentId, lessonId, studentId),
        getLessonNote(enrollmentId, lessonId, studentId),
      ])
    : [null, ""];

  return (
    <section
      aria-label="Study tools"
      className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-4 sm:p-5"
    >
      <Tabs defaultValue="notes" className="flex flex-col gap-4">
        <TabsList className="bg-muted h-auto w-full rounded-full p-1">
          <TabsTrigger
            value="notes"
            className="flex-1 gap-1.5 rounded-full py-2 text-[13px] font-semibold"
          >
            <NotebookPen className="size-4" aria-hidden="true" />
            My notes
          </TabsTrigger>
          <TabsTrigger
            value="tutor"
            className="flex-1 gap-1.5 rounded-full py-2 text-[13px] font-semibold"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Ask AI tutor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" forceMount className="mt-0 data-[state=inactive]:hidden">
          <LessonNotes
            enrollmentId={enrollmentId}
            lessonId={lessonId}
            initialContent={noteContent}
          />
        </TabsContent>

        <TabsContent value="tutor" forceMount className="mt-0 data-[state=inactive]:hidden">
          <p className="text-muted-foreground mb-3 text-xs">
            Ask about this lesson - the tutor only answers questions grounded in what&apos;s covered
            here.
          </p>
          {conversation ? (
            <AiTutorChat
              enrollmentId={enrollmentId}
              lessonId={lessonId}
              initialMessages={conversation.messages}
              initialRemainingToday={conversation.remainingToday}
              dailyLimit={conversation.dailyLimit}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              The tutor isn&apos;t available right now.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

export { LessonAssistantPanel };

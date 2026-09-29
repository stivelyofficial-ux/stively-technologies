import { Sparkles, NotebookPen } from "lucide-react";

import { auth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAiTutorConversation, getLessonNote } from "../../server/queries";
import { AiTutorChat } from "./ai-tutor-chat";
import { LessonNotes } from "./lesson-notes";

/**
 * The reference design's persistent right-hand panel (2026-09-30 design
 * review) - "Ask the AI Tutor" moves here from being one of the lesson's
 * Watch/Read/Quiz tabs (see queries.ts's block query, which now excludes
 * AI_CONVERSATION from that list) to something always available regardless
 * of which item is active, plus a new Notes tab alongside it. Keyed by
 * lessonId at the call site so both tabs' state resets cleanly on
 * navigation instead of carrying stale content across lessons.
 */
async function LessonAssistantPanel({ enrollmentId, lessonId }: { enrollmentId: string; lessonId: string }) {
  const session = await auth();
  const studentId = session?.user?.id;

  const [conversation, noteContent] = studentId
    ? await Promise.all([
        getAiTutorConversation(enrollmentId, lessonId, studentId),
        getLessonNote(enrollmentId, lessonId, studentId),
      ])
    : [null, ""];

  return (
    <Tabs defaultValue="tutor" className="flex h-full flex-col">
      <TabsList className="w-full">
        <TabsTrigger value="tutor" className="flex-1 gap-1.5">
          <Sparkles className="size-3.5" aria-hidden="true" />
          AI Tutor
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex-1 gap-1.5">
          <NotebookPen className="size-3.5" aria-hidden="true" />
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutor" className="min-h-0 flex-1">
        <p className="text-muted-foreground mb-3 text-xs">
          Ask about this lesson - the tutor only answers questions grounded in what&apos;s covered here.
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
          <p className="text-muted-foreground text-sm">The tutor isn&apos;t available right now.</p>
        )}
      </TabsContent>

      <TabsContent value="notes" className="min-h-0 flex-1">
        <LessonNotes enrollmentId={enrollmentId} lessonId={lessonId} initialContent={noteContent} />
      </TabsContent>
    </Tabs>
  );
}

export { LessonAssistantPanel };

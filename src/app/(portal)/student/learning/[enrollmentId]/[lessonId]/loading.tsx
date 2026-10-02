/**
 * Shown the instant a lesson is opened (from the sidebar, pager or
 * "Continue learning") while the lesson's data loads - a lesson-shaped
 * placeholder instead of the generic dashboard cards from (portal)/loading.tsx.
 */
export default function LessonLoading() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6" role="status" aria-label="Loading lesson">
      <div className="bg-muted h-7 w-2/3 animate-pulse rounded-md" />
      <div className="bg-muted aspect-video w-full animate-pulse rounded-xl" />
      <div className="flex gap-2">
        <div className="bg-muted h-9 w-28 animate-pulse rounded-full" />
        <div className="bg-muted h-9 w-28 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-11/12 animate-pulse rounded" />
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
      </div>
      <span className="sr-only">Loading lesson</span>
    </div>
  );
}

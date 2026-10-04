/**
 * Shown the instant a lesson is opened - the same shape as the real player
 * (header, outline, lesson) so nothing jumps when the data arrives.
 */
export default function LessonLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" role="status" aria-label="Loading lesson">
      <div className="border-border flex h-[68px] shrink-0 items-center gap-4 border-b px-5">
        <div className="bg-muted h-7 w-24 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-48 animate-pulse rounded-md" />
        <div className="bg-muted ml-auto h-2 w-28 animate-pulse rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="border-border hidden w-[340px] shrink-0 flex-col gap-3 border-r p-5 lg:flex">
          <div className="bg-muted h-4 w-32 animate-pulse rounded" />
          <div className="bg-muted h-1.5 w-full animate-pulse rounded-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-12 w-full animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-7">
          <div className="bg-muted h-4 w-40 animate-pulse rounded" />
          <div className="bg-muted h-9 w-2/3 animate-pulse rounded-md" />
          <div className="bg-muted h-12 w-full animate-pulse rounded-2xl" />
          <div className="bg-muted aspect-video w-full animate-pulse rounded-2xl" />
          <span className="sr-only">Loading lesson</span>
        </div>
      </div>
    </div>
  );
}

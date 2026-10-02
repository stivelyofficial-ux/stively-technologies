"use client";

import * as React from "react";

import { formatPrice } from "@/lib/utils";
import { ReferralLinkCard } from "./referral-link-card";

export interface ShareableCourse {
  slug: string;
  title: string;
  reward: number;
  /** The referrer's own link, already landing on this course. */
  link: string;
}

/** Course picker + that course's link. More than one course shows selectable pills; one shows just the course. */
function CourseReferralLinks({ courses }: { courses: ShareableCourse[] }) {
  const [selectedSlug, setSelectedSlug] = React.useState(courses[0]?.slug);
  const selected = courses.find((c) => c.slug === selectedSlug) ?? courses[0];

  if (!selected) {
    return (
      <p className="text-muted-foreground text-sm">
        No course is open for referrals right now. Check back soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {courses.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Course to share">
          {courses.map((course) => (
            <button
              key={course.slug}
              type="button"
              role="radio"
              aria-checked={course.slug === selected.slug}
              onClick={() => setSelectedSlug(course.slug)}
              className={
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
                (course.slug === selected.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {course.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-foreground text-sm font-medium">{selected.title}</p>
      )}
      <p className="text-muted-foreground text-sm">
        You earn{" "}
        <span className="text-foreground font-semibold">{formatPrice(selected.reward)}</span> for
        every friend who enrolls through this link.
      </p>
      <ReferralLinkCard
        link={selected.link}
        shareText={`I'm learning ${selected.title} with Stively - check it out and enroll here: ${selected.link}`}
      />
    </div>
  );
}

export { CourseReferralLinks };

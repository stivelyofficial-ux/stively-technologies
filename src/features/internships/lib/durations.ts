import { addDaysIst, addMonthsIst, istDayDiff } from "@/lib/ist";

/** The internship lengths a student can choose at /intern/start. */
export const INTERNSHIP_DURATIONS = [
  {
    months: 1,
    label: "1 month",
    blurb: "One project, done well. The StivelyShop brief fits inside this.",
  },
  {
    months: 2,
    label: "2 months",
    blurb: "Room for the project plus extra polish and a second build.",
  },
  {
    months: 3,
    label: "3 months",
    blurb: "The full experience - the longest time on your portfolio and letters.",
  },
] as const;

export type InternshipDurationMonths = (typeof INTERNSHIP_DURATIONS)[number]["months"];

export function isValidDuration(months: number): months is InternshipDurationMonths {
  return INTERNSHIP_DURATIONS.some((d) => d.months === months);
}

/** The internship end date: `months` calendar months after `date`, in India time (31 Jan + 1 month = end of Feb). */
export function addMonths(date: Date, months: number): Date {
  return addMonthsIst(date, months);
}

/** Calendar date of "Day N" (Day 1 = the start date), in India time. */
export function dateOfDay(start: Date, day: number): Date {
  return addDaysIst(start, day - 1);
}

/** 1-based day number of `now` within an internship that began at `start`, counted in India calendar days. */
export function currentDay(start: Date, now: Date = new Date()): number {
  return istDayDiff(start, now) + 1;
}

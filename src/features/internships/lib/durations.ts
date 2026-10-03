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

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Calendar date of "Day N" (Day 1 = the start date). */
export function dateOfDay(start: Date, day: number): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + day - 1);
  return d;
}

/** 1-based day number of `now` within an internship that began at `start`. */
export function currentDay(start: Date, now: Date = new Date()): number {
  const ms = new Date(now.toDateString()).getTime() - new Date(start.toDateString()).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

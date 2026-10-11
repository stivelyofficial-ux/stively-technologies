/**
 * India Standard Time (UTC+5:30, no daylight saving) date helpers.
 *
 * Stively's interns, mentors and admins are all in India, but the server runs
 * in UTC (Vercel). Anything that said `date.toDateString()`, `toLocaleString()`
 * with no timeZone, `setMonth()` or `toISOString().slice(0, 10)` therefore
 * worked in UTC: "today" rolled over at 5:30 am IST instead of midnight,
 * timestamps showed 5.5 hours early, and an internship's day count and end
 * date could be off by one. Every "what day is it" / "what time is it" question
 * about an Indian user goes through here instead.
 *
 * Pure functions, no server-only imports - safe on server and client.
 */

export const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export interface IstParts {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/** The wall-clock fields of `date` as seen in India. */
export function istParts(date: Date): IstParts {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

/** The instant for the given India wall-clock fields (`month` is 1-12; out-of-range values roll over like Date.UTC). */
export function fromIstParts(
  parts: Partial<IstParts> & Pick<IstParts, "year" | "month" | "day">
): Date {
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0,
      parts.millisecond ?? 0
    ) - IST_OFFSET_MS
  );
}

/** Midnight at the start of `date`'s India calendar day. */
export function startOfDayIst(date: Date = new Date()): Date {
  const { year, month, day } = istParts(date);
  return fromIstParts({ year, month, day });
}

/** "2026-10-11": the India calendar date of `date`. */
export function istDateKey(date: Date = new Date()): string {
  const { year, month, day } = istParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The India calendar date of `date` stored as UTC midnight - the shape Prisma `@db.Date`-style report dates use, so it round-trips with `toISOString().slice(0, 10)`. */
export function istDateAsUtcMidnight(date: Date = new Date()): Date {
  const { year, month, day } = istParts(date);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Whole India calendar days from `from` to `to` (negative when `to` is earlier). Time of day is ignored. */
export function istDayDiff(from: Date, to: Date): number {
  const a = istParts(from);
  const b = istParts(to);
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS
  );
}

/**
 * `date` plus `months` calendar months in India time, keeping the time of day.
 * The day is clamped to the target month's length (31 Jan + 1 month = 28/29 Feb,
 * not 3 Mar as `Date#setMonth` would give).
 */
export function addMonthsIst(date: Date, months: number): Date {
  const p = istParts(date);
  const totalMonths = p.year * 12 + (p.month - 1) + months;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  const daysInTarget = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return fromIstParts({ ...p, year, month, day: Math.min(p.day, daysInTarget) });
}

/** `date` plus `days` calendar days in India time, keeping the time of day. */
export function addDaysIst(date: Date, days: number): Date {
  const p = istParts(date);
  return fromIstParts({ ...p, day: p.day + days });
}

/** "11 Oct 2026" */
export function formatIstDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  return date.toLocaleDateString("en-IN", { ...options, timeZone: IST_TIME_ZONE });
}

/** "11 Oct 2026, 3:42 pm" */
export function formatIstDateTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
): string {
  return date.toLocaleString("en-IN", { ...options, timeZone: IST_TIME_ZONE });
}

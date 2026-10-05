/** Mentor's working hours (India time), every day. Only a status label - nobody is blocked from messaging outside them. */
export const MENTOR_HOURS = { startHour: 9, endHour: 17, label: "9 AM - 5 PM IST" } as const;

/** Hour of day (0-23) in India right now, independent of the viewer's own timezone. */
function istHour(now: Date): number {
  return (
    Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(now)
    ) % 24
  );
}

export function isMentorActive(now: Date = new Date()): boolean {
  const h = istHour(now);
  return h >= MENTOR_HOURS.startHour && h < MENTOR_HOURS.endHour;
}

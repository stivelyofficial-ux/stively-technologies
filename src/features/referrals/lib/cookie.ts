import "server-only";

import { cookies } from "next/headers";

/** 30 days - long enough to cover "saw the link, bought the course three weeks later on payday," short enough that a stale click doesn't attribute someone's account forever. */
const REFERRAL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const REFERRAL_COOKIE_NAME = "stively_ref";

/** First-touch attribution: only the first referral link someone clicks gets credit, so this never overwrites an existing cookie. */
export async function setReferralCookieIfAbsent(code: string): Promise<boolean> {
  const store = await cookies();
  if (store.get(REFERRAL_COOKIE_NAME)) return false;
  store.set(REFERRAL_COOKIE_NAME, code, {
    maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return true;
}

export async function readReferralCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFERRAL_COOKIE_NAME)?.value;
}

export async function clearReferralCookie(): Promise<void> {
  const store = await cookies();
  store.delete(REFERRAL_COOKIE_NAME);
}

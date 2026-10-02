import "server-only";

import { randomBytes } from "crypto";

// No 0/O/1/I - the whole point of a referral code is someone reads it aloud
// or retypes it from a screenshot; ambiguous characters cause real support
// tickets ("it says invalid code but I typed exactly what's shown").
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 7;

/** A random, human-shareable referral code - not cryptographically tied to the user, just short and hard to guess in sequence (36^7 space, retried on collision by the caller). */
export function generateReferralCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Codes are stored and matched uppercase - a link typed or shared in lowercase still resolves. */
export function normalizeReferralCode(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * One shape for every code, generated or admin-chosen vanity (e.g.
 * "RAHUL10") - 4-20 letters/digits. Loose on purpose: generated codes
 * (7 chars, restricted alphabet) are a subset of this, and this is only a
 * cheap pre-check before touching the database with a ?ref= value from the URL.
 */
const CODE_PATTERN = /^[A-Z0-9]{4,20}$/;

export function isPlausibleReferralCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}

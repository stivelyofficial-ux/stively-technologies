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

/** Loose shape check before ever touching the database with a `?ref=` value from the URL. */
export function isPlausibleReferralCode(value: string): boolean {
  return new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`).test(value);
}

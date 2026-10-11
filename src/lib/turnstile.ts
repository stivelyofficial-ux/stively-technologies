import "server-only";

/** Turnstile is only enforced when both keys are configured - see verifyTurnstile. */
export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

let warned = false;

/**
 * Verifies a Cloudflare Turnstile token server-side. Never trust the widget
 * alone: the token must be checked with Cloudflare's siteverify endpoint using
 * the secret key. Tokens are single-use and expire after 5 minutes.
 *
 * When the keys are not configured (local dev, or before they are created)
 * this passes so the form keeps working - the honeypot in
 * submitStartProjectLead is still active - and logs one warning. Once both
 * TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY are set, a missing
 * or invalid token is rejected.
 */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!isTurnstileConfigured()) {
    if (!warned) {
      console.warn(
        "Turnstile keys are not set - /start-project is protected by the honeypot only."
      );
      warned = true;
    }
    return true;
  }
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY as string,
        response: token,
      }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

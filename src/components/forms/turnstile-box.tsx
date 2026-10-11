"use client";

import * as React from "react";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** True when a site key is configured - the form uses this to hold the submit button until a token exists. */
export const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    const done = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile unavailable"));
    if (window.turnstile) return done();

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", done);
      existing.addEventListener("error", () => reject(new Error("Turnstile failed to load")));
      return;
    }
    // Inserted by already-trusted app code, so the nonce + 'strict-dynamic' CSP allows it.
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = done;
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile, in "interaction-only" mode: the widget stays hidden and
 * solves itself in the background, and only appears if Cloudflare decides a
 * visitor needs to do something. The solved token is written to a hidden
 * `cf-turnstile-response` input that submitStartProjectLead verifies, and is
 * also reported through `onToken` so the form can hold the submit button until
 * the check has finished. Renders nothing when no site key is set. A token is
 * single-use, so a failed submit (`failedSubmit`) gets a fresh one.
 */
function TurnstileBox({
  failedSubmit,
  onToken,
}: {
  failedSubmit: object | null;
  onToken: (token: string) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [token, setToken] = React.useState("");
  const [loadFailed, setLoadFailed] = React.useState(false);

  const update = React.useCallback(
    (value: string) => {
      setToken(value);
      onToken(value);
    },
    [onToken]
  );

  React.useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: update,
          "expired-callback": () => update(""),
          "error-callback": () => update(""),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, update]);

  // Each submit result is a new object, so a failed one asks Cloudflare for a fresh token (tokens are single-use).
  React.useEffect(() => {
    if (failedSubmit && widgetIdRef.current !== null) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, [failedSubmit]);

  if (!siteKey) return null;

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} />
      <input type="hidden" name="cf-turnstile-response" value={token} readOnly />
      {loadFailed && (
        <p role="alert" className="text-destructive text-sm">
          The security check could not load (an ad blocker can cause this). Please refresh the page,
          or message us on WhatsApp instead.
        </p>
      )}
    </div>
  );
}

export { TurnstileBox };

"use client";

import { useEffect } from "react";

import { isDatabaseConnectivityError } from "@/lib/is-database-error";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

/**
 * Catches errors thrown by the root layout itself (fonts, providers, etc.)
 * where app/error.tsx can't help, since that only wraps content the layout
 * renders. Must render its own <html>/<body> - the root layout is the thing
 * that broke. No Tailwind classes here on purpose - if the layout itself
 * failed, don't assume its styling pipeline is trustworthy either; inline
 * styles keep this legible no matter what broke upstream.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError = isDatabaseConnectivityError(error);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {isDbError ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 600 }}>{MAINTENANCE_HEADLINE}</h1>
              <p style={{ color: "#666", maxWidth: 420 }}>{MAINTENANCE_BODY}</p>
            </>
          ) : (
            <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
          )}
          <button
            onClick={reset}
            style={{
              borderRadius: 8,
              background: "black",
              color: "white",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

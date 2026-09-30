"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { captureReferralClick } from "../actions/capture-click";

/**
 * Invisible - mounted once in the marketing layout so `?ref=CODE` is
 * captured no matter which public page someone actually lands on (a
 * referral link might point at the homepage, a specific course, anything).
 * The ref guard fires this at most once per code per browser tab, even if
 * React re-renders after the effect already ran.
 */
function ReferralCaptureListener() {
  const searchParams = useSearchParams();
  const code = searchParams.get("ref");
  const capturedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!code || capturedRef.current === code) return;
    capturedRef.current = code;
    void captureReferralClick(code);
  }, [code]);

  return null;
}

export { ReferralCaptureListener };

"use client";

import * as React from "react";

import { trackMetaCta } from "@/lib/meta-pixel";

/** An <a> to WhatsApp that reports a Meta Pixel "Contact" event on click. */
function WhatsAppTrackedLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackMetaCta("Contact", "whatsapp")}
    >
      {children}
    </a>
  );
}

export { WhatsAppTrackedLink };

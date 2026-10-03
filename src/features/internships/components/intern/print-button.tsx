"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Opens the browser's print dialog - choose "Save as PDF" there to keep a copy of the ID card. */
function PrintButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()} className="print:hidden">
      <Printer aria-hidden="true" />
      {label}
    </Button>
  );
}

export { PrintButton };

"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STIPEND_TERMS_TEXT } from "@/features/internships/lib/stipend-terms";

/**
 * Deliberately tiny and quiet - one line of text, one checkbox - so it
 * never competes with the actual Enroll button for attention. Only gates
 * eligibility for the ₹3,000/project internship stipend (fraud prevention:
 * original work only, one final submission, mentor review - see
 * stipend-terms.ts) - the course itself, certificate, offer letter etc.
 * are never conditioned on this. No server-side record of acceptance is
 * kept (out of scope for this pass) - this is a client-side gate on the
 * Enroll button only.
 */
function StipendTermsCheckbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <label htmlFor="stipend-terms" className="flex items-start gap-2 text-xs leading-snug">
        <Checkbox id="stipend-terms" checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} className="mt-0.5" />
        <span className="text-muted-foreground">
          I accept the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            className="text-primary underline underline-offset-2"
          >
            internship stipend terms
          </button>
        </span>
      </label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Internship Stipend Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <pre className="text-muted-foreground font-sans text-sm whitespace-pre-wrap">{STIPEND_TERMS_TEXT}</pre>
          <DialogFooter>
            <Button
              onClick={() => {
                onCheckedChange(true);
                setOpen(false);
              }}
            >
              I understand and accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { StipendTermsCheckbox };

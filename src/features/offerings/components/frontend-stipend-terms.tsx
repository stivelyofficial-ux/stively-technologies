import { STIPEND_TERMS_TEXT } from "@/features/internships/lib/stipend-terms";

/**
 * The internship stipend terms, published at the bottom of the course page
 * instead of as a tick-box in checkout (a mandatory checkbox right at the
 * payment step was costing completed purchases). Native <details> - no JS,
 * collapsed by default so it stays out of the way, one tap to read it all.
 * The course, certificate and offer letter never depend on these terms;
 * only eligibility for the per-project stipend does.
 */
function FrontendStipendTerms() {
  return (
    <div className="mx-auto max-w-[820px] px-5 pb-14">
      <details className="group rounded-2xl border bg-white" style={{ borderColor: "#D5E9E0" }}>
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-bold"
          style={{ color: "#0A2A22" }}
        >
          Internship stipend terms &amp; conditions
          <span className="text-sm font-semibold group-open:hidden" style={{ color: "#0E7C5A" }}>
            Read
          </span>
          <span
            className="hidden text-sm font-semibold group-open:inline"
            style={{ color: "#0E7C5A" }}
          >
            Hide
          </span>
        </summary>
        <pre
          className="max-h-[60vh] overflow-y-auto border-t px-5 py-4 font-sans text-sm leading-relaxed whitespace-pre-wrap"
          style={{ borderColor: "#D5E9E0", color: "#3C5A50" }}
        >
          {STIPEND_TERMS_TEXT}
        </pre>
      </details>
    </div>
  );
}

export { FrontendStipendTerms };

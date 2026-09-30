"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";

/**
 * A single-open accordion matching the reference design's exact chrome
 * (white rows on the light "QUESTIONS" section, plus/minus glyph swap) -
 * kept as its own small client island so the rest of frontend-course-landing.tsx
 * stays a Server Component.
 */
function FrontendLandingFaq({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="overflow-hidden rounded-[14px] bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-sans text-[17px] font-bold transition-colors hover:bg-[#EEF4F0]"
              style={{ color: "#0A1F1A" }}
            >
              {item.question}
              {isOpen ? (
                <Minus className="size-5 shrink-0" style={{ color: "#0E7C5A" }} aria-hidden="true" />
              ) : (
                <Plus className="size-5 shrink-0" style={{ color: "#0E7C5A" }} aria-hidden="true" />
              )}
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-[16px] leading-relaxed" style={{ color: "#33453D" }}>
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { FrontendLandingFaq };

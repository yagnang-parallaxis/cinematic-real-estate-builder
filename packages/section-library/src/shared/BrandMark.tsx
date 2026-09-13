"use client";

import { useId } from "react";

import { sealRingText } from "../navigation/logic";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20 4L23 16L35 12L26 20L35 28L23 24L20 36L17 24L5 28L14 20L5 12L17 16L20 4Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Circular wordmark around the mark. The ring itself is rotated by the
 * parent via `--seal-turn`; the star stays still.
 */
export function BrandSeal({ label, className }: { label: string; className?: string }) {
  const pathId = `brand-seal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const text = sealRingText(label);

  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <defs>
        <path
          id={pathId}
          d="M 60 60 m 0 -46 a 46 46 0 1 1 0 92 a 46 46 0 1 1 0 -92"
        />
      </defs>
      <text className="nav-logo-seal-text">
        <textPath href={`#${pathId}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

export function ScrollChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 24" fill="none" aria-hidden="true" className={className}>
      <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="1" />
      <path d="M2 14L8 20L14 14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

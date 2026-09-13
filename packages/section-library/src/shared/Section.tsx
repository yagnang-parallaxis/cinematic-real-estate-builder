import { cn } from "@cinematic/ui";
import type { ReactNode } from "react";

import { navContrastForTone, type SectionTone } from "./tone";

export interface SectionProps {
  id?: string;
  tone: SectionTone;
  /** Clip the section's own background at its boundary instead of letting it bleed. */
  clip?: boolean;
  /** Render a soft gradient handoff into the following section's tone. */
  seam?: SectionTone;
  className?: string;
  label?: string;
  children: ReactNode;
}

/**
 * The one shell every page section is built on. It owns the tone contract so
 * individual sections never set their own colours, and it exposes the tone to
 * the fixed navigation through `data-nav-tone`.
 */
export function Section({ id, tone, clip, seam, className, label, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      data-tone={tone}
      data-nav-tone={navContrastForTone(tone)}
      className={cn("section", clip && "section-clip", className)}
    >
      {children}
      {seam ? <div className="section-seam" data-seam-tone={seam} aria-hidden="true" /> : null}
    </section>
  );
}

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
  /**
   * Decorative layers in this section may enter the chrome band. The fixed
   * nav then gets the same scrim `on-media` uses, so the rail stays readable.
   */
  navScrim?: boolean;
  className?: string;
  label?: string;
  children: ReactNode;
}

/**
 * The one shell every page section is built on. It owns the tone contract so
 * individual sections never set their own colours, and it exposes the tone to
 * the fixed navigation through `data-nav-tone`.
 */
export function Section({
  id,
  tone,
  clip,
  seam,
  navScrim,
  className,
  label,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      data-tone={tone}
      data-nav-tone={navContrastForTone(tone)}
      data-nav-scrim={navScrim ? "" : undefined}
      className={cn("section", clip && "section-clip", className)}
    >
      {children}
      {seam ? <div className="section-seam" data-seam-tone={seam} aria-hidden="true" /> : null}
    </section>
  );
}

"use client";

import { cn } from "@cinematic/ui";
import type { ReactNode } from "react";

import { useEnquiry } from "./EnquiryProvider";

/**
 * Drop-in opener for any section that needs a "Book a call" without reaching
 * for the hook itself. The source is recorded with the enquiry.
 */
export function EnquiryTrigger({
  source,
  className,
  label,
  children,
}: {
  source?: string;
  className?: string;
  /** Accessible name, for triggers whose children are not plain text. */
  label?: string;
  children: ReactNode;
}) {
  const { open } = useEnquiry();

  return (
    <button
      type="button"
      className={cn("enquiry-trigger", className)}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={() => open(source)}
    >
      {children}
    </button>
  );
}

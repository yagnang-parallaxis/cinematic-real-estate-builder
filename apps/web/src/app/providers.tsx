"use client";

import { AnimationProvider } from "@cinematic/animation-engine";
import { EnquiryProvider, SmoothScroll } from "@cinematic/section-library";
import type { ReactNode } from "react";

import { PageTransition } from "./PageTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnimationProvider profile="cinematic">
      <EnquiryProvider>
        <SmoothScroll />
        {children}
        {/*
         * Mounted once, below the loading screen in the stack: arriving at the
         * homepage the loader is the cover, so the two never compete.
         */}
        <PageTransition content={{ style: "overlay-wipe", announcement: "%s" }} />
      </EnquiryProvider>
    </AnimationProvider>
  );
}

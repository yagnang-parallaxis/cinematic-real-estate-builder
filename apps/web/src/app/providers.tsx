"use client";

import { AnimationProvider } from "@cinematic/animation-engine";
import { SmoothScroll } from "@cinematic/section-library";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnimationProvider profile="cinematic">
      <SmoothScroll />
      {children}
    </AnimationProvider>
  );
}

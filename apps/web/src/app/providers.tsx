"use client";

import { AnimationProvider } from "@cinematic/animation-engine";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AnimationProvider profile="cinematic">{children}</AnimationProvider>;
}

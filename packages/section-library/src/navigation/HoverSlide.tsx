import { cn } from "@cinematic/ui";
import type { ReactNode } from "react";

export function HoverSlide({
  children,
  className,
  align = "end",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}) {
  return (
    <span
      className={cn(
        "hover-slide",
        align === "start" && "hover-slide-start",
        align === "center" && "hover-slide-center",
        className,
      )}
    >
      <span className="hover-slide-layer">{children}</span>
      <span className="hover-slide-layer hover-slide-layer-2" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

"use client";

import { cn } from "@cinematic/ui";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

/**
 * The recurring circular call to action. Within a small radius the label is
 * pulled toward the cursor and springs back on leave — a pointer-only
 * embellishment, so it is gated to the desktop breakpoint rather than left to
 * `:hover` support alone.
 */
export function CircleCta({
  label,
  href,
  onClick,
  size = "md",
  className,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const magnetic = useRef(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 992px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      magnetic.current = desktop.matches && !calm.matches;
      if (!magnetic.current) {
        ref.current?.style.removeProperty("--magnet-x");
        ref.current?.style.removeProperty("--magnet-y");
      }
    };

    sync();
    desktop.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, []);

  const pull = (event: MouseEvent<HTMLElement>) => {
    const element = ref.current;
    if (!element || !magnetic.current) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    element.style.setProperty("--magnet-x", `${(x * 18).toFixed(2)}px`);
    element.style.setProperty("--magnet-y", `${(y * 18).toFixed(2)}px`);
  };

  const release = () => {
    const element = ref.current;
    element?.style.setProperty("--magnet-x", "0px");
    element?.style.setProperty("--magnet-y", "0px");
  };

  const inner = (
    <>
      <span className="circle-cta-ring" aria-hidden="true" />
      <span className="circle-cta-label t-label">{children ?? label}</span>
    </>
  );

  const shared = {
    className: cn("circle-cta", `circle-cta-${size}`, className),
    onMouseMove: pull,
    onMouseLeave: release,
  };

  if (href) {
    return (
      <a
        {...shared}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      {...shared}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

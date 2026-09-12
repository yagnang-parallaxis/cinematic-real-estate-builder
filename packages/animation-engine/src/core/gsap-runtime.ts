import type { AnimationHandle, AnimationRuntime, EasingName, MotionDescriptor } from "./types";

const EASING_MAP: Record<EasingName, string> = {
  standard: "power1.inOut",
  easeOut: "power2.out",
  easeIn: "power2.in",
  easeInOut: "power2.inOut",
  softSpring: "back.out(1.4)",
  snap: "power4.out",
  linear: "none",
};

function splitText(element: HTMLElement, unit: "word" | "character"): HTMLElement[] {
  const source = element.textContent ?? "";
  const parts = unit === "word" ? source.split(/(\s+)/) : [...source];

  element.textContent = "";

  return parts.map((part) => {
    const span = document.createElement("span");
    span.style.display = unit === "word" ? "inline-block" : "inline-block";
    span.textContent = part === " " ? "\u00a0" : part;
    element.append(span);
    return span;
  });
}

export async function createGsapRuntime(): Promise<AnimationRuntime> {
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");

  gsap.registerPlugin(ScrollTrigger);

  return {
    play(target, descriptor: MotionDescriptor): AnimationHandle {
      if (!(target instanceof Element)) {
        return { kill() {} };
      }

      const element = target as HTMLElement;
      const tweens: Array<{ kill: () => void }> = [];

      const scrollTrigger =
        "trigger" in descriptor && descriptor.trigger === "on-scroll-enter"
          ? {
              trigger: element,
              start: `top ${Math.round((1 - ("threshold" in descriptor ? descriptor.threshold : 0.2)) * 100)}%`,
              once: true,
            }
          : undefined;

      if (descriptor.kind === "fade" || descriptor.kind === "reveal") {
        tweens.push(
          gsap.fromTo(element, descriptor.from, {
            ...descriptor.to,
            duration: descriptor.duration,
            delay: descriptor.delay,
            ease: EASING_MAP[descriptor.easing],
            stagger: descriptor.kind === "fade" ? descriptor.stagger : undefined,
            scrollTrigger,
          }),
        );
      }

      if (descriptor.kind === "scrub") {
        const axis =
          descriptor.direction === "left" || descriptor.direction === "right"
            ? "xPercent"
            : "yPercent";
        const sign = descriptor.direction === "down" || descriptor.direction === "right" ? 1 : -1;
        tweens.push(
          gsap.to(element, {
            [axis]: sign * 12 * descriptor.intensity,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }),
        );
      }

      if (descriptor.kind === "pin") {
        tweens.push(
          gsap.to(element, {
            scrollTrigger: {
              trigger: element,
              start: "top top",
              end: `+=${Math.round(descriptor.distance * 100)}%`,
              pin: true,
              scrub: true,
            },
          }),
        );
      }

      if (descriptor.kind === "counter") {
        const state = { value: descriptor.from };
        tweens.push(
          gsap.to(state, {
            value: descriptor.to,
            duration: descriptor.duration,
            ease: EASING_MAP[descriptor.easing],
            scrollTrigger,
            onUpdate() {
              element.textContent = String(Math.round(state.value));
            },
          }),
        );
      }

      if (descriptor.kind === "split-text") {
        const nodes = splitText(element, descriptor.unit);
        tweens.push(
          gsap.fromTo(
            nodes,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: descriptor.duration,
              delay: descriptor.delay,
              stagger: descriptor.stagger,
              ease: EASING_MAP[descriptor.easing],
              scrollTrigger,
            },
          ),
        );
      }

      if (descriptor.kind === "loop") {
        const distance = descriptor.direction === "right" ? 50 : -50;
        tweens.push(
          gsap.to(element, {
            xPercent: distance,
            duration: descriptor.duration,
            ease: "none",
            repeat: -1,
          }),
        );
      }

      return {
        kill() {
          tweens.forEach((tween) => tween.kill());
        },
      };
    },
  };
}

import { Animated } from "@cinematic/animation-engine";

import type { HeroContent } from "./types";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      <img
        src={content.imageSrc}
        alt={content.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="bg-linear-to-t from-background via-background/55 to-background/10 absolute inset-0" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-40 md:px-10 md:pb-20">
        <Animated type="textReveal" config={{ duration: 1 }} className="t-label text-primary">
          {content.place}
        </Animated>
        <Animated
          type="textReveal"
          config={{ duration: 1.1 }}
          as="h1"
          className="t-display max-w-5xl"
        >
          {content.heading}
        </Animated>
        <Animated
          type="fadeUp"
          config={{ duration: 0.8, delay: 0.15 }}
          className="t-lead text-foreground/80 max-w-xl"
        >
          {content.supporting}
        </Animated>
        <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.25 }}>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <a href={content.cta.href} className="t-label text-primary">
              {content.cta.label}
            </a>
            <a href="#story" className="t-caption text-muted-foreground">
              {content.scrollLabel}
            </a>
          </div>
        </Animated>
      </div>
    </section>
  );
}

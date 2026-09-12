import { Animated } from "@cinematic/animation-engine";

export interface ArchitectureContent {
  eyebrow: string;
  heading: string;
  quote: string;
  attribution: string;
  credit?: string;
  materials?: string;
  imageSrc: string;
  cta?: { label: string; href: string };
}

export function Architecture({ content }: { content: ArchitectureContent }) {
  return (
    <section id="architecture" data-nav-tone="on-dark" className="relative min-h-[100svh] overflow-hidden">
      <Animated
        type="parallax"
        config={{ intensity: 0.8, direction: "up" }}
        className="absolute inset-0"
      >
        <img
          src={content.imageSrc}
          alt=""
          className="h-[120%] w-full object-cover"
        />
      </Animated>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/25" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end gap-8 px-6 py-24 md:px-10">
        <Animated type="textReveal" className="t-label text-primary">
          {content.eyebrow}
        </Animated>
        <Animated type="textReveal" as="h2" className="t-display max-w-5xl">
          {content.heading}
        </Animated>
        <Animated type="fadeUp" config={{ duration: 0.8 }}>
          <blockquote className="t-lead max-w-2xl text-foreground/85">
            <p>{content.quote}</p>
            <footer className="t-caption text-muted-foreground mt-6">
              <cite className="not-italic">
                {content.attribution}
                {content.credit ? ` — ${content.credit}` : null}
              </cite>
            </footer>
          </blockquote>
        </Animated>
        {content.materials ? (
          <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.1 }}>
            <p className="t-body text-muted-foreground max-w-md">{content.materials}</p>
          </Animated>
        ) : null}
        {content.cta ? (
          <a href={content.cta.href} className="t-label text-primary hidden lg:inline-flex">
            {content.cta.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

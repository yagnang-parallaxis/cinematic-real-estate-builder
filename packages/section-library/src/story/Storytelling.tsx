import { Animated } from "@cinematic/animation-engine";

export interface StoryBeat {
  title: string;
  body: string;
}

export interface StoryContent {
  eyebrow: string;
  heading: string;
  imageSrc: string;
  imageAlt: string;
  beats: StoryBeat[];
}

export function Storytelling({ content }: { content: StoryContent }) {
  return (
    <section id="story" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <Animated type="imageReveal" config={{ duration: 1.1, direction: "left" }}>
          <img src={content.imageSrc} alt={content.imageAlt} className="aspect-4/5 w-full object-cover" />
        </Animated>
      </div>
      <div className="flex flex-col gap-16 pt-4">
        <div className="space-y-5">
          <Animated type="textReveal" className="t-label text-primary">
            {content.eyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" className="t-h1 max-w-lg">
            {content.heading}
          </Animated>
        </div>
        {content.beats.map((beat) => (
          <Animated key={beat.title} type="fadeUp" config={{ duration: 0.7 }}>
            <article className="space-y-3 border-t border-border pt-6">
              <h3 className="t-h3">{beat.title}</h3>
              <p className="t-body text-muted-foreground max-w-md">{beat.body}</p>
            </article>
          </Animated>
        ))}
      </div>
    </section>
  );
}

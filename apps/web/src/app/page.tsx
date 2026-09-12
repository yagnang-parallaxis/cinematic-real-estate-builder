const roles = [
  {
    role: "Label",
    className: "t-label",
    sample: "Aurelia Residences",
  },
  {
    role: "Display",
    className: "t-display",
    sample: "Quiet rooms above the water.",
  },
  {
    role: "Heading 1",
    className: "t-h1",
    sample: "A coastal house, edited slowly.",
  },
  {
    role: "Heading 2",
    className: "t-h2",
    sample: "Architecture as atmosphere",
  },
  {
    role: "Heading 3",
    className: "t-h3",
    sample: "Residences arranged around light",
  },
  {
    role: "Lead",
    className: "t-lead text-muted-foreground",
    sample:
      "Eighteen residences on a narrow harbor plot. Stone, timber, and long rooms that hold the afternoon.",
  },
  {
    role: "Body",
    className: "t-body text-muted-foreground",
    sample:
      "The prototype uses a display serif for headlines and a quiet sans for interface and reading. Sizes scale with the viewport so later sections inherit the same rhythm on desktop and mobile.",
  },
  {
    role: "Caption",
    className: "t-caption text-muted-foreground",
    sample: "Type specimen — global tokens only. No project sections yet.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-16 md:px-12">
      <header className="max-w-2xl space-y-4">
        <p className="t-label text-primary">Global typography</p>
        <h1 className="t-h1">The type system for the public prototype.</h1>
      </header>
      <ol className="space-y-10">
        {roles.map((item) => (
          <li
            key={item.role}
            className="border-border grid gap-3 border-t pt-6 md:grid-cols-[8rem_1fr]"
          >
            <p className="t-caption text-muted-foreground">{item.role}</p>
            <p className={item.className}>{item.sample}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}

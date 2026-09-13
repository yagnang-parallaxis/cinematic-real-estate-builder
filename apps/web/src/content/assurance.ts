import type { AssuranceContent } from "@cinematic/section-library";

export const assurance: AssuranceContent = {
  eyebrow: "Assurance",
  heading: "The facts behind the drawings",
  headingLines: ["The facts behind", "the drawings"],
  intro:
    "Who is building Aurelia, where the permits stand, and what has been poured so far. Every line here can be checked against a document.",
  exclusive: false,
  rows: [
    {
      id: "developer",
      title: "The developer",
      detail:
        "Aurelia is built by Halvard Estate, a family firm working this coastline since 1994. Eleven completed schemes, none of them larger than twenty-four homes. The same site manager has run the last four.",
    },
    {
      id: "sales",
      title: "Sales and marketing",
      detail:
        "Sales are handled by Meridian Harbour Partners from the office at 12 Harbor Path. One team, one price list, no intermediaries. Viewings are booked for the morning, when the light is on the water.",
    },
    {
      id: "planning",
      title: "Planning and permits",
      detail:
        "Outline consent was granted in March 2025 under reference NH/2025/0148. The building permit followed that June, with no conditions outstanding. Both documents travel with the reservation pack.",
    },
    {
      id: "construction",
      title: "Construction status",
      detail:
        "The frame is complete to the third floor and the roof closes in spring. First handovers are set for autumn 2027. A camera on the east crane runs through daylight hours.",
      link: {
        label: "Watch the site camera",
        href: "https://stream.aurelia-residences.example/harbour",
      },
    },
    {
      id: "deposits",
      title: "Deposits and warranty",
      detail:
        "Deposits are held in a client account at Nordbank and released against certified stages. Each residence carries a ten-year structural warranty and two years on the finishes.",
    },
  ],
  image: {
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=80",
    alt: "The north elevation in flat daylight, concrete frame and deep window reveals.",
    caption: "North elevation, September.",
  },
  note: "Figures current at 1 September 2026.",
};

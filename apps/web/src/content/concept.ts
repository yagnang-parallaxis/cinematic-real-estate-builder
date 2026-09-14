import type { ConceptContent } from "@cinematic/section-library";

export const concept: ConceptContent = {
  label: "The idea behind Aurelia",
  dragHint: "Drag to see more",
  intro: {
    tag: "Premise",
    eyebrow: "One site, read once",
    headingLines: ["Eighteen homes", "on one shoreline"],
    body:
      "Aurelia stands on the north bank, above a harbour that still works for a living. " +
      "Eighteen residences, three storeys, one stair. Nothing rises above the pines behind it.",
    aside: "Laid along the bank rather than across it.",
  },
  between: {
    tag: "Position",
    eyebrow: "Between two things",
    headingLines: ["Between the quay", "and the treeline"],
    poles: [
      {
        label: "The quay",
        body:
          "Boat sheds, a fuel pump, the six o'clock ferry. The water is in use from first light, " +
          "and the building sits close enough to hear it.",
      },
      {
        label: "The treeline",
        body:
          "Spruce and birch hold the slope behind. The last residence stops where the ridge path " +
          "starts, and the ground is left as it was found.",
      },
    ],
    imageSrc:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "A timber jetty on still water, with a treeline along the far shore.",
  },
  route: {
    tag: "The walk",
    eyebrow: "On foot",
    heading: "Eleven minutes, end to end",
    body:
      "Everything the harbour keeps sits inside a short walk. The line below follows the way it " +
      "is walked, along the water and up into the trees.",
    waypoints: [
      { id: "door", label: "Front door", detail: "0 min", x: 62, y: 330 },
      { id: "sheds", label: "Boat sheds", detail: "2 min", x: 270, y: 262 },
      { id: "quay", label: "Ferry quay", detail: "4 min", x: 452, y: 214 },
      { id: "market", label: "Market lane", detail: "6 min", x: 664, y: 276 },
      { id: "steps", label: "Bathing steps", detail: "8 min", x: 900, y: 190 },
      { id: "ridge", label: "Ridge path", detail: "11 min", x: 1138, y: 92 },
    ],
    footnote: "Times measured from the north entrance, at walking pace.",
  },
  floral: {
    introTopLeft: "/flowers/bougainvillea-flowers_01.webm",
    introBottomRight: "/flowers/bougainvillea-flowers_02.webm",
    routeTopRight: "/flowers/bougainvillea-flowers_07.webm",
  },
};

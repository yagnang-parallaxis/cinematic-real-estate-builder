import type { AmenityBrowserContent } from "@cinematic/section-library";

export const amenityBrowser: AmenityBrowserContent = {
  label: "Shared rooms",
  eyebrow: "Shared rooms",
  headingLines: ["Five rooms", "held in common"],
  tablistLabel: "Shared rooms at Aurelia",
  hint: "Drag the tabs",
  panels: [
    {
      id: "courtyard",
      name: "Courtyard",
      title: "The courtyard",
      description:
        "A walled lawn between the two blocks, planted with birch and shaded through the afternoon.",
      imageSrc:
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A dark timber house opening onto a lawn shaded by one mature tree.",
    },
    {
      id: "pool-terrace",
      name: "Pool terrace",
      title: "The pool terrace",
      description:
        "Eighteen metres of heated water on the south deck, open from April to the first frost.",
      imageSrc:
        "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A narrow lap pool along a timber deck under a low evening sky.",
    },
    {
      id: "bath-house",
      name: "Bath house",
      title: "The bath house",
      description: "A sauna, a cold plunge, and two changing rooms, one floor below the courtyard.",
      imageSrc:
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A dark tiled bathing room with a deep tub under a long clerestory window.",
    },
    {
      id: "long-table",
      name: "Long table",
      title: "The long table",
      description:
        "A kitchen and a table for twelve, booked by the night for the dinners a flat cannot hold.",
      imageSrc:
        "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A timber-lined dining room open along one side to the garden.",
    },
    {
      id: "guest-suite",
      name: "Guest suite",
      title: "The guest suite",
      description:
        "One room with its own bath and balcony, kept for visitors who stay more than an evening.",
      imageSrc:
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A guest bedroom with a glazed door onto a small balcony above the trees.",
    },
  ],
  cta: { label: "Arrange a visit", href: "#enquire" },
};

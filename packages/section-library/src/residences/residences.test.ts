import { describe, expect, it } from "vitest";

import {
  bedroomOptions,
  buildListingQuery,
  clampPhotos,
  filterResidences,
  filterSignature,
  findResidence,
  formatArea,
  formatBedrooms,
  formatFloor,
  formatOutdoor,
  formatResultCount,
  isEnquirable,
  isFiltered,
  MAX_RESIDENCE_PHOTOS,
  parseBedroomsParam,
  parseSortParam,
  parseTypeParam,
  photoCount,
  RESIDENCE_STATUSES,
  residenceMedia,
  selectResidences,
  similarResidences,
  sortResidences,
  statusLabel,
  typeOptions,
} from "./logic";
import type { Residence, ResidenceFilters, ResidencePhoto } from "./types";

const TYPES = ["garden", "harbor", "penthouse"] as const;

function photo(id: string): ResidencePhoto {
  return {
    id,
    src: `https://images.example.com/${id}.jpg`,
    alt: `The ${id}.`,
    caption: `A caption for the ${id}.`,
    room: id,
  };
}

function unit(overrides: Partial<Residence> = {}): Residence {
  const number = overrides.number ?? "011";
  return {
    slug: `no-${number}`,
    number,
    name: `No. ${number}`,
    type: "garden",
    typeLabel: "Garden residence",
    block: "Quay",
    floor: 0,
    floorLabel: "Garden level",
    bedrooms: 3,
    bathrooms: 2,
    interiorSqm: 132,
    outdoorSqm: 46,
    outdoorLabel: "Garden",
    orientation: "South-west, over the water",
    status: "available",
    completion: "Q2 2027",
    description: "Three bedrooms on one level, with a door onto the garden.",
    features: ["Private lower level", "Stone floors"],
    schematic: { src: "/plans/key-011.svg", alt: "Key plan.", caption: "Key plan." },
    plan: { src: "/plans/plan-011.svg", alt: "Floor plan.", caption: "Floor plan." },
    photos: [photo("living"), photo("kitchen")],
    ...overrides,
  };
}

const inventory: Residence[] = [
  unit({ number: "011", interiorSqm: 132, bedrooms: 3, type: "garden" }),
  unit({
    number: "111",
    interiorSqm: 99,
    bedrooms: 2,
    type: "harbor",
    typeLabel: "Harbor residence",
    floor: 1,
    status: "reserved",
  }),
  unit({
    number: "112",
    interiorSqm: 99,
    bedrooms: 2,
    type: "harbor",
    typeLabel: "Harbor residence",
    floor: 1,
    status: "sold",
  }),
  unit({
    number: "311",
    interiorSqm: 186,
    bedrooms: 4,
    type: "penthouse",
    typeLabel: "Penthouse residence",
    floor: 3,
  }),
];

const ALL: ResidenceFilters = { type: "all", bedrooms: "all" };

describe("parseTypeParam", () => {
  it("passes a type the inventory actually contains", () => {
    expect(parseTypeParam("harbor", TYPES)).toBe("harbor");
  });

  it("matches case-insensitively but returns the inventory's own spelling", () => {
    expect(parseTypeParam("PENTHOUSE", TYPES)).toBe("penthouse");
  });

  it("falls back to the full listing for an unknown, empty or absent type", () => {
    expect(parseTypeParam("chalet", TYPES)).toBe("all");
    expect(parseTypeParam("", TYPES)).toBe("all");
    expect(parseTypeParam(undefined, TYPES)).toBe("all");
    expect(parseTypeParam("all", TYPES)).toBe("all");
  });

  it("reads the first value of a repeated param", () => {
    expect(parseTypeParam(["garden", "harbor"], TYPES)).toBe("garden");
  });
});

describe("parseBedroomsParam", () => {
  it("passes a count the inventory contains", () => {
    expect(parseBedroomsParam("3", [2, 3, 4])).toBe(3);
  });

  it("falls back for a count nothing matches, or for nonsense", () => {
    expect(parseBedroomsParam("9", [2, 3, 4])).toBe("all");
    expect(parseBedroomsParam("two", [2, 3, 4])).toBe("all");
    expect(parseBedroomsParam(undefined, [2, 3, 4])).toBe("all");
    expect(parseBedroomsParam("all", [2, 3, 4])).toBe("all");
  });
});

describe("parseSortParam", () => {
  it("passes a known sort", () => {
    expect(parseSortParam("area-asc")).toBe("area-asc");
    expect(parseSortParam("area-desc")).toBe("area-desc");
  });

  it("falls back to the authored order", () => {
    expect(parseSortParam("price")).toBe("relevant");
    expect(parseSortParam(undefined)).toBe("relevant");
  });
});

describe("filter options", () => {
  it("lists each bedroom count once, ascending", () => {
    expect(bedroomOptions(inventory)).toEqual([2, 3, 4]);
  });

  it("lists each type once, in the authored order, with its label", () => {
    expect(typeOptions(inventory)).toEqual([
      { id: "garden", label: "Garden residence" },
      { id: "harbor", label: "Harbor residence" },
      { id: "penthouse", label: "Penthouse residence" },
    ]);
  });

  it("has nothing to offer for an empty inventory", () => {
    expect(bedroomOptions([])).toEqual([]);
    expect(typeOptions([])).toEqual([]);
  });
});

describe("filterResidences", () => {
  it("returns everything when both filters are open", () => {
    expect(filterResidences(inventory, ALL)).toHaveLength(4);
  });

  it("filters by type", () => {
    expect(
      filterResidences(inventory, { type: "harbor", bedrooms: "all" }).map((r) => r.number),
    ).toEqual(["111", "112"]);
  });

  it("filters by bedrooms", () => {
    expect(filterResidences(inventory, { type: "all", bedrooms: 4 }).map((r) => r.number)).toEqual([
      "311",
    ]);
  });

  it("applies both filters together", () => {
    expect(filterResidences(inventory, { type: "harbor", bedrooms: 4 })).toEqual([]);
  });
});

describe("sortResidences", () => {
  it("leaves the authored order alone for the default sort", () => {
    expect(sortResidences(inventory, "relevant").map((r) => r.number)).toEqual([
      "011",
      "111",
      "112",
      "311",
    ]);
  });

  it("orders by interior area, smallest first", () => {
    expect(sortResidences(inventory, "area-asc").map((r) => r.number)).toEqual([
      "111",
      "112",
      "011",
      "311",
    ]);
  });

  it("orders by interior area, largest first", () => {
    expect(sortResidences(inventory, "area-desc").map((r) => r.number)).toEqual([
      "311",
      "011",
      "111",
      "112",
    ]);
  });

  it("keeps equal areas in the authored order in both directions", () => {
    expect(
      sortResidences(inventory, "area-asc")
        .slice(0, 2)
        .map((r) => r.number),
    ).toEqual(["111", "112"]);
    expect(
      sortResidences(inventory, "area-desc")
        .slice(2)
        .map((r) => r.number),
    ).toEqual(["111", "112"]);
  });

  it("does not mutate the inventory it was handed", () => {
    const original = inventory.map((r) => r.number);
    sortResidences(inventory, "area-desc");
    expect(inventory.map((r) => r.number)).toEqual(original);
  });
});

describe("selectResidences", () => {
  it("filters and then sorts", () => {
    expect(
      selectResidences(inventory, { type: "harbor", bedrooms: 2 }, "area-desc").map(
        (r) => r.number,
      ),
    ).toEqual(["111", "112"]);
  });

  it("returns nothing when no unit matches", () => {
    expect(selectResidences(inventory, { type: "garden", bedrooms: 2 }, "relevant")).toEqual([]);
  });
});

describe("isFiltered", () => {
  it("is false only when every control sits at its default", () => {
    expect(isFiltered(ALL, "relevant")).toBe(false);
    expect(isFiltered({ type: "garden", bedrooms: "all" }, "relevant")).toBe(true);
    expect(isFiltered({ type: "all", bedrooms: 2 }, "relevant")).toBe(true);
    expect(isFiltered(ALL, "area-asc")).toBe(true);
  });
});

describe("filterSignature", () => {
  it("changes whenever any control changes", () => {
    const base = filterSignature(ALL, "relevant");
    expect(filterSignature(ALL, "relevant")).toBe(base);
    expect(filterSignature({ type: "garden", bedrooms: "all" }, "relevant")).not.toBe(base);
    expect(filterSignature(ALL, "area-asc")).not.toBe(base);
  });
});

describe("buildListingQuery", () => {
  it("leaves defaults out of the URL", () => {
    expect(buildListingQuery(ALL, "relevant")).toBe("");
  });

  it("writes only the controls that moved", () => {
    expect(buildListingQuery({ type: "garden", bedrooms: "all" }, "relevant")).toBe("?type=garden");
    expect(buildListingQuery({ type: "all", bedrooms: 3 }, "area-desc")).toBe(
      "?bedrooms=3&sort=area-desc",
    );
  });

  it("round-trips through the parsers", () => {
    const query = new URLSearchParams(
      buildListingQuery({ type: "penthouse", bedrooms: 4 }, "area-asc").slice(1),
    );
    expect(parseTypeParam(query.get("type") ?? undefined, TYPES)).toBe("penthouse");
    expect(parseBedroomsParam(query.get("bedrooms") ?? undefined, [2, 3, 4])).toBe(4);
    expect(parseSortParam(query.get("sort") ?? undefined)).toBe("area-asc");
  });
});

describe("formatters", () => {
  it("writes areas in whole square metres", () => {
    expect(formatArea(132)).toBe("132 m²");
    expect(formatArea(131.6)).toBe("132 m²");
  });

  it("writes the outdoor area as an addition", () => {
    expect(formatOutdoor(46)).toBe("+ 46 m²");
  });

  it("has an em dash for a missing or impossible area", () => {
    expect(formatArea(0)).toBe("—");
    expect(formatArea(Number.NaN)).toBe("—");
    expect(formatOutdoor(0)).toBe("—");
  });

  it("names floors in words", () => {
    expect(formatFloor(0)).toBe("Ground floor");
    expect(formatFloor(1)).toBe("First floor");
    expect(formatFloor(3)).toBe("Third floor");
  });

  it("falls back to a number past the named floors", () => {
    expect(formatFloor(9)).toBe("Floor 9");
    expect(formatFloor(-1)).toBe("1 below ground");
    expect(formatFloor(Number.NaN)).toBe("—");
  });

  it("agrees the bedroom count with its noun", () => {
    expect(formatBedrooms(1, "bedroom", "bedrooms")).toBe("1 bedroom");
    expect(formatBedrooms(3, "bedroom", "bedrooms")).toBe("3 bedrooms");
    expect(formatBedrooms(0, "bedroom", "bedrooms")).toBe("—");
  });
});

describe("status", () => {
  it("has words for every status the entity allows", () => {
    for (const status of RESIDENCE_STATUSES) {
      expect(statusLabel(status)).toMatch(/^[A-Z]/);
    }
    expect(RESIDENCE_STATUSES).toHaveLength(3);
  });

  it("always has words for a status, never only a colour", () => {
    expect(statusLabel("available")).toBe("Available");
    expect(statusLabel("reserved")).toBe("Reserved");
    expect(statusLabel("sold")).toBe("Sold");
  });

  it("stops offering a call on a unit that has gone", () => {
    expect(isEnquirable("available")).toBe(true);
    expect(isEnquirable("reserved")).toBe(true);
    expect(isEnquirable("sold")).toBe(false);
  });
});

describe("formatResultCount", () => {
  const wording = { one: "residence", many: "residences", none: "No residences" };

  it("agrees the count with its noun", () => {
    expect(formatResultCount(1, wording)).toBe("1 residence");
    expect(formatResultCount(18, wording)).toBe("18 residences");
  });

  it("says so in words when nothing matches", () => {
    expect(formatResultCount(0, wording)).toBe("No residences");
    expect(formatResultCount(Number.NaN, wording)).toBe("No residences");
  });
});

describe("findResidence", () => {
  it("finds a unit by slug, ignoring case and stray space", () => {
    expect(findResidence(inventory, "no-111")?.number).toBe("111");
    expect(findResidence(inventory, " NO-111 ")?.number).toBe("111");
  });

  it("finds nothing for an unknown or empty slug", () => {
    expect(findResidence(inventory, "no-999")).toBeUndefined();
    expect(findResidence(inventory, "  ")).toBeUndefined();
  });
});

describe("similarResidences", () => {
  it("offers units of the same type first", () => {
    expect(similarResidences(inventory, "no-111", 3).map((r) => r.number)).toEqual([
      "112",
      "011",
      "311",
    ]);
  });

  it("never offers the unit being viewed", () => {
    expect(similarResidences(inventory, "no-011").map((r) => r.slug)).not.toContain("no-011");
  });

  it("caps the row", () => {
    expect(similarResidences(inventory, "no-011", 2)).toHaveLength(2);
    expect(similarResidences(inventory, "no-011", 0)).toEqual([]);
  });

  it("falls back to the rest of the inventory for an unknown slug", () => {
    expect(similarResidences(inventory, "no-999", 2).map((r) => r.number)).toEqual(["011", "111"]);
  });
});

describe("clampPhotos", () => {
  it("keeps a valid list as it is", () => {
    const photos = [photo("living"), photo("kitchen")];
    expect(clampPhotos(photos)).toEqual(photos);
  });

  it("drops entries with no id or no source, and repeated ids", () => {
    const photos = [
      photo("living"),
      { ...photo("kitchen"), src: "  " },
      { ...photo(""), src: "https://x/y.jpg" },
      { ...photo("living"), room: "Second" },
    ];
    expect(clampPhotos(photos).map((entry) => entry.id)).toEqual(["living"]);
  });

  it("caps the list", () => {
    const photos = Array.from({ length: 9 }, (_, index) => photo(`shot-${index}`));
    expect(clampPhotos(photos)).toHaveLength(MAX_RESIDENCE_PHOTOS);
    expect(clampPhotos(photos, 2).map((entry) => entry.id)).toEqual(["shot-0", "shot-1"]);
    expect(clampPhotos(photos, 0)).toEqual([]);
  });
});

describe("residenceMedia", () => {
  const labels = { schematic: "Key plan", plan: "Floor plan" };

  it("puts the photographs first and the drawings last", () => {
    const items = residenceMedia(unit(), labels);
    expect(items.map((item) => item.label)).toEqual([
      "living",
      "kitchen",
      "Key plan",
      "Floor plan",
    ]);
  });

  it("contains the drawings and lets the photographs fill their frame", () => {
    const items = residenceMedia(unit(), labels);
    expect(items.map((item) => item.fit)).toEqual(["cover", "cover", "contain", "contain"]);
    expect(photoCount(items)).toBe(2);
  });

  it("leaves out a drawing that has no source", () => {
    const items = residenceMedia(unit({ schematic: { src: "", alt: "", caption: "" } }), labels);
    expect(items.map((item) => item.label)).toEqual(["living", "kitchen", "Floor plan"]);
  });

  it("gives every item a distinct id so the lightbox can key on it", () => {
    const items = residenceMedia(unit(), labels);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
  });
});

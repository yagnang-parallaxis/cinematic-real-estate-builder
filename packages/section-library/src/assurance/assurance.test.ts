import { describe, expect, it } from "vitest";

import {
  initialOpenRows,
  MAX_ASSURANCE_ROWS,
  moveFocusIndex,
  normalizeRows,
  rowHeaderId,
  rowPanelId,
  toggleOpenRows,
} from "./logic";
import type { AssuranceRow } from "./types";

const rows: AssuranceRow[] = [
  { id: "developer", title: "The developer", detail: "A family firm working this coastline." },
  { id: "sales", title: "Sales and marketing", detail: "One team, one price list." },
  { id: "planning", title: "Planning and permits", detail: "Consent granted, no conditions open." },
  {
    id: "construction",
    title: "Construction status",
    detail: "The frame is complete to the third floor.",
    link: { label: "Watch the site camera", href: "https://stream.example/harbour" },
  },
];

describe("toggleOpenRows", () => {
  it("opens a closed row alongside the rows already open", () => {
    expect(toggleOpenRows(["developer"], "sales")).toEqual(["developer", "sales"]);
  });

  it("closes a row that is already open and leaves the others", () => {
    expect(toggleOpenRows(["developer", "sales"], "developer")).toEqual(["sales"]);
  });

  it("returns to the starting set when the same row is toggled twice", () => {
    const start = ["developer", "sales"];
    expect(toggleOpenRows(toggleOpenRows(start, "planning"), "planning")).toEqual(start);
  });

  it("keeps only the pressed row when exclusive", () => {
    expect(toggleOpenRows(["developer", "sales"], "planning", true)).toEqual(["planning"]);
  });

  it("closes everything when the open row is pressed again while exclusive", () => {
    expect(toggleOpenRows(["planning"], "planning", true)).toEqual([]);
  });

  it("opens and closes the same row twice while exclusive", () => {
    const once = toggleOpenRows([], "sales", true);
    expect(once).toEqual(["sales"]);
    expect(toggleOpenRows(once, "sales", true)).toEqual([]);
  });

  it("does not mutate the set it is given", () => {
    const start = ["developer"];
    toggleOpenRows(start, "sales");
    expect(start).toEqual(["developer"]);
  });
});

describe("normalizeRows", () => {
  it("leaves a valid list unchanged", () => {
    expect(normalizeRows(rows)).toEqual(rows);
  });

  it("drops rows with a blank title", () => {
    const withBlank = [...rows, { id: "empty", title: "   ", detail: "Nothing to press." }];
    expect(normalizeRows(withBlank).map((row) => row.id)).not.toContain("empty");
  });

  it("drops a repeated id so two panels never share one aria-controls", () => {
    const duplicated = [...rows, { id: "sales", title: "Sales again", detail: "Repeat." }];
    expect(normalizeRows(duplicated)).toHaveLength(rows.length);
  });

  it("caps the list at the section maximum", () => {
    const many: AssuranceRow[] = Array.from({ length: 9 }, (_, index) => ({
      id: `row-${index}`,
      title: `Row ${index}`,
      detail: "Detail.",
    }));
    expect(normalizeRows(many)).toHaveLength(MAX_ASSURANCE_ROWS);
  });

  it("honours an explicit cap", () => {
    expect(normalizeRows(rows, 2)).toHaveLength(2);
  });
});

describe("initialOpenRows", () => {
  it("opens nothing by default", () => {
    expect(initialOpenRows(rows)).toEqual([]);
  });

  it("ignores ids that no surviving row owns", () => {
    expect(initialOpenRows(rows, ["planning", "finance"])).toEqual(["planning"]);
  });

  it("keeps a single row when exclusive", () => {
    expect(initialOpenRows(rows, ["developer", "sales"], true)).toEqual(["developer"]);
  });
});

describe("moveFocusIndex", () => {
  it("wraps in both directions", () => {
    expect(moveFocusIndex(3, 4, "ArrowDown")).toBe(0);
    expect(moveFocusIndex(0, 4, "ArrowUp")).toBe(3);
  });

  it("jumps to the ends", () => {
    expect(moveFocusIndex(2, 4, "Home")).toBe(0);
    expect(moveFocusIndex(2, 4, "End")).toBe(3);
  });

  it("ignores keys it does not own and empty lists", () => {
    expect(moveFocusIndex(1, 4, "Enter")).toBeNull();
    expect(moveFocusIndex(0, 0, "ArrowDown")).toBeNull();
  });
});

describe("row ids", () => {
  it("derives distinct header and panel ids", () => {
    expect(rowHeaderId("sales")).toBe("assurance-header-sales");
    expect(rowPanelId("sales")).toBe("assurance-panel-sales");
  });
});

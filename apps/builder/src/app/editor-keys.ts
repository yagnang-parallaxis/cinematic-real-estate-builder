import { SECTION_KEYS, type SectionKey } from "@cinematic/schemas";

/** Everything the centre column can edit: the two panels plus one per section. */
export type EditorKey = "identity" | "theme" | "residences" | SectionKey;

const SECTION_LABELS: Record<SectionKey, string> = {
  loading: "Loading screen",
  navigation: "Navigation",
  hero: "Hero",
  arch: "Arch reveal",
  story: "Storytelling",
  vista: "Vista",
  concept: "Concept",
  location: "Location",
  residenceTypes: "Residence types",
  amenityBrowser: "Amenities",
  interiors: "Interiors",
  architecture: "Architecture",
  assurance: "Assurance",
  residenceFigures: "Statement — figures",
  closingView: "Statement — closing",
  contact: "Contact",
  footer: "Footer",
  enquiry: "Enquiry modal",
};

export const EDITOR_KEYS: EditorKey[] = ["identity", "theme", ...SECTION_KEYS, "residences"];

export function editorLabel(key: EditorKey): string {
  if (key === "identity") {
    return "Identity";
  }
  if (key === "theme") {
    return "Theme";
  }
  if (key === "residences") {
    return "Residences";
  }
  return SECTION_LABELS[key];
}

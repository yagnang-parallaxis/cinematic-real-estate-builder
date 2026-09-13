/**
 * The Residence entity and the two content shapes built on it: the filterable
 * listing (component-library section 21) and the single-unit detail page
 * (section 20). Both read the same entity so a unit's facts are authored once.
 */

export type ResidenceStatus = "available" | "reserved" | "sold";

/** The listing's sort order. `relevant` is the authored order, untouched. */
export type ResidenceSort = "relevant" | "area-asc" | "area-desc";

export interface ResidencePhoto {
  id: string;
  src: string;
  /** Every photograph carries meaning here, so none of them are decorative. */
  alt: string;
  /** Shown under the photograph in the lightbox. */
  caption: string;
  /** Short room name shown beneath the thumbnail. */
  room: string;
}

/** A drawing rather than a photograph: it is never cropped to fill its frame. */
export interface ResidenceDrawing {
  src: string;
  /** Describes the drawing's facts, since it carries structure, not decoration. */
  alt: string;
  caption: string;
}

export interface Residence {
  slug: string;
  /** Unit number as printed on the plans, e.g. `"011"`. */
  number: string;
  /** Display name, e.g. `"No. 011"`. */
  name: string;
  /** Groups the unit under one of the homepage's residence types. */
  type: string;
  typeLabel: string;
  block: string;
  floor: number;
  floorLabel: string;
  bedrooms: number;
  bathrooms: number;
  interiorSqm: number;
  outdoorSqm: number;
  /** What the outdoor area is: a garden, a terrace, a solarium. */
  outdoorLabel: string;
  orientation: string;
  status: ResidenceStatus;
  completion: string;
  description: string;
  features: string[];
  /** Key plan: where the unit sits on its floor. Contain-fit. */
  schematic: ResidenceDrawing;
  /** Floor plan for the unit. Contain-fit. */
  plan: ResidenceDrawing;
  photos: ResidencePhoto[];
}

export interface ResidenceFilters {
  type: string | "all";
  bedrooms: number | "all";
}

export interface ResidenceTypeOption {
  id: string;
  label: string;
}

export interface ResidenceSortOption {
  id: ResidenceSort;
  label: string;
}

export interface ResidenceCrumb {
  label: string;
  href?: string;
}

export interface ResidenceGridContent {
  crumbs: ResidenceCrumb[];
  eyebrow: string;
  headingLines: string[];
  intro: string;
  /** Accessible name for the filter/sort control row. */
  controlsLabel: string;
  typeLabel: string;
  bedroomsLabel: string;
  sortLabel: string;
  allLabel: string;
  resetLabel: string;
  /** Count wording: `"residence"` / `"residences"` / the empty phrasing. */
  countOne: string;
  countMany: string;
  countNone: string;
  emptyHeading: string;
  emptyBody: string;
  bedroomsSuffixOne: string;
  bedroomsSuffixMany: string;
  types: ResidenceTypeOption[];
  sortOptions: ResidenceSortOption[];
  cardCtaLabel: string;
  /** Accessible name for the card list. */
  listLabel: string;
  residences: Residence[];
}

export interface ResidenceDetailContent {
  crumbs: ResidenceCrumb[];
  residence: Residence;
  similar: Residence[];
  /** Spec-row labels. */
  bedroomsLabel: string;
  bathroomsLabel: string;
  interiorLabel: string;
  outdoorLabel: string;
  blockLabel: string;
  floorLabel: string;
  orientationLabel: string;
  statusLabel: string;
  completionLabel: string;
  /** The two sub-panels in the info column. */
  infoTabLabel: string;
  benefitsTabLabel: string;
  featuresLabel: string;
  ctaLabel: string;
  viewPlanLabel: string;
  mediaLabel: string;
  infoLabel: string;
  lightboxLabel: string;
  expandLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  dragHint: string;
  similarEyebrow: string;
  similarHeadingLines: string[];
  backLabel: string;
  backHref: string;
}

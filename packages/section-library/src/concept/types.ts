export interface ConceptWaypoint {
  id: string;
  label: string;
  detail: string;
  /** Position on the authored route, in the plot's 1200 x 420 user space. */
  x: number;
  y: number;
}

export interface ConceptPole {
  label: string;
  body: string;
}

export interface ConceptIntroPanel {
  /** Short name shown on the panel rail. */
  tag: string;
  eyebrow: string;
  headingLines: string[];
  body: string;
  aside: string;
}

export interface ConceptBetweenPanel {
  tag: string;
  eyebrow: string;
  headingLines: string[];
  poles: [ConceptPole, ConceptPole];
  imageSrc: string;
  imageAlt: string;
}

export interface ConceptRoutePanel {
  tag: string;
  eyebrow: string;
  heading: string;
  body: string;
  waypoints: ConceptWaypoint[];
  footnote: string;
}

/** The four places the horizontal strip actually uses. */
export type ConceptFloralPlace =
  | "intro-top-left"
  | "intro-bottom-right"
  | "between-bottom-right"
  | "route-top-right";

export type ConceptFloralCorner = "top-left" | "top-right" | "bottom-right";

export type ConceptFloralPanel = "intro" | "between" | "route" | "seam";

/** A resolved still or clip for one of the three places. */
export interface ConceptFloralAccent {
  place: ConceptFloralPlace;
  corner: ConceptFloralCorner;
  src: string;
}

/**
 * The strip keeps flowers in four places: hanging from the intro's top-left,
 * a live clip on each track join, and hanging from the route's top-right.
 * Each bush sits on its join so half can show on the neighbouring slides.
 */
export interface ConceptFloral {
  introTopLeft?: string;
  introBottomRight?: string;
  betweenBottomRight?: string;
  routeTopRight?: string;
}

export interface ConceptContent {
  label: string;
  /** Affordance shown above the compact strip. */
  dragHint: string;
  intro: ConceptIntroPanel;
  between: ConceptBetweenPanel;
  route: ConceptRoutePanel;
  /** Optional clips for the floral seats (see `ConceptFloral`). */
  floral?: ConceptFloral;
}

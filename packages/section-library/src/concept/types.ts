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

/** The three corners the horizontal strip actually uses. */
export type ConceptFloralPlace = "intro-top-left" | "intro-bottom-right" | "route-top-right";

export type ConceptFloralCorner = "top-left" | "top-right" | "bottom-right";

export type ConceptFloralPanel = "intro" | "between" | "route" | "seam";

/** A resolved still or clip for one of the three places. */
export interface ConceptFloralAccent {
  place: ConceptFloralPlace;
  corner: ConceptFloralCorner;
  src: string;
}

/**
 * The strip keeps flowers in exactly three places, each travelling with its
 * own panel: hanging from the intro's top-left, a live clip stood upright
 * on the intro | between seam, and hanging from the route's top-right. The
 * bush sits on the join so half can show on each slide.
 */
export interface ConceptFloral {
  introTopLeft?: string;
  introBottomRight?: string;
  routeTopRight?: string;
}

export interface ConceptContent {
  label: string;
  /** Affordance shown above the compact strip. */
  dragHint: string;
  intro: ConceptIntroPanel;
  between: ConceptBetweenPanel;
  route: ConceptRoutePanel;
  /** Optional clips for the three floral seats (see `ConceptFloral`). */
  floral?: ConceptFloral;
}

export interface ConceptCta {
  label: string;
  href: string;
}

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

export interface ConceptClosePanel {
  tag: string;
  eyebrow: string;
  headingLines: string[];
  body: string;
  cta: ConceptCta;
}

export interface ConceptContent {
  label: string;
  kicker: string;
  /** Affordance shown above the compact strip. */
  dragHint: string;
  intro: ConceptIntroPanel;
  between: ConceptBetweenPanel;
  route: ConceptRoutePanel;
  close: ConceptClosePanel;
}

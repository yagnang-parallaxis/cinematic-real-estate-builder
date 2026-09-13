export interface AmenityPanel {
  id: string;
  /** Short label for the tab rail. */
  name: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface AmenityBrowserContent {
  label: string;
  eyebrow: string;
  headingLines: string[];
  tablistLabel: string;
  /** Shown only where the tab bar is swiped rather than scrolled. */
  hint: string;
  panels: AmenityPanel[];
  cta: { label: string; href: string };
}

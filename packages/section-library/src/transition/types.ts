/** How the overlay covers the outgoing page. */
export type PageTransitionStyle = "overlay-fade" | "overlay-wipe";

export interface PageTransitionContent {
  style?: PageTransitionStyle;
  /**
   * Spoken to assistive technology once the new page is in, so navigation is
   * never silent. `%s` is replaced with the new page's title.
   */
  announcement?: string;
}

/** Everything about a link click that decides whether the overlay plays. */
export interface NavigationIntent {
  href: string | null;
  /** The page the click happened on, as an absolute URL. */
  currentUrl: string;
  target?: string | null;
  download?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  /** 0 is the primary button; anything else is the browser's business. */
  button?: number;
  defaultPrevented?: boolean;
}

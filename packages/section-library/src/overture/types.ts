export interface OvertureContent {
  /** Short label set above the arch. */
  eyebrow: string;
  /** Two or three lines that unmask in turn. */
  lines: string[];
  /** The photograph framed by the arch. */
  imageSrc: string;
  imageAlt: string;
  /** Optional caption set against the arch's base. */
  caption?: string;
}

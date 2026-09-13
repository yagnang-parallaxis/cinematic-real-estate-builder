import type { SectionTone } from "../shared/tone";

export interface ArchRevealContent {
  id: string;
  /** The tone the arch carries in. Match it to the section that follows. */
  tone: SectionTone;
  /** Accessible name for the transition. */
  label: string;
  /**
   * Set along the arch's curve. It has to fit an arc, so keep it to a few
   * words — long lines crowd the apex and start to overlap themselves.
   */
  curvedText: string;
  /**
   * Multiplier for space between words on the curve. `1` is the default rise;
   * raise it to spread words further apart as the arch grows, lower it to keep
   * them tighter.
   */
  curvedWordSpacing?: number;
  /** The photograph the arch rises over. Omit when a parent already supplies it. */
  backdropSrc?: string;
  backdropAlt?: string;
  /**
   * The tone of the section above. The photograph is faded out of it at the
   * top of the stage, so the handoff into the arch is a dissolve rather than a
   * hard horizontal cut.
   */
  enterFrom?: SectionTone;
  /** Small caps either side of the mark, inside the arch. */
  leftCaption?: string;
  rightCaption?: string;
  /** One entry per line, beneath the rule. */
  tagline?: string[];
}

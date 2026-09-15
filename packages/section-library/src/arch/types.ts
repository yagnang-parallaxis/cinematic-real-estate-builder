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
   * How far the words open along the curve, 0 to 1. `1` takes them to the
   * coverage the reference's closed dome measures by the end of the rise; `0`
   * leaves the line at its own width for the whole of it.
   *
   * It cannot spread the words past the arc or past that coverage, so there is
   * no value of it that clips the line or crowds the rim.
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

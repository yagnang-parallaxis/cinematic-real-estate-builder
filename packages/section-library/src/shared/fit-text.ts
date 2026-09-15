/**
 * Auto-fit-to-measure for the display tier.
 *
 * The reference language sets its big headings at one aspirational size and
 * lets the rendered size fall back only as far as the copy needs, so a short
 * name and a long one both span the measure rather than one of them wrapping
 * or bleeding past the gutter. A builder makes that mandatory rather than nice
 * to have: clone content is arbitrary, and a fixed display size that fits
 * "Aurelia" will not fit a four-word development name.
 *
 * The geometry is kept here, away from the DOM, so it can be tested directly.
 */

/**
 * Smallest fraction of the token size a display line may be reduced to. Below
 * this the heading has stopped reading as a display tier at all, and wrapping
 * the copy is the better answer than shrinking it further.
 */
export const FIT_FLOOR = 0.34;

/**
 * Scale to apply to the token font size so `natural` fits inside `available`.
 *
 * Never returns more than 1: this shrinks an oversized line, it does not
 * inflate a short one past the tier it was assigned.
 */
export function fitScale(natural: number, available: number, floor = FIT_FLOOR): number {
  if (!Number.isFinite(natural) || !Number.isFinite(available)) {
    return 1;
  }
  if (natural <= 0 || available <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(floor, available / natural));
}

/**
 * Rounded so a resize that moves the measure by a pixel does not rewrite the
 * custom property on every frame.
 */
export function quantiseScale(scale: number, steps = 200): number {
  return Math.round(scale * steps) / steps;
}

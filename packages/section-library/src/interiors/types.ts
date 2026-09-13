export interface InteriorImage {
  id: string;
  src: string;
  /** Every photograph here carries meaning, so none of them are decorative. */
  alt: string;
  /** Shown under the photograph inside the lightbox. */
  caption: string;
  /** Short room name shown beneath the thumbnail. */
  room: string;
}

export interface InteriorsContent {
  eyebrow: string;
  /** The fixed opening phrase. The rotating word completes the sentence. */
  headingPrefix: string;
  rotatingWords: string[];
  /** Dwell time per rotating word; clamped by `clampRotationMs`. */
  rotationMs?: number;
  body: string;
  /** Accessible name for the section. */
  galleryLabel: string;
  /** Accessible name for the full-screen lightbox. */
  lightboxLabel: string;
  expandLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  dragHint: string;
  images: InteriorImage[];
}

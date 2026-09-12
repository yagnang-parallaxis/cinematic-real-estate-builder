import { describe, expect, it } from "vitest";

import { getAnimationMeta, listAnimationTypes } from "../index";

describe("animation registry", () => {
  it("exposes every catalogue primitive plus none", () => {
    expect(listAnimationTypes()).toEqual([
      "none",
      "fade",
      "fadeUp",
      "fadeDown",
      "slide",
      "scale",
      "imageZoom",
      "imageReveal",
      "clipPathReveal",
      "textReveal",
      "wordReveal",
      "characterReveal",
      "parallax",
      "horizontalScroll",
      "stickyStorytelling",
      "pinnedSection",
      "carousel",
      "marquee",
      "counter",
      "menuReveal",
      "pageTransition",
    ]);
  });

  it("marks parallax as a continuous effect the builder can warn about", () => {
    expect(getAnimationMeta("parallax")).toMatchObject({
      type: "parallax",
      continuous: true,
      family: "continuous",
    });
  });

  it("marks fade as a one-time effect", () => {
    expect(getAnimationMeta("fade")).toMatchObject({
      type: "fade",
      continuous: false,
      family: "one-time",
    });
  });
});

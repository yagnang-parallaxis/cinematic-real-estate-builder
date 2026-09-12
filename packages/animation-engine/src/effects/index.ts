import type { EffectDefinition } from "../core/types";
import { fadeEffects } from "./fade";
import { horizontalEffects } from "./horizontal";
import { parallaxEffect } from "./parallax";
import { revealEffects } from "./reveal";
import { scaleEffect } from "./scale";
import { stickyEffects } from "./sticky";
import { textEffects } from "./text";

export const effects: EffectDefinition[] = [
  ...fadeEffects,
  scaleEffect,
  ...revealEffects,
  ...textEffects,
  parallaxEffect,
  ...horizontalEffects,
  ...stickyEffects,
];

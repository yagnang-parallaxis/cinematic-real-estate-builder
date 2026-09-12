import { effects } from "../effects";
import {
  ANIMATION_TYPES,
  type AnimationMeta,
  type AnimationType,
  type EffectDefinition,
} from "./types";

const effectByType = new Map<Exclude<AnimationType, "none">, EffectDefinition>(
  effects.map((effect) => [effect.type, effect]),
);

export function listAnimationTypes(): AnimationType[] {
  return [...ANIMATION_TYPES];
}

export function getEffect(type: AnimationType): EffectDefinition | undefined {
  if (type === "none") {
    return undefined;
  }

  return effectByType.get(type);
}

export function getAnimationMeta(type: AnimationType): AnimationMeta {
  if (type === "none") {
    return {
      type: "none",
      family: "one-time",
      continuous: false,
      category: "reveal",
    };
  }

  const effect = getEffect(type);

  if (!effect) {
    throw new Error(`Unknown animation type: ${type}`);
  }

  return {
    type: effect.type,
    family: effect.family,
    continuous: effect.continuous,
    category: effect.category,
  };
}

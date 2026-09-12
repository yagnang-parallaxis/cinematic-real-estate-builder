import type { AmenityScene } from "./types";

export function clampScenes(scenes: AmenityScene[], max = 6): AmenityScene[] {
  return scenes.slice(0, max);
}

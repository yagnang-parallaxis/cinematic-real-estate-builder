import type { ResidenceType } from "./types";

export function clampTypes(types: ResidenceType[], max = 6): ResidenceType[] {
  return types.slice(0, max);
}

export {
  formatSlideLabel,
  nextIndex,
  prevIndex,
  slideProgress,
  swipeStep,
  wrapIndex,
} from "../story/logic";

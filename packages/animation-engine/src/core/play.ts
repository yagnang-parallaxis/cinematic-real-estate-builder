import { describeAnimation } from "./resolve";
import type {
  AnimationHandle,
  AnimationRuntime,
  MotionDescriptor,
  ResolvedAnimation,
} from "./types";

const noopHandle: AnimationHandle = {
  kill() {
    return undefined;
  },
};

export function playAnimation(
  target: object,
  resolved: ResolvedAnimation,
  runtime: AnimationRuntime,
): AnimationHandle {
  const descriptor: MotionDescriptor = describeAnimation(resolved);

  if (!resolved.enabled || descriptor.kind === "none") {
    return noopHandle;
  }

  return runtime.play(target, descriptor);
}

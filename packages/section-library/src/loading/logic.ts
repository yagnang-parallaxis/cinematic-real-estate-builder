export function loaderProgress(elapsedMs: number, maxDurationMs: number): number {
  if (maxDurationMs <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, elapsedMs / maxDurationMs));
}

export function shouldHoldLoader(
  elapsedMs: number,
  maxDurationMs: number,
  forceVisible: boolean,
): boolean {
  if (forceVisible) {
    return true;
  }

  return loaderProgress(elapsedMs, maxDurationMs) < 1;
}

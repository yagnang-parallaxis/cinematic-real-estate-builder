export interface LoadingContent {
  brand: string;
  wordmark?: [string, string];
  place?: string;
  leftCaption?: string;
  rightCaption?: string;
  tagline?: string;
  progressStyle: "bar" | "none";
  maxDurationMs: number;
}

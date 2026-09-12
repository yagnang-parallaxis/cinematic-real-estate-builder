export interface LoadingContent {
  brand: string;
  tagline?: string;
  progressStyle: "bar" | "none";
  maxDurationMs: number;
}

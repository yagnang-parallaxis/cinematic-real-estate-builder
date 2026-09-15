import type { LoadingContent } from "./types";

/** Fired as the page is uncovered, so the first screen can enter into the gap. */
export const OPEN_EVENT = "cinematic:open";

/**
 * Where the boot stands, published on the root.
 *
 * The plate that covers first paint and the gate that follows it are
 * different components — the plate is a dark cover, the gate is a branded
 * overlay that plays once — so the phase has to live somewhere both of
 * them, and the CSS, can read. The root is the one place with no ordering
 * problem: it exists before either mounts.
 */
export const BOOT_ATTR = "data-boot";

/** Measured readiness, published on the root so any surface can draw a rule. */
export const BOOT_PROGRESS_VAR = "--boot-progress";

export type BootPhase = "veil" | "gate" | "open";

/** Fired when the once-only gate has left, so the page can be used. */
export const GATE_EVENT = "cinematic:gate";

/**
 * Session mark that the boot plate has already played in this tab.
 *
 * Written when the gate leaves successfully, read before the next paint so a
 * reload in the same session does not put the plate or the arch up again.
 */
export const BOOT_SEEN_KEY = "cinematic:boot-seen";
export const BOOT_SEEN_VALUE = "1";

function sessionStore(storage?: Storage | null): Storage | null {
  if (storage) {
    return storage;
  }

  try {
    if (typeof sessionStorage === "undefined") {
      return null;
    }
    return sessionStorage;
  } catch {
    return null;
  }
}

/** True once this tab has already sat through a successful uncover. */
export function isBootSeen(storage?: Storage | null): boolean {
  try {
    return sessionStore(storage)?.getItem(BOOT_SEEN_KEY) === BOOT_SEEN_VALUE;
  } catch {
    return false;
  }
}

/** Record that the plate has left, so the next load in this tab can skip it. */
export function markBootSeen(storage?: Storage | null): void {
  try {
    sessionStore(storage)?.setItem(BOOT_SEEN_KEY, BOOT_SEEN_VALUE);
  } catch {
    /* Private mode, or storage disabled: the next load will play the plate again. */
  }
}

/**
 * Whether the plate should run at all.
 *
 * A first visit always runs. A later load in the same session does not, unless
 * something asked to see it again — `?loader=1` and `?preview=1` both replay
 * the gate so capture and the builder iframe are not stuck on a skip.
 */
export function shouldRunBoot({
  seen,
  force = false,
}: {
  seen: boolean;
  force?: boolean;
}): boolean {
  return force || !seen;
}

/**
 * Capture (`loader=1`) and the builder iframe (`preview=1`) both opt out of the
 * session skip so the gate can play again. Neighbouring values such as
 * `loader=10` must not.
 */
export function bootForcedFromSearch(search: string): boolean {
  return /(?:^|[?&])(?:loader|preview)=1(?:&|$)/.test(search);
}

function bootIsForced(forceVisible: boolean): boolean {
  if (forceVisible) {
    return true;
  }
  if (typeof window === "undefined") {
    return false;
  }
  return bootForcedFromSearch(window.location.search);
}

/** True when this load should skip the plate, the hold, and the scroll lock. */
export function shouldSkipBoot(forceVisible = false): boolean {
  return !shouldRunBoot({ seen: isBootSeen(), force: bootIsForced(forceVisible) });
}

/**
 * Runs before the plate is parsed, so a session that has already seen the boot
 * never paints the cover — not even for a frame — on the way to skipping it.
 */
export function bootSeenBootstrapScript(): string {
  return `(function(){try{var r=document.documentElement;var q=location.search;if(/(?:^|[?&])loader=1(?:&|$)/.test(q)||/(?:^|[?&])preview=1(?:&|$)/.test(q)){r.setAttribute("${BOOT_ATTR}","veil");return}if(sessionStorage.getItem("${BOOT_SEEN_KEY}")==="${BOOT_SEEN_VALUE}"){r.setAttribute("${BOOT_ATTR}","open");return}var p=location.pathname;if(p!=="/"&&p!==""){r.setAttribute("${BOOT_ATTR}","open");return}r.setAttribute("${BOOT_ATTR}","veil")}catch(e){}})();`;
}

/**
 * Whether the page has already been uncovered. Anything that mounts after the
 * uncover would otherwise wait forever for an event that has been and gone; a
 * page with no loading section at all has never been covered, so it is open.
 */
export function bootOpened(root?: Element | null): boolean {
  const node = root ?? (typeof document === "undefined" ? null : document.documentElement);
  if (!node) {
    return true;
  }
  return node.getAttribute(BOOT_ATTR) !== ("veil" satisfies BootPhase);
}

/**
 * Whether the once-only gate has left and the visitor is on the page.
 *
 * Distinct from `bootOpened`: the plate fading is not the same as the arch
 * having played out. Scroll and the hero lockup wait on this, not on the plate.
 */
export function bootReleased(root?: Element | null): boolean {
  const node = root ?? (typeof document === "undefined" ? null : document.documentElement);
  if (!node) {
    return true;
  }
  const phase = node.getAttribute(BOOT_ATTR);
  return phase !== ("veil" satisfies BootPhase) && phase !== ("gate" satisfies BootPhase);
}

/** Below this the composition cannot be read; above it the hold is a wait. */
export const MIN_HOLD_MS = 600;
export const MAX_HOLD_MS = 6000;
export const DEFAULT_HOLD_MS = 2000;

/**
 * The floor the loader holds for. Clamped, because the floor is also what the
 * progress rule is paced against: an unset or absurd value would otherwise show
 * a rule that never moves, or never arrives.
 */
export function clampHoldMs(maxDurationMs?: number): number {
  if (maxDurationMs === undefined || !Number.isFinite(maxDurationMs)) {
    return DEFAULT_HOLD_MS;
  }

  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, Math.round(maxDurationMs)));
}

/**
 * The signals the loader waits on. Fonts because every heading is fitted to its
 * measure after the face lands, so lifting the cover first shows the fit jump;
 * media because the hero photograph is the first thing behind the cover; load
 * because anything still arriving will otherwise arrive over the opening shot.
 */
export const BOOT_SIGNALS = ["fonts", "media", "load"] as const;
export type BootSignal = (typeof BOOT_SIGNALS)[number];

/**
 * How long past the floor the loader will wait for those signals before it
 * gives up and leaves anyway. A slow connection must not strand the visitor on
 * a plate, so readiness is a preference, never a requirement.
 */
export const BOOT_GRACE_MS = 4000;

/** Weight of measured readiness against elapsed time in the progress rule. */
const READY_WEIGHT = 0.45;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

/**
 * Where the progress rule stands.
 *
 * Blended from two sources on purpose. Elapsed time alone is a fiction — the
 * rule arrives whether or not the page has. Readiness alone stalls: on a warm
 * cache every signal lands in the first frames and the rule snaps to full
 * before it has been seen. Together the rule always moves, and it jumps forward
 * when something real has actually landed.
 */
export function bootProgress({
  elapsedMs,
  floorMs,
  ready,
}: {
  elapsedMs: number;
  floorMs: number;
  ready: readonly BootSignal[] | ReadonlySet<BootSignal>;
}): number {
  const done = "size" in ready ? ready.size : ready.length;
  const byTime = clamp01(elapsedMs / Math.max(1, floorMs));
  const byReady = clamp01(done / BOOT_SIGNALS.length);
  return clamp01((1 - READY_WEIGHT) * byTime + READY_WEIGHT * byReady);
}

/**
 * Whether the cover may leave: once every signal is in and the floor has
 * passed, or once the grace window is spent regardless.
 */
export function shouldUncover({
  elapsedMs,
  floorMs,
  ready,
}: {
  elapsedMs: number;
  floorMs: number;
  ready: readonly BootSignal[] | ReadonlySet<BootSignal>;
}): boolean {
  const done = "size" in ready ? ready.size : ready.length;
  if (elapsedMs >= floorMs + BOOT_GRACE_MS) {
    return true;
  }
  return done >= BOOT_SIGNALS.length && elapsedMs >= floorMs;
}

/**
 * The wordmark, one entry per line, so each line can unmask in its own turn.
 * Falls back to the brand when no wordmark is authored.
 */
export function wordmarkLines(content: Pick<LoadingContent, "brand" | "wordmark">): string[] {
  const authored = (content.wordmark ?? []).map((line) => line.trim()).filter(Boolean);
  if (authored.length > 0) {
    return authored;
  }

  const brand = content.brand.trim();
  return brand ? [brand] : [];
}

/** The tagline, one entry per authored line, with blank lines dropped. */
export function taglineLines(tagline?: string): string[] {
  if (!tagline) {
    return [];
  }

  return tagline
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

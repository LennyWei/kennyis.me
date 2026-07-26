/**
 * Throttles how often visual updates get pushed, without touching the
 * underlying timing. The trick: keep accumulating real elapsed time every
 * animation frame (so durations, physics, and completion are exactly
 * correct), but only report "yes, draw now" every ~1000/fps ms. That's the
 * difference between this and just running the animation slower — the
 * motion is still timed correctly, it's just visually quantized into
 * discrete steps, which is what actually reads as "retro/choppy" rather
 * than "sluggish."
 */
export interface FrameLimiter {
  /** Call once per real animation frame with the real delta (ms). Returns true on frames where you should push a visual update. */
  shouldStep(deltaMs: number): boolean;
}

/** Pass undefined/0/negative to disable throttling entirely (steps every real frame — native refresh rate). */
export function createFrameLimiter(fps?: number): FrameLimiter {
  if (!fps || fps <= 0) {
    return { shouldStep: () => true };
  }

  const frameDurationMs = 1000 / fps;
  let accumulated = 0;

  return {
    shouldStep(deltaMs: number) {
      accumulated += deltaMs;
      if (accumulated < frameDurationMs) return false;
      accumulated %= frameDurationMs;
      return true;
    },
  };
}
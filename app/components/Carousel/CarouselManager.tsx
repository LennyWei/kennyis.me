"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { createFrameLimiter } from "./CarouselFrameLimiter";

/**
 * CarouselManager
 * ----------------
 * A content-agnostic carousel "engine." It owns:
 *   - the clip mask (the visible window items slide through)
 *   - ONE continuous left-moving motion per item: fast in from the right
 *     edge, smoothly slowing into a still-moving middle pass, then smoothly
 *     speeding back up and out past the left edge.
 *   - index/direction state, autoplay, and manual prev/next
 *
 * The whole thing is driven by a single speed curve (`speedFactorAt`)
 * rather than three separate eased tweens stitched together. That matters:
 * stitched segments have no guarantee their velocities match at the seams,
 * which is what reads as a "rigid" jump. This curve is built from
 * smootherstep, which has zero first AND second derivative at both of its
 * edges — so it blends into the flat "slow" plateau, and the plateau blends
 * back into full speed, with no kink anywhere. Position is then obtained by
 * numerically integrating that speed curve every frame (Euler integration),
 * not by keyframing position directly.
 *
 * It knows nothing about what an item looks like. You pass `items` (any
 * shape) and a `renderItem(item, meta)` function; `meta` tells your item
 * component whether it's active, roughly what part of the pass it's in, and
 * — crucially — a live `speedFactor` MotionValue your item can read inside
 * its own per-frame animation to stay physically in sync with the
 * carousel's actual current speed (see SunHeroIcon's spin for an example).
 */

export type CarouselPhase = "enter" | "slow" | "exit";

export interface CarouselRenderMeta {
  index: number;
  isActive: boolean;
  phase: CarouselPhase;
  /** True while paused (currently: only via requestPause, if pauseOnHover is on). */
  isPaused: boolean;
  /**
   * Call with `true`/`false` to pause/resume the carousel. The manager
   * deliberately does NOT pause on hovering its own bounding box — it has
   * no idea what shape your item actually is (a sun icon isn't a
   * rectangle). Instead, attach this to whatever element(s) in your item
   * should count as "hovering the icon" — e.g. the image circle and the
   * rays SVG, but not the transparent padding around them. No-ops if
   * `pauseOnHover` is false.
   */
  requestPause: (paused: boolean) => void;
  /**
   * Continuous speed multiplier for the current pass, updated every
   * animation frame outside of React state (read it inside your own
   * useAnimationFrame / rAF loop, not during render). Ranges from
   * `minSpeedFactor` (during the slow middle pass) up to 1 (at full speed,
   * entering/exiting).
   */
  speedFactor: MotionValue<number>;
  /** The `minSpeedFactor` this pass was configured with — use it to normalize `speedFactor` to a clean 0–1 range if you want. */
  minSpeedFactor: number;
  /**
   * The `fps` this carousel is configured with (undefined = native frame
   * rate). If your item runs its own per-frame animation (like a spin),
   * pass this to `createFrameLimiter` from `./frameLimiter` so it steps at
   * the same rate instead of staying smooth while the carousel goes choppy.
   */
  fps?: number;
}

export interface CarouselManagerProps<T> {
  items: T[];
  renderItem: (item: T, meta: CarouselRenderMeta) => ReactNode;

  /** Size of the clip-mask window. Height is required so the mask has a box. */
  width?: number | string;
  height: number;

  /**
   * Fixed px distance the item travels beyond each edge before it's fully
   * off-screen. Tune this to your item's rendered width — it needs to be at
   * least as large as the item for it to fully clear the box.
   */
  travelDistance?: number;

  /**
   * Speed multiplier during the slow middle plateau, relative to full speed
   * (1 = no slowdown at all, 0 = would fully stop — kept exclusive of 0 so
   * it's always still moving). Try 0.1–0.2 for a pronounced but still-alive
   * crawl.
   */
  minSpeedFactor?: number;

  /**
   * Shapes the transition into/out of the slow plateau. Defaults to
   * `easeSmootherstep` (smoothest — zero acceleration at the seams too).
   * Try `easeSmoothstep` for something a touch snappier, `easeCubicInOut`
   * for snappier still, or pass your own `(t: number) => number` mapping
   * 0..1 to 0..1.
   */
  blendEase?: (t: number) => number;

  /**
   * How far (px) the item dips vertically at the peak of its arc — positive
   * dips downward (a "U"), negative arcs upward. 0 disables the arc.
   */
  arcHeight?: number;

  /**
   * How much larger the item gets at the peak of the arc, as a fraction
   * (0.15 = 15% larger at the middle). 0 disables the scale change.
   */
  scaleBoost?: number;

  /**
   * Shapes the arc/scale bump over the item's spatial progress (0 = just
   * entered, 0.5 = dead center, 1 = about to exit). Defaults to `bumpHann`.
   * Swap in your own `(progress: number) => number` for a sharper or
   * asymmetric peak — it doesn't need to stay 0 at the edges, but zero
   * there is what keeps the blend kink-free.
   */
  arcBump?: (progress: number) => number;

  /**
   * Quantizes visual updates to roughly this many frames per second,
   * independent of the browser's actual refresh rate — e.g. `12` for a
   * deliberately choppy, retro/stop-motion feel. Durations are unaffected;
   * only how often the change is drawn is throttled. Default: undefined
   * (native frame rate, fully smooth).
   */
  fps?: number;

  /** Timing, in ms, for each portion of the single continuous pass. */
  enterDurationMs?: number;
  slowDurationMs?: number;
  exitDurationMs?: number;

  /** Soft-edge fade at the mask boundaries instead of a hard clip. 0 disables it. */
  edgeFadeWidth?: number;

  autoplay?: boolean;
  /** Master switch for hover-pausing. When false, `meta.requestPause` no-ops — nothing pauses no matter what your item does. */
  pauseOnHover?: boolean;
  loop?: boolean;

  showControls?: boolean;
  accentColor?: string;
  borderColor?: string;
  textColor?: string;

  className?: string;
  style?: CSSProperties;
}

/** Ken Perlin's smootherstep, normalized to t in [0,1]: zero 1st AND 2nd derivative at both edges. This is the default — no kink blending in or out of the slow plateau. */
export function easeSmootherstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/** Classic smoothstep: zero 1st derivative at both edges, but not 2nd — a slightly snappier blend than smootherstep. */
export function easeSmoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** Cubic ease-in-out: noticeably snappier onset/exit than either smoothstep variant. */
export function easeCubicInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * A "bump": 0 at both t=0 and t=1, peaking at 1 at t=0.5, with zero
 * derivative at both edges (a raised cosine / Hann window) so it blends in
 * and out with no kink — same smoothness property as the ease functions
 * above, just shaped as a hill instead of a step. Used to drive the arc
 * height and scale boost so they peak exactly when the item is spatially
 * centered, and fade to nothing right as it crosses the mask edges.
 */
export function bumpHann(progress: number): number {
  const c = Math.min(1, Math.max(0, progress));
  return (1 - Math.cos(2 * Math.PI * c)) / 2;
}

/** Speed multiplier at normalized time u (0..1): 1 -> minFactor -> 1. `easeFn` shapes each blend (applied to a local 0..1 t within that blend region only — the plateau in between is always flat). */
function speedFactorAt(
  u: number,
  slowStart: number,
  slowEnd: number,
  minFactor: number,
  easeFn: (t: number) => number,
): number {
  if (u <= slowStart) {
    const t = slowStart === 0 ? 1 : u / slowStart;
    return 1 - (1 - minFactor) * easeFn(t);
  }
  if (u <= slowEnd) return minFactor;
  const t = slowEnd >= 1 ? 1 : (u - slowEnd) / (1 - slowEnd);
  return minFactor + (1 - minFactor) * easeFn(t);
}

export default function CarouselManager<T>({
  items,
  renderItem,
  width = "100%",
  height,
  travelDistance = 150,
  minSpeedFactor = 0.15,
  blendEase = easeSmootherstep,
  arcHeight = 0,
  scaleBoost = 0,
  arcBump = bumpHann,
  fps,
  enterDurationMs = 550,
  slowDurationMs = 2000,
  exitDurationMs = 550,
  edgeFadeWidth = 0,
  autoplay = true,
  pauseOnHover = true,
  loop = true,
  showControls = true,
  accentColor = "rgb(217, 130, 58)",
  borderColor = "rgba(245, 238, 220, 0.22)",
  textColor = "rgb(245, 238, 220)",
  className = "",
  style,
}: CarouselManagerProps<T>) {
  const safeItems = useMemo(() => (items.length > 0 ? items : []), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<CarouselPhase>("enter");
  const [isPaused, setIsPaused] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const speedFactor = useMotionValue(1);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const runIdRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const goTo = useCallback(
    (nextIndex: number) => {
      if (safeItems.length === 0) return;
      const wrapped = ((nextIndex % safeItems.length) + safeItems.length) % safeItems.length;
      setActiveIndex(wrapped);
    },
    [safeItems.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const requestPause = useCallback(
    (paused: boolean) => {
      if (pauseOnHover) setIsPaused(paused);
    },
    [pauseOnHover],
  );

  // Drives one continuous right-to-left pass for the current activeIndex.
  useEffect(() => {
    if (safeItems.length === 0) return;

    const runId = ++runIdRef.current;
    const fromX = travelDistance;
    const toX = -travelDistance;
    const distance = toX - fromX;
    const totalDurationMs = enterDurationMs + slowDurationMs + exitDurationMs;
    const slowStart = enterDurationMs / totalDurationMs;
    const slowEnd = (enterDurationMs + slowDurationMs) / totalDurationMs;

    if (shouldReduceMotion) {
      x.set(0);
      y.set(0);
      scale.set(1);
      speedFactor.set(minSpeedFactor);
      setPhase("slow");
      const id = window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        if (!autoplay) return;
        if (!loop && activeIndex === safeItems.length - 1) return;
        setActiveIndex((current) => (current + 1) % safeItems.length);
      }, slowDurationMs);
      timeoutsRef.current.push(id);
      return () => window.clearTimeout(id);
    }

    // One-time normalization constant: ∫0..1 speedFactor(u) du, via trapezoidal rule.
    // Needed so that integrating speed over totalDurationMs lands exactly on `toX`,
    // regardless of how much the slow plateau reduces the average speed.
    const SAMPLES = 200;
    let z = 0;
    let prevF = speedFactorAt(0, slowStart, slowEnd, minSpeedFactor, blendEase);
    for (let i = 1; i <= SAMPLES; i++) {
      const u = i / SAMPLES;
      const f = speedFactorAt(u, slowStart, slowEnd, minSpeedFactor, blendEase);
      z += ((prevF + f) / 2) * (1 / SAMPLES);
      prevF = f;
    }

    let elapsedMs = 0;
    let cumulativeIntegral = 0;
    let lastTime: number | null = null;
    let finished = false;
    const limiter = createFrameLimiter(fps);

    x.set(fromX);
    y.set(0);
    scale.set(1);
    speedFactor.set(1);
    setPhase("enter");
    timeoutsRef.current.push(
      window.setTimeout(() => runIdRef.current === runId && setPhase("slow"), enterDurationMs),
      window.setTimeout(() => runIdRef.current === runId && setPhase("exit"), enterDurationMs + slowDurationMs),
    );

    const tick = (now: number) => {
      if (runIdRef.current !== runId || finished) return;
      if (lastTime === null) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;

      if (!isPausedRef.current) {
        elapsedMs = Math.min(elapsedMs + dt, totalDurationMs);
        const u = elapsedMs / totalDurationMs;
        const f = speedFactorAt(u, slowStart, slowEnd, minSpeedFactor, blendEase);
        cumulativeIntegral += f * (dt / totalDurationMs);
        const normalizedProgress = Math.min(cumulativeIntegral / z, 1);
        const bump = arcBump(normalizedProgress);
        const isDone = elapsedMs >= totalDurationMs;

        // Underlying math above always runs at full real frame rate (correct
        // timing). Only whether we PUSH it to the motion values is throttled
        // — that's what turns "smooth" into "choppy" rather than "slow."
        if (limiter.shouldStep(dt) || isDone) {
          speedFactor.set(f);
          x.set(isDone ? toX : fromX + distance * normalizedProgress);
          y.set(isDone ? 0 : arcHeight * bump);
          scale.set(isDone ? 1 : 1 + scaleBoost * bump);
        }

        if (isDone) {
          finished = true;
          if (autoplay && (loop || activeIndex < safeItems.length - 1)) {
            setActiveIndex((current) => (current + 1) % safeItems.length);
          }
          return;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, safeItems.length]);

  const activeItem = safeItems[activeIndex];

  const maskStyle: CSSProperties =
    edgeFadeWidth > 0
      ? {
          maskImage: `linear-gradient(90deg, transparent 0, black ${edgeFadeWidth}px, black calc(100% - ${edgeFadeWidth}px), transparent 100%)`,
          WebkitMaskImage: `linear-gradient(90deg, transparent 0, black ${edgeFadeWidth}px, black calc(100% - ${edgeFadeWidth}px), transparent 100%)`,
        }
      : {};

  if (safeItems.length === 0) return null;

  return (
    <div
      className={`relative w-full ${className}`.trim()}
      style={{ maxWidth: typeof width === "number" ? `${width}px` : width, ...style }}
    >
      <div className="relative overflow-hidden" style={{ height: `${height}px`, ...maskStyle }}>
        <motion.div className="absolute inset-0" style={{ x, y, scale, willChange: "transform" }}>
          {activeItem !== undefined
            ? renderItem(activeItem, {
                index: activeIndex,
                isActive: true,
                phase,
                isPaused,
                speedFactor,
                minSpeedFactor,
                requestPause,
                fps,
              })
            : null}
        </motion.div>
      </div>

      {showControls && safeItems.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-0 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-transform hover:scale-[1.04]"
            style={{ borderColor, background: "rgba(8,8,8,0.6)", color: textColor }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-0 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-transform hover:scale-[1.04]"
            style={{ borderColor, background: "rgba(8,8,8,0.6)", color: textColor }}
          >
            →
          </button>
          {/* <div className="absolute bottom-25 left-1/2 flex -translate-x-1/2 gap-1.5 z-0">
            {safeItems.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                aria-label={`Go to item ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: dotIndex === activeIndex ? 18 : 6,
                  background: dotIndex === activeIndex ? accentColor : borderColor,
                }}
              />
            ))}
          </div> */}
        </>
      ) : null}
    </div>
  );
}
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { createFrameLimiter } from "./CarouselFrameLimiter";

export type CarouselPhase = "enter" | "slow" | "exit";

export interface CarouselRenderMeta {
  index: number;
  isActive: boolean;
  phase: CarouselPhase;
  isPaused: boolean;
  requestPause: (paused: boolean) => void;
  speedFactor: MotionValue<number>;
  minSpeedFactor: number;
  fps?: number;
  /**
   * measuredWidth / baseWidth — how much smaller/larger the carousel's
   * actual rendered box is vs. the reference width the travelDistance/
   * arcHeight px values were tuned at. Multiply any px-based sizing inside
   * your renderItem (icon size, stroke widths, etc.) by this so it scales
   * in step with the carousel instead of staying a fixed pixel size while
   * the track around it grows or shrinks.
   */
  scaleFactor: number;
}

export interface CarouselManagerProps<T> {
  items: T[];
  renderItem: (item: T, meta: CarouselRenderMeta) => ReactNode;

  /** CSS width of the outer box. Default "100%" fills the parent, so it lines up with anything else sized off that same parent. */
  width?: number | string;
  /**
   * Pixel height of the clip-mask window. Omit this (recommended) and the
   * carousel measures its parent's rendered height instead, so it always
   * matches a sibling that's also h-full/w-full of that parent, live on
   * resize. Pass a number only if you want a fixed height regardless of
   * the parent.
   */
  height?: number;
  /**
   * The width (px) travelDistance/arcHeight below were originally tuned
   * at. The carousel scales those values by (actual rendered width /
   * baseWidth), so the motion looks proportionally identical at any
   * container size instead of a fixed-size pass inside a shrinking or
   * growing box.
   */
  baseWidth?: number;

  travelDistance?: number;
  minSpeedFactor?: number;
  blendEase?: (t: number) => number;
  arcHeight?: number;
  scaleBoost?: number;
  arcBump?: (progress: number) => number;
  fps?: number;
  enterDurationMs?: number;
  slowDurationMs?: number;
  exitDurationMs?: number;
  edgeFadeWidth?: number;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  loop?: boolean;
  showControls?: boolean;
  accentColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
  style?: CSSProperties;
}

export function easeSmootherstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

export function easeSmoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

export function easeCubicInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function bumpHann(progress: number): number {
  const c = Math.min(1, Math.max(0, progress));
  return (1 - Math.cos(2 * Math.PI * c)) / 2;
}

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
  baseWidth = 1200,
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

  // Tracks the carousel's actual rendered box so it can (a) stay in
  // lockstep with whatever else shares its parent, e.g. a background
  // behind it, and (b) let the px-tuned motion values below scale to match.
  const outerRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setMeasured({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const effectiveHeight = height ?? measured.height;
  // Round so sub-pixel resize jitter doesn't keep restarting the pass.
  const roundedWidth = Math.round(measured.width / 4) * 4;
  const scaleFactor = roundedWidth > 0 ? roundedWidth / baseWidth : 1;

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
    if (effectiveHeight === 0) return; // wait for a real measured box before starting

    const runId = ++runIdRef.current;
    const scaledTravel = travelDistance * scaleFactor;
    const scaledArc = arcHeight * scaleFactor;
    const fromX = scaledTravel;
    const toX = -scaledTravel;
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

        if (limiter.shouldStep(dt) || isDone) {
          speedFactor.set(f);
          x.set(isDone ? toX : fromX + distance * normalizedProgress);
          y.set(isDone ? 0 : scaledArc * bump);
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
  }, [activeIndex, safeItems.length, roundedWidth, effectiveHeight]);

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
      ref={outerRef}
      className={`relative h-full w-full ${className}`.trim()}
      style={{ maxWidth: typeof width === "number" ? `${width}px` : width, ...style }}
    >
      <div
        className="relative h-full"
        style={{
          height: effectiveHeight ? `${effectiveHeight}px` : "100%",
          // Clips left/right at the box edges but leaves top/bottom unbounded
          // (huge inset values), so vertical overflow — the sun's rays during
          // the arc bump — paints freely instead of being cut at the box height.
          // Deliberately not using `overflow-x-hidden overflow-y-visible` here:
          // per spec, if one overflow axis is non-visible, the other silently
          // computes to `auto` instead of `visible` — so it still clips vertically.
          clipPath: "inset(-9999px 0px -9999px 0px)",
          ...maskStyle,
        }}
      >
        <motion.div className="absolute inset-0"  style={{ x, y, scale, willChange: "transform" }}>
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
                scaleFactor,
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
        </>
      ) : null}
    </div>
  );
}
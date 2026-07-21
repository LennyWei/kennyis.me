"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

/**
 * CarouselManager
 * ----------------
 * A content-agnostic carousel "engine." It owns:
 *   - the clip mask (the visible window items slide through)
 *   - ONE continuous left-moving motion per item: fast in from the right
 *     edge, decelerating into a slow-but-still-moving pass through the
 *     middle, then accelerating back out past the left edge. There is no
 *     stop and no teleport — it's a single tween, not staged phases.
 *   - index/direction state, autoplay, and manual prev/next
 *
 * It knows nothing about what an item looks like. You pass `items` (any
 * shape) and a `renderItem(item, meta)` function; `meta` tells your item
 * component whether it's active and roughly what part of the pass it's in,
 * so things like "scroll to a section on click" live entirely in your own
 * item component.
 * 
 * we want something like an infinite marquee
 */

export type CarouselPhase = "enter" | "slow" | "exit";

export interface CarouselRenderMeta {
  index: number;
  isActive: boolean;
  phase: CarouselPhase;
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

  /** How far (px) the item drifts during the slow middle pass. Keep this small — it should read as "slow," not "stopped." */
  slowZoneWidth?: number;

  /** Timing, in ms, for each portion of the single continuous tween. */
  enterDurationMs?: number;
  slowDurationMs?: number;
  exitDurationMs?: number;

  /** Soft-edge fade at the mask boundaries instead of a hard clip. 0 disables it. */
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

const EASE_INTO_SLOW = [0.16, 1, 0.3, 1] as const; // fast -> decelerates into the slow zone
const EASE_OUT_OF_SLOW = [0.7, 0, 0.84, 0] as const; // accelerates back up to speed

export default function CarouselManager<T>({
  items,
  renderItem,
  width = "100%",
  height,
  travelDistance = 150,
  slowZoneWidth = 50,
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

  const [scope, animate] = useAnimate();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const runIdRef = useRef(0);
  const phaseTimersRef = useRef<number[]>([]);

  const clearPhaseTimers = () => {
    phaseTimersRef.current.forEach((id) => window.clearTimeout(id));
    phaseTimersRef.current = [];
  };

  const goTo = useCallback((nextIndex: number) => {
    if (safeItems.length === 0) return;
    const wrapped = ((nextIndex % safeItems.length) + safeItems.length) % safeItems.length;
    controlsRef.current?.stop();
    clearPhaseTimers();
    setActiveIndex(wrapped);
  }, [safeItems.length]);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Drives one continuous right-to-left pass for the current activeIndex.
  useEffect(() => {
    if (safeItems.length === 0 || !scope.current) return;

    const runId = ++runIdRef.current;

    const fromX = travelDistance;
    const toX = -travelDistance;
    const slowStartX = slowZoneWidth / 2;
    const slowEndX = -slowZoneWidth / 2;

    if (shouldReduceMotion) {
      // Accessibility fallback: no travel, just a brief hold, still advances.
      setPhase("slow");
      const id = window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        if (!autoplay) return;
        if (!loop && activeIndex === safeItems.length - 1) return;
        setActiveIndex((current) => (current + 1) % safeItems.length);
      }, slowDurationMs);
      phaseTimersRef.current.push(id);
      return () => window.clearTimeout(id);
    }

    const totalDuration = enterDurationMs + slowDurationMs + exitDurationMs;
    const t1 = enterDurationMs / totalDuration;
    const t2 = (enterDurationMs + slowDurationMs) / totalDuration;

    // Phase bookkeeping for consumers of `meta.phase` (approximate, ms-based).
    setPhase("enter");
    phaseTimersRef.current.push(
      window.setTimeout(() => runIdRef.current === runId && setPhase("slow"), enterDurationMs),
      window.setTimeout(() => runIdRef.current === runId && setPhase("exit"), enterDurationMs + slowDurationMs),
    );

    const controls = animate(
      scope.current,
      { x: [fromX, slowStartX, slowEndX, toX] },
      {
        duration: totalDuration / 1000,
        times: [0, t1, t2, 1],
        ease: [EASE_INTO_SLOW, "linear", EASE_OUT_OF_SLOW],
      },
    );
    controlsRef.current = controls;

    controls.then(() => {
      if (runIdRef.current !== runId) return;
      if (!autoplay) return;
      if (!loop && activeIndex === safeItems.length - 1) return;
      setActiveIndex((current) => (current + 1) % safeItems.length);
    });

    return () => {
      clearPhaseTimers();
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
      onMouseEnter={() => {
        if (pauseOnHover) controlsRef.current?.pause();
      }}
      onMouseLeave={() => {
        if (pauseOnHover) controlsRef.current?.play();
      }}
    >
      <div className="relative overflow-hidden" style={{ height: `${height}px`, ...maskStyle }}>
        <div ref={scope} className="absolute inset-0" style={{ willChange: "transform" }}>
          {activeItem !== undefined
            ? renderItem(activeItem, { index: activeIndex, isActive: true, phase })
            : null}
        </div>
      </div>

      {showControls && safeItems.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-transform hover:scale-[1.04]"
            style={{ borderColor, background: "rgba(8,8,8,0.6)", color: textColor }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition-transform hover:scale-[1.04]"
            style={{ borderColor, background: "rgba(8,8,8,0.6)", color: textColor }}
          >
            →
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
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
          </div>
        </>
      ) : null}
    </div>
  );
}
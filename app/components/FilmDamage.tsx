"use client";

import { useLayoutEffect, useMemo } from "react";
import {
  useElementAnimation,
  type ElementAnimationConfig,
  type AnimationStep,
} from "./ElementAnimation";

/**
 * Default scratch/damage frames — update these paths to match where your
 * exported textures actually live. Each frame must be an independently
 * seamless-tileable transparent PNG (opaque = kept, transparent = cut out).
 */
export const DEFAULT_FILM_DAMAGE_FRAMES = [
    "/film-damage/scratches_r1_c1.png",
    "/film-damage/scratches_r1_c2.png",
    "/film-damage/scratches_r1_c3.png",
    "/film-damage/scratches_r1_c4.png",
    "/film-damage/scratches_r2_c1.png",
    "/film-damage/scratches_r2_c2.png",
    "/film-damage/scratches_r2_c3.png",
    "/film-damage/scratches_r2_c4.png",
    "/film-damage/scratches_r3_c1.png",
    "/film-damage/scratches_r3_c2.png",
    "/film-damage/scratches_r3_c3.png",
    "/film-damage/scratches_r3_c4.png",
    "/film-damage/scratches_r4_c1.png",
    "/film-damage/scratches_r4_c2.png",
    "/film-damage/scratches_r4_c3.png",
    "/film-damage/scratches_r4_c4.png",
    ]

/** Height (px) the default frames above were authored/exported at. */
export const DEFAULT_FILM_DAMAGE_TILE_HEIGHT = 400;

function preloadFrames(frames: string[]) {
  if (typeof window === "undefined") return;
  frames.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// Warm the browser cache the moment this module is imported — well before
// any FilmDamage instance mounts, so the idle loop's first pass through the
// frames never has to fetch one on the spot.
preloadFrames(DEFAULT_FILM_DAMAGE_FRAMES);

export interface FilmDamageProps {
  /** Defaults to DEFAULT_FILM_DAMAGE_FRAMES — pass your own array to override. */
  frames?: string[];
  /** Defaults to DEFAULT_FILM_DAMAGE_TILE_HEIGHT — override if your frames were exported at a different height. */
  tileHeight?: number;
  /** [min, max] ms a frame holds before swapping — randomized per-swap for irregular, less metronomic timing. */
  holdMs?: [min: number, max: number];
  /** Number of swaps per idle loop before the pattern repeats. Higher = less noticeably "loopy". */
  cycleLength?: number;
  className?: string;
  children: React.ReactNode;
}

export function FilmDamage({
  frames = DEFAULT_FILM_DAMAGE_FRAMES,
  tileHeight = DEFAULT_FILM_DAMAGE_TILE_HEIGHT,
  holdMs = [333, 333],
  cycleLength = 14,
  className,
  children,
}: FilmDamageProps) {
  // Covers custom/overridden frame lists too — no-op (browser cache hit) if
  // these are the defaults already preloaded above. useLayoutEffect so it
  // fires before paint rather than after.
  useLayoutEffect(() => {
    preloadFrames(frames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.join("|")]);

  const config: ElementAnimationConfig = useMemo(() => {
    const [minHold, maxHold] = holdMs;
    const steps: AnimationStep[] = [];

    for (let i = 0; i < cycleLength; i++) {
    //   const frame = frames[Math.floor(Math.random() * frames.length)];
      const frame = frames[i];
      const hold = minHold + Math.random() * (maxHold - minHold);

      // Instant swap (duration 0) — mask-image is non-interpolatable anyway,
      // so there's nothing to ease between; the "steps" feel comes from the
      // pause between swaps, not from quantizing a tween.
      steps.push({
        type: "custom",
        keyframes: {
          WebkitMaskImage: `url(${frame})`,
          maskImage: `url(${frame})`,
        },
        transition: { duration: 0 },
      });
      steps.push({ type: "pause", duration: hold / 1000 });
    }

    return { idle: steps };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.join("|"), holdMs[0], holdMs[1], cycleLength]);

  const scope = useElementAnimation({ config });

  return (
    <div
      ref={scope}
      className={className}
      style={{
        display: "inline-block",
        WebkitMaskImage: `url(${frames[0]})`,
        maskImage: `url(${frames[0]})`,
        WebkitMaskRepeat: "repeat-y",
        maskRepeat: "repeat-y",
        WebkitMaskPosition: "top center",
        maskPosition: "top center",
        WebkitMaskSize: `100% ${tileHeight}px`,
        maskSize: `100% ${tileHeight}px`,
      }}
    >
      {children}
    </div>
  );
}
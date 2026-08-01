"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useAnimate, type Easing, cubicBezier } from "framer-motion";

export type SlideStep = {
  type: "slide";
  from: { x?: number; y?: number };
  to?: { x?: number; y?: number };
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
  /** Reverse stagger order for this step (e.g. right-to-left instead of left-to-right) */
  reverseStagger?: boolean;
};

export type SpinStep = {
  type: "spin";
  degrees: number; // positive = clockwise, negative = counter-clockwise
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
  reverseStagger?: boolean;
};

export type FadeStep = {
  type: "fade";
  to?: number;
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
  reverseStagger?: boolean;
};

export type ScaleStep = {
  type: "scale";
  to?: number;
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
  reverseStagger?: boolean;
};

export type PauseStep = { type: "pause"; duration: number };

export type ParallelStep = {
  type: "parallel";
  steps: AnimationStep[];
};

export type CustomStep = {
  type: "custom";
  keyframes: Record<string, unknown>;
  transition?: Record<string, unknown>;
  reverseStagger?: boolean;
};

export type AnimationStep =
  | SlideStep
  | SpinStep
  | FadeStep
  | ScaleStep
  | PauseStep
  | ParallelStep
  | CustomStep;

export interface ElementAnimationConfig {
  loadIn?: AnimationStep[];
  idle?: AnimationStep[];
}

type AnimateFn = ReturnType<typeof useAnimate>[1];

type AnimateTarget = Element | Element[] | NodeListOf<Element>;

type StepTransition = {
  delay?: number;
  duration?: number;
  ease?: Easing | Easing[];
  [key: string]: unknown;
};

/**
 * Range (in seconds) to draw a random per-element delay from.
 * Pass `true` to derive a range of [0, stagger] from the `stagger` prop,
 * or supply an explicit { min, max } range directly.
 */
export type RandomStaggerConfig = { min: number; max: number };
export type RandomStaggerOption = boolean | RandomStaggerConfig;

function normalizeTargets(target: AnimateTarget) {
  return target instanceof Element ? [target] : Array.from(target);
}

export function getInitialFromConfig(config?: ElementAnimationConfig) {
  const first = config?.loadIn?.[0];

  return getInitialForStep(first);
}

function getInitialForStep(step?: AnimationStep): Record<string, unknown> | undefined {
  if (!step) return undefined;

  switch (step.type) {
    case "slide":
      return { x: step.from.x ?? 0, y: step.from.y ?? 0 };
    case "fade":
      // fade always animates *to* step.to, so the implicit "from" is the opposite end
      return { opacity: step.to === 0 ? 1 : 0 };
    case "scale":
      return { scale: step.to === 1 ? 0 : 1 };
    case "parallel": {
      // merge initials from each parallel branch
      return step.steps.reduce<Record<string, unknown>>((acc, s) => {
        return { ...acc, ...getInitialForStep(s) };
      }, {});
    }
    default:
      return undefined;
  }
}

function resolveRandomRange(
  randomStagger: RandomStaggerOption | undefined,
  stagger: number | undefined,
): RandomStaggerConfig | undefined {
  if (!randomStagger) return undefined;
  if (randomStagger === true) {
    // Derive a sensible default range from `stagger` if no explicit range given.
    return { min: 0, max: stagger ?? 0.5 };
  }
  return randomStagger;
}

/**
 * Computes the per-element stagger delay.
 *
 * If `randomStagger` is set, each element gets an independently randomized
 * delay drawn from the resolved range (re-rolled every time this runs, so
 * every idle loop iteration gets a fresh random offset — this is what makes
 * elements feel like they're drifting instead of lockstepping). `reverse`
 * has no effect in the random case since there's no meaningful "direction"
 * to a randomized delay.
 *
 * Otherwise falls back to the original linear index * stagger behavior, with
 * `reverse` mirroring the index (e.g. right-to-left instead of left-to-right,
 * assuming elements are in left-to-right DOM/selector order).
 */
function applyStagger(
  transition: StepTransition,
  index: number,
  stagger: number | undefined,
  total: number,
  reverse?: boolean,
  randomStagger?: RandomStaggerOption,
): StepTransition {
  const randomRange = resolveRandomRange(randomStagger, stagger);

  if (randomRange) {
    const { min, max } = randomRange;
    const randomDelay = min + Math.random() * (max - min);
    return {
      ...transition,
      delay: (transition.delay ?? 0) + randomDelay,
    };
  }

  if (!stagger) {
    return transition;
  }

  const effectiveIndex = reverse ? total - 1 - index : index;

  return {
    ...transition,
    delay: (transition.delay ?? 0) + effectiveIndex * stagger,
  };
}

/**
 * Throttles the transition's easing function to match a specific frames-per-second rate.
 */
function applyFpsThrottling(
  transition: StepTransition,
  fps?: number,
): StepTransition {
  if (!fps) return transition;

  const duration = transition.duration ?? 0.5;
  const baseEase = transition.ease;

  // Map standard Framer Motion easing strings to core functions for quantization
let easeFunc = (t: number) => t;
if (typeof baseEase === "string") {
  if (baseEase === "linear") easeFunc = (t) => t;
  else if (baseEase === "easeIn") easeFunc = (t) => t * t;
  else if (baseEase === "easeOut") easeFunc = (t) => t * (2 - t);
  else if (baseEase === "easeInOut") easeFunc = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
} else if (Array.isArray(baseEase) && baseEase.length === 4) {
      // baseEase may be typed as Easing; assert elements are numbers for cubicBezier
      const [p0, p1, p2, p3] = baseEase as unknown as number[];
      easeFunc = cubicBezier(p0, p1, p2, p3);
} else if (typeof baseEase === "function") {
  easeFunc = baseEase;
}

  const totalFrames = Math.max(1, Math.round(duration * fps));

  return {
    ...transition,
    ease: (t: number) => {
      if (t >= 1) return 1;
      const currentFrame = Math.floor(t * totalFrames);
      return easeFunc(currentFrame / totalFrames);
    },
  };
}

async function animateTarget(
  animate: AnimateFn,
  target: AnimateTarget,
  keyframes: Record<string, unknown>,
  transition: StepTransition,
  stagger?: number,
  reverseStagger?: boolean,
  randomStagger?: RandomStaggerOption,
) {
  const targets = normalizeTargets(target);

  if (targets.length <= 1 || (!stagger && !randomStagger)) {
    // Single element case still benefits from randomStagger (adds a random
    // delay before this particular cycle's animation), so only fully skip
    // the per-target branch when there's truly nothing to randomize/stagger.
    if (targets.length <= 1 && randomStagger) {
      await animate(
        target,
        keyframes,
        applyStagger(transition, 0, stagger, 1, reverseStagger, randomStagger),
      );
      return;
    }
    await animate(target, keyframes, transition);
    return;
  }

  await Promise.all(
    targets.map((element, index) =>
      animate(
        element,
        keyframes,
        applyStagger(transition, index, stagger, targets.length, reverseStagger, randomStagger),
      ),
    ),
  );
}

async function runStep(
  animate: AnimateFn,
  target: AnimateTarget,
  step: AnimationStep,
  rotation: { current: number },
  stagger?: number,
  fps?: number,
  randomStagger?: RandomStaggerOption,
) {
  switch (step.type) {
    case "pause":
      await new Promise((resolve) => setTimeout(resolve, step.duration * 1000));
      return;
    case "parallel":
      await Promise.all(
        step.steps.map((s) => runStep(animate, target, s, rotation, stagger, fps, randomStagger)),
      );
      return;
    case "slide": {
      const fromX = step.from.x ?? 0;
      const fromY = step.from.y ?? 0;
      const toX = step.to?.x ?? 0;
      const toY = step.to?.y ?? 0;

      await animateTarget(
        animate,
        target,
        { x: [fromX, toX], y: [fromY, toY] },
        applyFpsThrottling({
          duration: step.duration ?? 0.5,
          ease: step.ease ?? "easeOut",
          delay: step.delay ?? 0,
          }, fps),
        stagger,
        step.reverseStagger,
        randomStagger,
      );
      return;
    }
    case "spin": {
      rotation.current += step.degrees;
      await animateTarget(
        animate,
        target,
        { rotate: rotation.current },
        applyFpsThrottling({
          duration: step.duration ?? 1,
          ease: step.ease ?? "easeInOut",
          delay: step.delay ?? 0,
        }, fps),
        stagger,
        step.reverseStagger,
        randomStagger,
      );
      return;
    }
    case "fade":
      await animateTarget(
        animate,
        target,
        { opacity: step.to ?? 1 },
        applyFpsThrottling({
          duration: step.duration ?? 0.5,
          ease: step.ease ?? "easeInOut",
          delay: step.delay ?? 0,
        }, fps),
        stagger,
        step.reverseStagger,
        randomStagger,
      );
      return;
    case "scale":
      await animateTarget(
        animate,
        target,
        { scale: step.to ?? 1 },
        applyFpsThrottling({
          duration: step.duration ?? 0.5,
          ease: step.ease ?? "easeInOut",
          delay: step.delay ?? 0,
        }, fps),
        stagger,
        step.reverseStagger,
        randomStagger,
      );
      return;
    case "custom":
      await animateTarget(
        animate,
        target,
        step.keyframes,
        applyFpsThrottling(step.transition ?? {}, fps),
        stagger,
        step.reverseStagger,
        randomStagger,
      );
      return;
  }
}

export interface UseElementAnimationOptions {
  config?: ElementAnimationConfig;
  /** CSS selector (scoped to the ref) for animating multiple children at once */
  targetSelector?: string;
  /** stagger delay in seconds between matched children, only used with targetSelector */
  stagger?: number;
  /**
   * Randomize per-element delay instead of the linear `stagger` value. Pass
   * `true` to draw from [0, stagger], or an explicit { min, max } range in
   * seconds. Re-randomized every time a step runs, so idle loops re-roll
   * each cycle instead of settling into a fixed pattern.
   *
   * On its own this still lets elements re-sync at the end of every idle
   * loop cycle (they all wait on each other before looping again). Combine
   * with `independentIdle` for elements that never sync back up.
   */
  randomStagger?: RandomStaggerOption;
  /**
   * When true (requires targetSelector), each matched element runs its idle
   * animation on its own independent loop instead of all elements waiting
   * for each other before restarting. This is what gives a true "everything
   * bouncing at its own random pace" look rather than a synchronized wave
   * that periodically snaps back into alignment. `loadIn` is unaffected and
   * still plays as a single synced entrance.
   */
  independentIdle?: boolean;
  /** Target frame rate for the animations (e.g., 12 for a retro/stop-motion feel) */
  fps?: number;
}

export function useElementAnimation({
  config,
  targetSelector,
  stagger,
  randomStagger,
  independentIdle = false,
  fps = 12,
}: UseElementAnimationOptions = {}) {
  const [scope, animate] = useAnimate();
  const rotation = useRef(0);

  useLayoutEffect(() => {
    if (!config?.loadIn?.length) return;

    const initial = getInitialFromConfig(config);
    if (!initial) return;

    const root = scope.current as Element | null;
    if (!root) return;

    const target = targetSelector ? Array.from(root.querySelectorAll(targetSelector)) : root;

    void animate(target as AnimateTarget, initial, { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stagger && !targetSelector) {
      console.warn("useElementAnimation: `stagger` has no effect without `targetSelector`.");
    }
    if (randomStagger && !targetSelector) {
      console.warn("useElementAnimation: `randomStagger` has no effect without `targetSelector`.");
    }
    if (independentIdle && !targetSelector) {
      console.warn("useElementAnimation: `independentIdle` has no effect without `targetSelector`.");
    }
  }, [stagger, randomStagger, independentIdle, targetSelector]);

  useEffect(() => {
    if (!config || (!config.loadIn?.length && !config.idle?.length)) return;
    let cancelled = false;

    function resolveTarget(): Element | Element[] {
      const root = scope.current as Element;
      if (!targetSelector) return root;
      return Array.from(root.querySelectorAll(targetSelector));
    }

    async function play(
      steps: AnimationStep[],
      target: AnimateTarget,
      rot: { current: number },
      useStagger: boolean,
    ) {
      for (const step of steps) {
        if (cancelled) return;
        await runStep(
          animate,
          target,
          step,
          rot,
          useStagger ? stagger : undefined,
          fps,
          randomStagger,
        );
      }
    }

    (async () => {
      // Entrance always plays as a single synced group, staggered as configured.
      if (config.loadIn?.length) {
        await play(config.loadIn, resolveTarget(), rotation, true);
      }

      if (!config.idle?.length) return;

      if (independentIdle && targetSelector) {
        const root = scope.current as Element | null;
        if (!root) return;
        const elements = Array.from(root.querySelectorAll(targetSelector));

        // Each element gets its own rotation state and its own async loop —
        // none of them wait on each other, so with randomStagger they drift
        // apart into an organic, uncoordinated rhythm.
        elements.forEach((el) => {
          const rot = { current: rotation.current };
          (async () => {
            while (!cancelled) {
              await play(config.idle!, el, rot, false);
            }
          })();
        });
      } else {
        while (!cancelled && config.idle?.length) {
          await play(config.idle, resolveTarget(), rotation, true);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return scope;
}

// Backwards-compat alias so BottomTickerZone.tsx doesn't break immediately
export const useIconAnimation = (config?: ElementAnimationConfig) =>
  useElementAnimation({ config });
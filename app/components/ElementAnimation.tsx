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
};

export type SpinStep = {
  type: "spin";
  degrees: number; // positive = clockwise, negative = counter-clockwise
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
};

export type FadeStep = {
  type: "fade";
  to?: number;
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
};

export type ScaleStep = {
  type: "scale";
  to?: number;
  duration?: number;
  ease?: Easing | Easing[];
  delay?: number;
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

function applyStagger(
  transition: StepTransition,
  index: number,
  stagger?: number,
): StepTransition {
  if (!stagger) {
    return transition;
  }

  return {
    ...transition,
    delay: (transition.delay ?? 0) + index * stagger,
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
) {
  const targets = normalizeTargets(target);

  if (targets.length <= 1 || !stagger) {
    await animate(target, keyframes, transition);
    return;
  }

  await Promise.all(
    targets.map((element, index) =>
      animate(element, keyframes, applyStagger(transition, index, stagger)),
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
) {
  switch (step.type) {
    case "pause":
      await new Promise((resolve) => setTimeout(resolve, step.duration * 1000));
      return;
    case "parallel":
      await Promise.all(
        step.steps.map((s) => runStep(animate, target, s, rotation, stagger, fps)),
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
      );
      return;
    case "custom":
      await animateTarget(
        animate,
        target,
        step.keyframes,
        applyFpsThrottling(step.transition ?? {}, fps),
        stagger,
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
  /** Target frame rate for the animations (e.g., 12 for a retro/stop-motion feel) */
  fps?: number;
}

export function useElementAnimation({
  config,
  targetSelector,
  stagger,
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
  }, [stagger, targetSelector]);
  
  useEffect(() => {
    if (!config || (!config.loadIn?.length && !config.idle?.length)) return;
    let cancelled = false;

    function resolveTarget(): Element | Element[] {
      const root = scope.current as Element;
      if (!targetSelector) return root;
      return Array.from(root.querySelectorAll(targetSelector));
    }

    async function play(steps: AnimationStep[]) {
      for (const step of steps) {
        if (cancelled) return;
        await runStep(animate, resolveTarget(), step, rotation, stagger, fps);
      }
    }

    (async () => {
      if (config.loadIn?.length) await play(config.loadIn);
      while (!cancelled && config.idle?.length) {
        await play(config.idle);
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
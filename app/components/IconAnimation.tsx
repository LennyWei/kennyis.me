"use client";

import { useEffect, useRef } from "react";
import { useAnimate, type Easing } from "framer-motion";

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
  | CustomStep;

export interface IconAnimationConfig {
  loadIn?: AnimationStep[];
  idle?: AnimationStep[];
}

type AnimateFn = ReturnType<typeof useAnimate>[1];

async function runStep(
  animate: AnimateFn,
  el: Element,
  step: AnimationStep,
  rotation: { current: number },
) {
  switch (step.type) {
    case "pause":
      await new Promise((resolve) => setTimeout(resolve, step.duration * 1000));
      return;

    case "slide": {
      const from = { x: step.from.x ?? 0, y: step.from.y ?? 0 };
      const to = { x: step.to?.x ?? 0, y: step.to?.y ?? 0 };
    //   await animate(el, from, { duration: 0 });
      await animate(el, to, {
        duration: step.duration ?? 0.5,
        ease: step.ease ?? "easeOut",
        delay: step.delay ?? 0,
      });
      return;
    }

    case "spin": {
      rotation.current += step.degrees;
      await animate(
        el,
        { rotate: rotation.current },
        { duration: step.duration ?? 1, ease: step.ease ?? "easeInOut", delay: step.delay ?? 0 },
      );
      return;
    }

    case "fade":
      await animate(
        el,
        { opacity: step.to ?? 1 },
        { duration: step.duration ?? 0.5, ease: step.ease ?? "easeInOut", delay: step.delay ?? 0 },
      );
      return;

    case "scale":
      await animate(
        el,
        { scale: step.to ?? 1 },
        { duration: step.duration ?? 0.5, ease: step.ease ?? "easeInOut", delay: step.delay ?? 0 },
      );
      return;

    case "custom":
      await animate(el, step.keyframes, step.transition);
      return;
  }
}

export function useIconAnimation(config?: IconAnimationConfig) {
  const [scope, animate] = useAnimate();
  const rotation = useRef(0);

  useEffect(() => {
    if (!config || (!config.loadIn?.length && !config.idle?.length)) return;
    let cancelled = false;

    async function play(steps: AnimationStep[]) {
      for (const step of steps) {
        if (cancelled) return;
        await runStep(animate, scope.current as Element, step, rotation);
      }
    }

    // Start the animation sequence
    (async () => {
      if (config.loadIn?.length) await play(config.loadIn);
      while (!cancelled && config.idle?.length) {
        await play(config.idle);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return scope;
}
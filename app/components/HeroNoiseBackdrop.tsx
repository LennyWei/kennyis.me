"use client";

import { motion, useReducedMotion } from "framer-motion";
import CityZoomBackdrop from "./CityZoomBackdrop";
import { useCityZoomControls } from "./CityZoomControls";

export default function HeroNoiseBackdrop() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const config = useCityZoomControls();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <CityZoomBackdrop config={config} />

      <motion.div
        className="absolute inset-0"
        animate={
          shouldReduceMotion
            ? undefined
            : { x: [0, -12, 10, 0], y: [0, 6, -8, 0], scale: [1, 1.02, 1.01, 1] }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 24, ease: "easeInOut", repeat: Infinity }
        }
        style={{
          background:
            "radial-gradient(circle at 50% 14%, rgba(255, 223, 184, 0.16), transparent 20%), radial-gradient(circle at 24% 34%, rgba(255, 170, 92, 0.18), transparent 22%), radial-gradient(circle at 78% 42%, rgba(109, 55, 21, 0.24), transparent 26%), linear-gradient(180deg, rgba(9, 8, 8, 0.05) 0%, rgba(9, 8, 8, 0.22) 58%, rgba(9, 8, 8, 0.5) 100%)",
          mixBlendMode: "screen",
        }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        animate={shouldReduceMotion ? undefined : { y: [0, -8, 0], opacity: [0.4, 0.55, 0.4] }}
        transition={shouldReduceMotion ? undefined : { duration: 16, ease: "easeInOut", repeat: Infinity }}
        style={{
          background:
            "linear-gradient(180deg, rgba(12, 10, 9, 0) 0%, rgba(12, 10, 9, 0.28) 42%, rgba(12, 10, 9, 0.72) 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          className="pointer-events-none max-w-2xl text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.48em] text-amber-100/60">
            City zoom / live tune
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-amber-50 sm:text-5xl lg:text-6xl">
            Fast city, slow horizon
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-amber-100/72 sm:text-base">
            Tune the panel in the corner, then copy the values into the default
            city zoom config when the motion and color balance feels right.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
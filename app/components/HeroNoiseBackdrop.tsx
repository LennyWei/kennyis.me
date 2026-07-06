"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HeroNoiseBackdrop() {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={shouldReduceMotion ? undefined : { x: [0, -10, 8, 0], y: [0, 6, -8, 0], scale: [1.03, 1.06, 1.04, 1.03] }}
        transition={shouldReduceMotion ? undefined : { duration: 26, ease: "easeInOut", repeat: Infinity }}
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(214, 131, 60, 0.28), transparent 0 22%), radial-gradient(circle at 72% 28%, rgba(108, 53, 18, 0.3), transparent 0 24%), radial-gradient(circle at 48% 68%, rgba(244, 179, 96, 0.14), transparent 0 20%), linear-gradient(180deg, rgba(56, 31, 18, 0.98) 0%, rgba(27, 16, 11, 0.98) 52%, rgba(12, 10, 9, 0.99) 100%)",
          backgroundSize: "cover, cover, cover, cover",
          filter: "saturate(1.08) contrast(1.05)",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-55"
        animate={shouldReduceMotion ? undefined : { x: [0, 12, -8, 0], y: [0, -10, 6, 0], scale: [1.01, 1.04, 1.02, 1.01] }}
        transition={shouldReduceMotion ? undefined : { duration: 18, ease: "easeInOut", repeat: Infinity }}
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255, 238, 205, 0.11) 0 1px, transparent 1px 9px), repeating-linear-gradient(25deg, rgba(134, 72, 29, 0.16) 0 2px, transparent 2px 14px), radial-gradient(circle at 50% 50%, rgba(255, 180, 104, 0.18), transparent 56%)",
          backgroundSize: "180px 180px, 240px 240px, cover",
          mixBlendMode: "screen",
          filter: "blur(1px)",
        }}
      />
    </div>
  );
}
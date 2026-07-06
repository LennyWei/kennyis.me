"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface MiddleGradientSwitcherZoneProps {
  className?: string;
  style?: CSSProperties;
  width?: number;
  cardHeight?: number;
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  accentColor?: string;
  radius?: number;
  items?: Array<{
    eyebrow: string;
    title: string;
    caption: string;
    accentLabel?: string;
  }>;
  [key: string]: unknown;
}

type CollageItem = NonNullable<MiddleGradientSwitcherZoneProps["items"]>[number];

type SlideDirection = "left" | "right";

const DEFAULT_ITEMS: CollageItem[] = [
  {
    eyebrow: "Collage 01",
    title: "MOVING SYSTEMS",
    caption: "A prominent center block for shape, rhythm, and identity fragments.",
    accentLabel: "active",
  },
  {
    eyebrow: "Collage 02",
    title: "SIGNAL FIELDS",
    caption:
      "Keyboard-switchable panels built from barcode strips, dots, and interface marks.",
    accentLabel: "next",
  },
  {
    eyebrow: "Collage 03",
    title: "UTILITY GLYPHS",
    caption: "A denser collage state with warmer accents and ability-style controls.",
    accentLabel: "alt",
  },
];

function normalizeItems(items: MiddleGradientSwitcherZoneProps["items"]): CollageItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return DEFAULT_ITEMS;
  }

  const cleaned = items
    .map((item) => {
      if (!item) {
        return null;
      }

      return {
        eyebrow: item.eyebrow ?? "Issue",
        title: item.title ?? "COLLAGE TITLE",
        caption: item.caption ?? "Describe the collage panel.",
        accentLabel: item.accentLabel ?? "",
      } satisfies CollageItem;
    })
    .filter(Boolean) as CollageItem[];

  return cleaned.length > 0 ? cleaned : DEFAULT_ITEMS;
}

function getCardOffset(direction: SlideDirection, target: "incoming" | "outgoing", distance: number) {
  if (target === "incoming") {
    return direction === "right" ? distance : -distance;
  }

  return direction === "right" ? -Math.round(distance * 0.42) : Math.round(distance * 0.42);
}

function ShapeLayer({
  index,
  borderColor,
  accentColor,
  textColor,
  mutedTextColor,
  radius,
}: {
  index: number;
  borderColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
  radius: number;
}) {
  const panel: CSSProperties = {
    position: "absolute",
    borderRadius: Math.max(8, radius * 0.5),
    border: `1px solid ${borderColor}`,
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(2px)",
  };

  if (index % 3 === 0) {
    return (
      <>
        <div style={{ ...panel, top: "10%", left: "6%", width: "46%", height: "52%" }} />
        <div style={{ ...panel, top: "22%", right: "8%", width: "38%", height: "30%", borderRadius: 999 }} />
        <div style={{ ...panel, bottom: "10%", left: "14%", width: "62%", height: "22%" }} />
        <div style={{ position: "absolute", right: "12%", bottom: "14%", width: "24%", height: "18%", borderTop: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}` }} />
        <div style={{ position: "absolute", left: "10%", bottom: "16%", width: "18%", height: 4, background: accentColor }} />
      </>
    );
  }

  if (index % 3 === 1) {
    return (
      <>
        <div style={{ ...panel, top: "14%", left: "10%", width: "34%", height: "66%", borderRadius: radius }} />
        <div style={{ ...panel, top: "12%", right: "8%", width: "44%", height: "24%" }} />
        <div style={{ ...panel, bottom: "14%", right: "10%", width: "44%", height: "42%", borderRadius: 999 }} />
        <div style={{ position: "absolute", top: "22%", right: "16%", width: "32%", height: "12%", display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 2 }}>
          {Array.from({ length: 56 }).map((_, dotIndex) => (
            <span
              key={`dot-${dotIndex}`}
              style={{ width: "100%", aspectRatio: "1 / 1", background: dotIndex % 3 === 0 ? accentColor : borderColor, borderRadius: 999, opacity: 0.9 }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", left: "14%", bottom: "20%", width: "22%", height: 8, background: accentColor, borderRadius: 999 }} />
        <div style={{ position: "absolute", left: "10%", top: "8%", width: "18%", height: 8, background: textColor, opacity: 0.18, borderRadius: 999 }} />
      </>
    );
  }

  return (
    <>
      <div style={{ ...panel, top: "12%", left: "8%", width: "38%", height: "24%", borderRadius: 999 }} />
      <div style={{ ...panel, top: "16%", right: "9%", width: "42%", height: "56%" }} />
      <div style={{ ...panel, bottom: "10%", left: "14%", width: "30%", height: "28%" }} />
      <div style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "16%", height: "56%", display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2 }}>
        {Array.from({ length: 100 }).map((_, barcodeIndex) => (
          <span
            key={`barcode-${barcodeIndex}`}
            style={{ width: "100%", background: barcodeIndex % 2 === 0 ? textColor : "transparent", border: barcodeIndex % 2 === 0 ? "none" : `1px solid ${borderColor}`, opacity: barcodeIndex % 2 === 0 ? 0.2 : 0.4 }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", right: "12%", bottom: "14%", width: "30%", height: "2px", background: accentColor }} />
      <div style={{ position: "absolute", left: "16%", top: "18%", width: "14%", height: "14%", borderRadius: 999, border: `1px solid ${mutedTextColor}`, opacity: 0.4 }} />
    </>
  );
}

export default function MiddleGradientSwitcherZone({
  className = "",
  style,
  width = 1180,
  cardHeight = 420,
  backgroundColor = "rgb(14, 14, 15)",
  textColor = "rgb(245, 238, 220)",
  mutedTextColor = "rgba(245, 238, 220, 0.68)",
  borderColor = "rgba(245, 238, 220, 0.22)",
  accentColor = "rgb(217, 130, 58)",
  radius = 28,
  items,
}: MiddleGradientSwitcherZoneProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>("right");
  const safeItems = useMemo(() => normalizeItems(items), [items]);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const activeIndex = index % safeItems.length;
  const activeItem = safeItems[activeIndex] ?? DEFAULT_ITEMS[0];
  const slideDistance = Math.min(260, Math.max(140, Math.round(width * 0.18)));

  const startTransition = (nextIndex: number, nextDirection: SlideDirection) => {
    if (nextIndex === activeIndex) {
      return;
    }

    setDirection(nextDirection);
    setIndex(nextIndex);
  };

  const cardVariants = {
    enter: (slideDirection: SlideDirection) => ({
      x: shouldReduceMotion ? 0 : getCardOffset(slideDirection, "incoming", slideDistance),
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (slideDirection: SlideDirection) => ({
      x: shouldReduceMotion ? 0 : getCardOffset(slideDirection, "outgoing", slideDistance),
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.985,
    }),
  };

  const cardTransition = {
    duration: shouldReduceMotion ? 0 : 0.42,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <section
      className={`relative z-20 w-full ${className}`.trim()}
      style={{ display: "flex", justifyContent: "center", overflow: "visible", ...style }}
    >
      <article
        className="relative overflow-visible shadow-[0_30px_90px_rgba(0,0,0,0.38)]"
        style={{ width: "100%", maxWidth: `${width}px`, minHeight: `${cardHeight}px`, borderRadius: `${radius}px`, border: `1px solid ${borderColor}`, background: backgroundColor, display: "grid", gridTemplateRows: "1fr auto" }}
      >
        <div className="relative overflow-hidden border-b" style={{ borderColor, minHeight: `${cardHeight - 132}px` }}>
          <div
            aria-hidden="true"
            className="middle-float middle-sweep"
            style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 70% 60%, rgba(255,130,60,0.12), transparent 45%)", filter: "blur(4px)", opacity: 0.65 }}
          />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.42) 100%)" }} />
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: "inherit", willChange: "transform, opacity" }}
            >
              <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                <ShapeLayer index={activeIndex} borderColor={borderColor} accentColor={accentColor} textColor={textColor} mutedTextColor={mutedTextColor} radius={radius} />
              </div>

              <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-4">
                <button
                  type="button"
                  aria-label="Show previous collage"
                  onClick={() => startTransition((activeIndex - 1 + safeItems.length) % safeItems.length, "left")}
                  className="grid h-9 w-9 place-items-center rounded-full border bg-[rgba(8,8,8,0.6)] text-[#f5eedc] backdrop-blur-md transition-transform hover:scale-[1.04]"
                  style={{ borderColor }}
                >
                  ←
                </button>
              </div>

              <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-4">
                <button
                  type="button"
                  aria-label="Show next collage"
                  onClick={() => startTransition((activeIndex + 1) % safeItems.length, "right")}
                  className="grid h-9 w-9 place-items-center rounded-full border bg-[rgba(8,8,8,0.6)] text-[#f5eedc] backdrop-blur-md transition-transform hover:scale-[1.04]"
                  style={{ borderColor }}
                >
                  →
                </button>
              </div>

              <div className="absolute left-6 right-6 top-6 z-10 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-[#f5eedc]/70">
                <span style={{ fontFamily: '"Lato", sans-serif' }}>moving collage surface</span>
                <span style={{ fontFamily: '"Lato", sans-serif' }}>use ← / → keys</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 grid gap-3 px-5 py-4 sm:px-6 sm:py-5" style={{ color: textColor, background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.18) 20%, rgba(10,10,10,0.22) 100%)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="text-[15px] uppercase tracking-[-0.01em] text-[#f5eedc]/70"
                    style={{ fontFamily: '"Lato", sans-serif' }}
                  >
                    {activeItem.eyebrow}
                  </span>
                  {activeItem.accentLabel ? (
                    <span
                      className="rounded-full px-3 py-1 text-[14px] uppercase tracking-[-0.01em]"
                      style={{ background: accentColor, color: backgroundColor, fontFamily: '"Lato", sans-serif' }}
                    >
                      {activeItem.accentLabel}
                    </span>
                  ) : null}
                </div>

                <h2
                  className="m-0 text-[clamp(2.5rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[-0.035em]"
                  style={{ fontFamily: '"Lato", sans-serif' }}
                >
                  {activeItem.title}
                </h2>

                <p
                  className="m-0 max-w-[68ch] text-[14px] leading-[1.35] tracking-[-0.01em] text-[#f5eedc]/68"
                  style={{ fontFamily: '"Lora", serif' }}
                >
                  {activeItem.caption}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </article>
    </section>
  );
}
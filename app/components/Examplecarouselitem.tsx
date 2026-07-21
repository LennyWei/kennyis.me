"use client";

import CarouselManager, { type CarouselRenderMeta } from "./CarouselManager";

/**
 * Marquee-style example. Each item is a colored circle with a short word —
 * a stand-in "hero object" for whatever you build later. This file only
 * exists to show the pattern: CarouselManager handles all motion, this
 * component only decides what an item looks like and what it does on click.
 */
interface HeroItem {
  id: string;
  word: string;
  color: string;
  targetSectionId: string; // section this item scrolls to on click
}

const heroItems: HeroItem[] = [
  { id: "build", word: "BUILD", color: "#D9823A", targetSectionId: "work" },
  { id: "shape", word: "SHAPE", color: "#4A7CD9", targetSectionId: "process" },
  { id: "signal", word: "SIGNAL", color: "#5FBF7A", targetSectionId: "contact" },
  { id: "drift", word: "DRIFT", color: "#B45FD9", targetSectionId: "about" },
];

function HeroCircle({ item }: { item: HeroItem; meta: CarouselRenderMeta }) {
  const handleClick = () => {
    document.getElementById(item.targetSectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
      style={{
        width: 160,
        height: 160,
        background: item.color,
        cursor: "pointer",
      }}
    >
      <span
        className="text-lg font-semibold uppercase tracking-wide text-white"
        style={{ fontFamily: '"Lato", sans-serif' }}
      >
        {item.word}
      </span>
    </button>
  );
}

export default function MarqueeHeroExample() {
  return (
    <CarouselManager
      items={heroItems}
      width={900}
      height={240}
      travelDistance={200} // > circle's 160px width, so it fully clears the mask
      slowZoneWidth={40}
      renderItem={(item, meta) => <HeroCircle item={item} meta={meta} />}
    />
  );
}
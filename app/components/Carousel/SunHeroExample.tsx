"use client";

import CarouselManager from "./CarouselManager";
import { SunHeroIcon, type SunHeroItem } from "./SunHeroIcon";

const heroItems: SunHeroItem[] = [
  { id: "one", color: "#ffbe33", imageSrc: "/about-me/aboutme1.jpg", targetSectionId: "about", holeBackgroundColor: "#fa8c1e" },
  { id: "two", color: "#ffbe33", imageSrc: "/silvane/knight.png", targetSectionId: "silvane", holeBackgroundColor: "#fa8c1e", pixelated: true },
];

export default function SunHeroExample() {
  return (
    <CarouselManager
      items={heroItems}
      width="100%"
      // no fixed `height` — measures its parent, same as HeroNoiseBackdrop
      baseWidth={1200} // reference width travelDistance/arcHeight were tuned at
      travelDistance={800}
      minSpeedFactor={0.03}
      enterDurationMs={1200}
      slowDurationMs={2000}
      exitDurationMs={1200}
      arcHeight={60}
      scaleBoost={1.5}
      fps={12}
      renderItem={(item, meta) => (
        <SunHeroIcon item={item} meta={meta} size={200 * meta.scaleFactor} />
      )}
    />
  );
}
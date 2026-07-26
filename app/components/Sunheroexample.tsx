"use client";

import CarouselManager from "./CarouselManager";
import { SunHeroIcon, type SunHeroItem } from "./SunHeroIcon";

const heroItems: SunHeroItem[] = [
  { id: "one", color: "#D9823A", imageSrc: "/images/placeholder1.png", targetSectionId: "work" },
  { id: "two", color: "#4A7CD9", imageSrc: "/images/lastshotframe1.png", targetSectionId: "process" },
];

export default function SunHeroExample() {
  return (
    <CarouselManager
      items={heroItems}
      width={900}
      height={500}
      travelDistance={500} // > the 200px sun icon, so it fully clears the mask
      minSpeedFactor={0.2}
      enterDurationMs={1500}
      slowDurationMs={2000}
      exitDurationMs={1500}
      arcHeight={36} // dips down slightly ("U") as it crosses center
      scaleBoost={0.65} // 15% larger at the peak of the dip
      renderItem={(item, meta) => <SunHeroIcon item={item} meta={meta} size={200} />}
    />
  );
}
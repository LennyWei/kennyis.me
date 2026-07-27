"use client";

import CarouselManager from "./CarouselManager";
import { SunHeroIcon, type SunHeroItem } from "./SunHeroIcon";

const heroItems: SunHeroItem[] = [
  { id: "one", color: "#ffbe33", imageSrc: "/images/placeholder1.png", targetSectionId: "work", holeBackgroundColor: "#fa8c1e" },
  { id: "two", color: "#ffbe33", imageSrc: "/images/lastshotframe1.png", targetSectionId: "process", holeBackgroundColor: "#fa8c1e" },
];

export default function SunHeroExample() {
  return (
    <CarouselManager
      items={heroItems}
      width={1200}
      height={700}
      travelDistance={800} // > the 200px sun icon, so it fully clears the mask
      minSpeedFactor={0.03}
      enterDurationMs={1200}
      slowDurationMs={2000}
      exitDurationMs={1200}
      arcHeight={60} // dips down slightly ("U") as it crosses center
      scaleBoost={1.50} // 15% larger at the peak of the dip
      fps={12} // retro/stop-motion look — try removing this for fully smooth
      renderItem={(item, meta) => <SunHeroIcon item={item} meta={meta} size={200}/>}
    />
  );
}
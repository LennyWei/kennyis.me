"use client";

import DirectionalBlurBackground from "./DirectionalBlurBackground";

export default function HeroNoiseBackdrop() {
  return (
    <section className="relative isolate min-h-[72vh] w-full overflow-hidden">
      <DirectionalBlurBackground
        imagePath="/images/lastshotframe1.png"
        panSpeed={0.2}
        stretch={20}
        blurAmount={0.006}
        updateInterval={1/6}
      />
    </section>
  );
}
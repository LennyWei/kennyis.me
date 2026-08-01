import BottomTickerZone from "./components/BottomTickerZone";
import HeroNoiseBackdrop from "./components/HeroNoiseBackdrop";
import CarouselManager from "./components/Carousel/CarouselManager";
import { SnapSection, SnapScroll } from "./components/SnapScroll";
import ThinHeader from "./components/ThinHeader";
import TopZone from "./components/TopZone";
import SunHeroExample from "./components/Carousel/SunHeroExample";
import { ContentGrid } from "./components/ContentGrid";
import { AboutSection } from "./components/Section Components/AboutMe";
import { FilmDamage, DEFAULT_FILM_DAMAGE_FRAMES } from "./components/FilmDamage";
import { preload } from "react-dom";
import { SilvaneSection } from "./components/Section Components/Silvane";

export default function Home() {
  return (
    <div className="min-h-screen text-[#f5eedc] bg-[#0b0b0b]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
      />
      <ThinHeader />
      <SnapScroll
        className="relative mx-auto flex gap-20 min-h-screen w-full flex-col overflow-x-hidden px-4 sm:px-6 lg:px-8"
        strength="proximity"
      >
        <SnapSection index={0} id="main" className="relative z-10">
        <main className="mx-auto flex w-[70vw] max-w-none flex-1 flex-col items-stretch justify-start gap-6 py-0 sm:py-12 lg:py-16">
          <TopZone className="max-w-none" />

          <section
            className="relative h-[350px] w-full overflow-visible"
          >
            <HeroNoiseBackdrop />
            <div className="absolute pb-25 inset-0 flex items-center justify-center">
                <SunHeroExample />
            </div>
          </section>
          <FilmDamage tileHeight={512}>
          <BottomTickerZone className="max-w-none" style={{ maxWidth: "none" }} />
          </FilmDamage>
        </main>
        </SnapSection>

        <SnapSection index={1} id="about" className="relative z-10">
          <AboutSection></AboutSection>
        </SnapSection>

        <h1 
        className="mx-auto select-none text-balance text-[clamp(2rem,6vw,5rem)] leading-[0.9] tracking-[0.005em] text-[#f32333] drop-shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        style={{ fontFamily: '"UnifrakturMaguntia", serif' }}
        >
            Projects
        </h1>

        <SnapSection index={2} id="projects" className="relative z-10">
          <SilvaneSection></SilvaneSection>
        </SnapSection>
      </SnapScroll>


    </div>
  );
}

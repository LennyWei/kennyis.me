import BottomTickerZone from "./components/BottomTickerZone";
import HeroNoiseBackdrop from "./components/HeroNoiseBackdrop";
import MiddleGradientSwitcherZone from "./components/MiddleGradientSwitcherZone";
import ThinHeader from "./components/ThinHeader";
import TopZone from "./components/TopZone";

export default function Home() {
  return (
    <div className="min-h-screen text-[#f5eedc] bg-[#0b0b0b]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(217,130,58,0.16), transparent 28%), radial-gradient(circle at 18% 18%, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #11100f 0%, #0b0b0b 42%, #070707 100%)",
        }}
      />
      <ThinHeader />
      <div
        className="relative mx-auto flex min-h-screen w-full flex-col overflow-x-hidden px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1600 }}
      >
        <main className="flex flex-1 flex-col items-center justify-start gap-3 py-0 sm:py-12 lg:py-16">
          <TopZone />
          <section
            className="relative w-screen overflow-visible py-10 sm:py-12 lg:py-16"
            style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
          >
            <HeroNoiseBackdrop />
            <div className="relative z-10">
              <MiddleGradientSwitcherZone />
            </div>
          </section>
          <BottomTickerZone />
        </main>
        
      </div>
    </div>
  );
}

"use client"
import { AutoTextSize } from "auto-text-size";
import { ContentGrid, GridBlock } from "../ContentGrid";
import FitText from "../FitText";
import { FitTextSVG } from "../FitTextSVG";
import { BarcodeIcon, GlobeLightIcon, IconFill, StarFourPointsIcon } from "../BottomTickerZone";
import { FitParagraphSVG } from "../FitParagraphSVG";
import { ElementAnimationConfig, useElementAnimation } from "../ElementAnimation";
import { FilmDamage } from "../FilmDamage";


const config: ElementAnimationConfig = {
idle: [
  { type: "slide", from: {x:0, y:0}, to: {x:0, y:-80}, ease: "easeOut"},
  { type: "slide", from: {x:0, y:-80}, to: {x:0, y:0}, ease: "easeIn" },
  { type: "pause", duration: 0.0 },
],
};

export function SilvaneSection() {

  const scope = useElementAnimation({ 
    config,
    targetSelector: ".knight",
    randomStagger: {min:0, max:0.7},
    independentIdle: true,
  });

  return (
    <ContentGrid
      rows={4}
      cols={6}
      rowSizes={["4fr", "2fr", "4fr", "0.8fr"]}
      colSizes={["2fr","1fr", "1fr", "1fr", "1fr", "2fr"]}
      height="700px"
      width="70vw"
      gap="0.8rem"
      className="mx-auto"
      showGuides = {false}
    >
      {/* running around gif*/}
      <GridBlock
        rowStart={1}
        rowSpan={1}
        colStart={1}
        colSpan={2}
        className="overflow-hidden"
      >
        <img
          src="/silvane/silvane1.gif"
          alt="Portrait"
          className="h-full w-full scale-101 object-cover object-[center_50%]"
        />
      </GridBlock>

      {/* Title */}
      <GridBlock
      rowStart={2}
      rowSpan={1}
      colStart={1}
      colSpan={2}
      >
      
      <div className="relative h-full w-full">
      <FitTextSVG className="font-bold uppercase fill-[#68fcaf]"
      style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
      axis="xy"
      >
      SILVANE
      </FitTextSVG>
      </div>
      </GridBlock>
        
      {/* bottom left gif */}
      <GridBlock
      rowStart={3}
      rowSpan={1}
      colStart={1}
      colSpan={2}
      className="overflow-hidden">
        <img
          src="/silvane/silvane2.gif"
          alt="Portrait"
          className="h-full w-full scale-120 object-cover object-[center_50%]"
        />
      </GridBlock>
      
      {/* maybe a bit below silvane or bottom left  */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={1}
      colSpan={2}
      className="border-1 border-[#68fcaf] p-1"
      >
        <a
          href="https://lennykiang.itch.io/silvane"
          target="_blank"
          rel="noreferrer"
          className="block h-full w-full"
        >
          <FitTextSVG className="font-bold fill-[#68fcaf]"
          style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
          axis="xy"
          >
          lennykiang.itch.io/silvane
          </FitTextSVG>
        </a>
      </GridBlock>

      {/* Right Pic */}
      <GridBlock
      rowStart={1}
      rowSpan={3}
      colStart={6}
      colSpan={1}
      className="overflow-hidden">
        <img
          src="/silvane/silvane3.gif"
          alt="Portrait"
          className="h-full w-full scale-101 object-cover object-[center_90%]"
        />
      </GridBlock>



      {/* Main Body */}
      <GridBlock
      rowStart={1}
      rowSpan={4}
      colStart={3}
      colSpan={3}
      >
      <FitParagraphSVG
        fontSize={40}
        lineHeight={1.1}
        className="fill-[#68fcaf]"
        style={{ fontFamily: '"Lato", sans-serif' }}
        adjust="spacing"
      >
        {[
          "Published a 2D souls-like video game on itch.io.",
          "Built an modular enemy AI system using FSMs, creating 3 unique enemies and 2 bosses.",
          "Designed an inventory system with crafting mechanics."

        ]}
        
      </FitParagraphSVG>
      </GridBlock>

      {/* tools used */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={3}
      colSpan={4}
      className="p-1"
      >
        <FitTextSVG className="font-bold  fill-[#68fcaf]"
        style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
        axis="xy"
        >
        Tools:   Unity  C#  Piskel  FreeSound  Sonu.ai
        </FitTextSVG>
      </GridBlock>

      {/* knight image bot right*/}
      <GridBlock
      rowStart={3}
      rowSpan={1}
      colStart={3}
      colSpan={3}
      className="">
        <div
        ref = {scope}
        className="flex justify-items">
        <img
          src="/silvane/knight.png"
          alt="Portrait"
          className="knight overflow-visible w-full h-full scale-50 translate-y-20 object-cover [image-rendering:pixelated]"
        />
        <img
          src="/silvane/knight.png"
          alt="Portrait"
          className="knight overflow-visible w-full h-full scale-50 -scale-x-50 translate-y-20 object-cover [image-rendering:pixelated]"
        />
        <img
          src="/silvane/knight.png"
          alt="Portrait"
          className="knight overflow-visible w-full h-full scale-50 -scale-x-50 translate-y-20 object-cover [image-rendering:pixelated]"
        />
        </div>
      </GridBlock>
    </ContentGrid>
  );
}
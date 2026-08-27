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
  { type: "slide", from: {x:0, y:0}, to: {x:-50, y:0}, ease: "easeInOut"},
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:-50, y:0}, to: {x:-100, y:0}, ease: "easeInOut" },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:-100, y:0}, to: {x:-150, y:0}, ease: "easeInOut" },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:-150, y:0}, to: {x:-100, y:0}, ease: "easeInOut", reverseStagger: true },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:-100, y:0}, to: {x:-50, y:0}, ease: "easeInOut", reverseStagger: true  },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:-50, y:0}, to: {x:-0, y:0}, ease: "easeInOut", reverseStagger: true  },
  { type: "pause", duration: 1 },
],
};

export function AboutSection() {

  const scope = useElementAnimation({ 
    config,
    targetSelector: ".ticker-item",
    stagger: 0.15, // seconds between each matched child
  });

  return (
    <ContentGrid
      rows={6}
      cols={5}
      rowSizes={["1fr", "1fr", "0.7fr", "0.3fr", "1.5fr", "0.5fr",]}
      colSizes={["1.5fr", "0.5fr", "4fr", "1fr", "1fr"]}
      height="700px"
      width="70vw"
      gap="0.5rem"
      className="mx-auto"
      showGuides = {false}
    >
      {/* Portrait — top-left, 2 cols x 5 rows */}
      <GridBlock
        rowStart={1}
        rowSpan={4}
        colStart={1}
        colSpan={2}
        className="overflow-hidden rounded-lg "
      >
        <img
          src="/about-me/aboutme1.jpg"
          alt="Portrait"
          className="h-full w-full object-cover"
        />
      </GridBlock>

      {/* About me Title — top-mid, 2 cols x 1 row */}
      <GridBlock
      rowStart={1}
      rowSpan={1}
      colStart={3}
      colSpan={1}
      >
      {/* <AutoTextSize 
        mode="boxoneline" 
        className = "min-h-0 min-w-0 text-center text-[clamp(2rem,6vw,4rem)] font-bold  text-[#f5eedc]"
        style={{ fontFamily: '"Lato", sans-serif' }}
      >
        ABOUT ME
      </AutoTextSize> */}
      
      <div className="relative h-full w-full">
      <FitTextSVG className="font-bold uppercase fill-[#f7bd1b]"
      style={{ fontFamily: '"Playfair Display", serif', textAlign: 'center' }}
      axis="xy"
      >
      About Me
      </FitTextSVG>
      </div>
      </GridBlock>
        
      {/* Middle Pic */}
      <GridBlock
      rowStart={2}
      rowSpan={3}
      colStart={3}
      colSpan={1}
      className="overflow-hidden ">
        <img
          src="/about-me/aboutme2.jpg"
          alt="Portrait"
          className="h-full w-full object-cover object-[center_00%]"
        />
      </GridBlock>
      
      {/* Top Right Pic */}
      <GridBlock
      rowStart={1}
      rowSpan={2}
      colStart={4}
      colSpan={2}
      className="overflow-hidden rounded-lg">
        <img
          src="/about-me/aboutme3.jpg"
          alt="Portrait"
          className="h-full w-full object-cover object-[center_40%]"
        />
      </GridBlock>

      {/* chinese */}
      <GridBlock
      rowStart={3}
      rowSpan={1}
      colStart={4}
      colSpan={2}
      className="border-4 rounded-2xl border-[#f7bd1b] p-1"
      >

        <FitTextSVG className="font-bold uppercase fill-[#f7bd1b]"
        style={{ fontFamily: '"Noto Sans SC", sans-serif', textAlign: 'center' }}
        axis="xy"
        >
        这是我
        </FitTextSVG>
      </GridBlock>
      
      {/* Barcode */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={4}
      colSpan={2}
      className="flex items-center justify-center gap-0">

        <IconFill
        src="/icons/ic--twotone-barcode.svg"
        fit="cover"
        className="w-full h-full"
        color="#f7bd1b"
        >
        </IconFill>
      </GridBlock>
      
      {/* Star */}
      <GridBlock
      rowStart={5}
      rowSpan={2}
      colStart={1}
      colSpan={1}
      className="flex items-center justify-center gap-0">

        <IconFill
        src="/icons/mdi--star-four-points.svg"
        fit="cover"
        animation={{
          idle: [
            { type: "spin", degrees: -90, duration: 1.4, ease: "easeInOut" },
            { type: "pause", duration: 1 },
          ],
        }}
        color="#f7bd1b"
        >
        </IconFill>
      </GridBlock>

      {/* Main Body */}
      <GridBlock
      rowStart={5}
      rowSpan={1}
      colStart={2}
      colSpan={4}
      className="pt-1"
      >
      <FitParagraphSVG
        fontSize={43}
        lineHeight={1.3}
        className="fill-[#f7bd1b] "
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        adjust="spacing"
        targetLines={3}
        paragraphSpacing={1}
      >
        {/* {
          ["Computer science student who loves creating and the ",
            "creative process. Recently interested in game ",
            "development, AI API tools, and full stack app development."]
        } */}

        Computer science student who loves creating and the creative process. Recently interested in game development, AI API tools, and full stack development.
      </FitParagraphSVG>
      </GridBlock>

      {/* Icons below */}

      <GridBlock
        rowStart = {6}
        rowSpan = {1}
        colStart = {2}
        colSpan = {4}
        className="flex justify-end border-3 border-[#f7bd1b]"
      >
      <div
      ref = {scope}
      >
        <GlobeLightIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item"
        >
        </GlobeLightIcon>
        <StarFourPointsIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item">
        </StarFourPointsIcon>
                <GlobeLightIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item">
        </GlobeLightIcon>
        <StarFourPointsIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item">
        </StarFourPointsIcon>
                <GlobeLightIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item">
        </GlobeLightIcon>
        <StarFourPointsIcon
        size={50}
        color="#f7bd1b"
        className="ticker-item">
        </StarFourPointsIcon>

      </div>
      </GridBlock>

    </ContentGrid>
  );
}
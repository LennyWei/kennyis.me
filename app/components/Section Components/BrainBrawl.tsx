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

export function BrainBrawlSection() {

  const scope = useElementAnimation({ 
    config,
    targetSelector: ".knight",
    randomStagger: {min:0, max:0.7},
    independentIdle: true,
  });

  const color = "#2553e8"

  return (
    <ContentGrid
      rows={4}
      cols={5}
      rowSizes={["3fr", "1.0fr", "1.5fr", "0.2fr"]}
      colSizes={["0.9fr","0.8fr", "1.2fr", "1fr","1fr"]}
      height="700px"
      width="70vw"
      gap="0.0rem"
      className="mx-auto"
      showGuides = {false}
    >
      {/* main game */}
      <GridBlock
        rowStart={1}
        rowSpan={1}
        colStart={2}
        colSpan={4}
        className="overflow-hidden pb-2"
      >
        <img
          src="/hackpsu/hackpsu1.png"
          alt="Portrait"
          className="h-full w-full scale-101 object-cover object-[center_80%]"
        />
      </GridBlock>

      {/* Title */}
      <GridBlock
      rowStart={1}
      rowSpan={2}
      colStart={1}
      colSpan={1}
      className="p-4 bg-[#3670f7]"
      >
      
      <div className="relative h-full w-full z-10 ">
      <FitParagraphSVG className="font-bold uppercase fill-[#000000] "
      style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
      fontSize={120}
      lineHeight={0.9}
      adjust="spacingAndGlyphs"
      justifyLastLine
      orientation="vertical"
      paragraphSpacing={1}
      >
      {
        ["BRAIN", "BRAWL"]
      }
      </FitParagraphSVG>
      </div>
      </GridBlock>
        
      {/* bottom left  */}
      <GridBlock
      rowStart={2}
      rowSpan={1}
      colStart={2}
      colSpan={2}
      className="overflow-hidden pr-2">
        <img
          src="/hackpsu/hackpsu2.jpg"
          alt="Portrait"
          className="h-full w-full object-cover object-[center_25%]"
        />
      </GridBlock>

      {/* bottom left  */}
      <GridBlock
      rowStart={2}
      rowSpan={1}
      colStart={4}
      colSpan={2}
      className="overflow-hidden">
        <img
          src="/hackpsu/hackpsu4.jpg"
          alt="Portrait"
          className="h-full w-full object-cover scale-100 object-[center_33%]"
        />
      </GridBlock>
      
      {/* maybe a bit below silvane or bottom left  */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={1}
      colSpan={2}
      className="border-1 border-[#3670f7] p-1"
      >
        <FitTextSVG className="font-bold  fill-[#3670f7]"
        style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
        axis="xy"
        >
        https://lennykiang.itch.io/silvane
        </FitTextSVG>
      </GridBlock>



      {/* Main Body */}
      <GridBlock
      rowStart={3}
      rowSpan={1}
      colStart={1}
      colSpan={4}
      className="pt-2"
      >
      <FitParagraphSVG
        fontSize={27}
        lineHeight={1.2}
        className="fill-[#3670f7]"
        style={{ fontFamily: '"Lato", sans-serif' }}
        adjust="spacing"
      >
        {[
          "Designed a Full Stack web app using Next.js, Typescript, Flask, Gemini API, and Vercel",
          "Gamified Study tool that utilizes pdf's of user notes/lectures to generate personalized enemies and questions.",
          "Submitted to HackPSU - Won \"Best Use Of Gemini API\"",
        ]}
        
      </FitParagraphSVG>
      </GridBlock>
      
      {/* tools used */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={3}
      colSpan={2}
      className="p-1"
      >
        <FitTextSVG className="font-bold  fill-[#3670f7]"
        style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
        axis="xy"
        >
        Tools:   Unity  C#  Piskel  FreeSound  Sonu.ai
        </FitTextSVG>
      </GridBlock>
      
      {/* Star */}
      <GridBlock
      rowStart={3}
      rowSpan={2}
      colStart={5}
      colSpan={1}
      className="flex items-center justify-center gap-0 border-4 rounded-2xl border-yellow-300 z-0">

        <IconFill
        src="/icons/trophy.svg"
        fit="cover"
        animation={{
          idle: [
            { type: "scale", to:1.1, duration: 0.5, ease: "easeInOut" },
            { type: "pause", duration: 1 },
            { type: "scale", to:1.0, duration: 0.5, ease: "easeInOut" },
            { type: "pause", duration: 1 },
          ],
        }}
        color="#f7bd1b"
        >
        </IconFill>
      </GridBlock>


    </ContentGrid>
  );
}
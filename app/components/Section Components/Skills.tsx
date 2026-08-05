"use client"
import { AutoTextSize } from "auto-text-size";
import { ContentGrid, GridBlock } from "../ContentGrid";
import FitText from "../FitText";
import { FitTextSVG } from "../FitTextSVG";
import { BarcodeIcon, GlobeLightIcon, IconBase, IconFill, StarFourPointsIcon, XCrossIcon } from "../BottomTickerZone";
import { FitParagraphSVG } from "../FitParagraphSVG";
import { ElementAnimationConfig, useElementAnimation } from "../ElementAnimation";
import { FilmDamage } from "../FilmDamage";

const move = 120 

const config: ElementAnimationConfig = {
idle: [
  { type: "slide", from: {x:0, y:0}, to: {x:move, y:0}, duration: 1, ease: "easeInOut"},
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:move, y:0}, to: {x:move, y:move}, duration: 1, ease: "easeInOut" },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:move, y:move}, to: {x:0, y:move}, duration: 1, ease: "easeInOut" },
  { type: "pause", duration: 1 },
  { type: "slide", from: {x:0, y:move}, to: {x:0, y:0}, duration: 1, ease: "easeInOut"},
  { type: "pause", duration: 1 },
],
};

export function SkillsSection() {
  const scope = useElementAnimation({ 
    config,
    targetSelector: ".square",
    stagger: 1, // seconds between each matched child
    independentIdle: true,
  });

  return (
    <ContentGrid
      rows={4}
      cols={3}
      rowSizes={["1fr", "1fr", "0.7fr", "1.0fr",]}
      colSizes={["1.5fr", "3fr", "1.5fr"]}
      height="700px"
      width="70vw"
      gap="0.5rem"
      className="mx-auto"
      showGuides = {true}
    >
      {/* boxes top left*/}
      <GridBlock
        rowStart={1}
        rowSpan={1}
        colStart={1}
        colSpan={1}
        className="overflow-hidden rounded-lg "
      >
        <div ref={scope}>
          <XCrossIcon
          className="absolute square"
          size={50}
          ></XCrossIcon>
          <XCrossIcon
          className="absolute square"
          size={50}
          ></XCrossIcon>

        </div>
      </GridBlock>

      {/* Skills Title */}
      <GridBlock
      rowStart={1}
      rowSpan={1}
      colStart={2}
      colSpan={1}
      className="p-6"
      >
      
      <div className="relative h-full w-full">
      <FitTextSVG className="font-bold uppercase fill-[#dbdbdb]"
      style={{ fontFamily: '"Lato", sans-serif', textAlign: 'center' }}
      axis="xy"
      >
      SKILLS
      </FitTextSVG>
      </div>
      </GridBlock>
        
      {/* Right Triangle */}
      <GridBlock
      rowStart={1}
      rowSpan={1}
      colStart={3}
      colSpan={1}
      className="overflow-hidden ">
        <img
          src="/about-me/aboutme2.jpg"
          alt="Portrait"
          className="h-full w-full object-cover object-[center_00%]"
        />
      </GridBlock>
      

      {/* Bullet points Main Body */}
      <GridBlock
      rowStart={3}
      rowSpan={1}
      colStart={1}
      colSpan={3}
      className="pt-1"
      >
      <FitParagraphSVG
        fontSize={43}
        lineHeight={1.0}
        className="fill-[#dbdbdb] "
        style={{ fontFamily: '"Lato", sans-serif' }}
        adjust="spacing"
        
      >
        {
          ["Solved 150 LeetCode Problems", 
            ""

          ]
        }
      </FitParagraphSVG>
      </GridBlock>

      {/* Grid Main Body */}
      <GridBlock
      rowStart={4}
      rowSpan={1}
      colStart={1}
      colSpan={3}
      className="pt-1"
      >
      <ContentGrid
        rows={3}
        cols={3}
        rowSizes={["1fr", "1fr", "1fr",]}
        colSizes={["1fr", "1fr", "1fr"]}
        height="100%"
        width="70vw"
        gap="0.5rem"
        className="mx-auto"
        showGuides = {true}
      >
        <GridBlock
          rowStart={1}
          rowSpan={1}
          colStart={1}
          colSpan={1}>
        Hello

        </GridBlock>


      </ContentGrid>


      </GridBlock>
    </ContentGrid>
  );
}
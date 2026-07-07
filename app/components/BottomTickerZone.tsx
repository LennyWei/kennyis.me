"use client";
import type { CSSProperties, ComponentType } from "react";
import { motion } from "framer-motion";
import { getInitialFromConfig, useElementAnimation, type ElementAnimationConfig } from "./ElementAnimation";

export interface BottomZoneProps {
  className?: string;
  style?: CSSProperties;
  messages?: string[];
  [key: string]: unknown;
  
}

const DEFAULT_MESSAGES = [
  "ENEMY HIT: 120 ON [AGENT]",
  "SPOTTED MULTIPLE MIDDROPPING SPIKE A LONG",
  "ROTATING TO B SITE NOW",
  "NEED HEALS / UTILITY PLEASE",
  "NICE SHOT, GREAT ROUND!",
  "LET'S ECO AND BUY NEXT",
  "DON'T PEEK, LET THEM PUSH",
  "PLAY FOR TIME, THEY HAVE TO DEFUSE",
  "BUYING YOU A VANDAL, DROP ME A SHORTY",
];

export type BottomZoneIconProps = {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  scaleX?: number;
  scaleY?: number;
  color?: string;
  gapLeft?: number | string;
  gapRight?: number | string;
  style?: CSSProperties;
  animation?: ElementAnimationConfig;
};

type IconBaseProps = BottomZoneIconProps & {
  src: string;
};

const DEFAULT_ICON_SIZE = 18;
const DEFAULT_LEFT_GAP = 10;
const DEFAULT_RIGHT_GAP = 10;
const DEFAULT_ICON_COLOR = "#f32333";

function toCssSize(value: number | string | undefined, fallback: number) {
  if (value === undefined) {
    return `${fallback}px`;
  }

  return typeof value === "number" ? `${value}px` : value;
}

function IconBase({
  src,
  className = "",
  size = DEFAULT_ICON_SIZE,
  width,
  height,
  scaleX = 1,
  scaleY = 1,
  color = DEFAULT_ICON_COLOR,
  gapLeft = DEFAULT_LEFT_GAP,
  gapRight = DEFAULT_RIGHT_GAP,
  style,
  animation,
}: IconBaseProps) {
  const scope = useElementAnimation({ config: animation });
  const initial = getInitialFromConfig(animation);

  return (
    <motion.span
      ref={scope}
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`.trim()}
      initial={{ scaleX, scaleY, ...initial }} // baseline mirror/flip, framer composes this with animated x/y/rotate
      style={{
        width: toCssSize(width, typeof size === "number" ? size : DEFAULT_ICON_SIZE),
        height: toCssSize(height, typeof size === "number" ? size : DEFAULT_ICON_SIZE),
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        marginLeft: gapLeft,
        marginRight: gapRight,
        ...style,
      }}
    />
  );
}

export function HandFilledIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/boxicons--hand-filled.svg" {...props} />;
}

export function XCrossIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/guidance--remove-x-cross.svg" {...props} />;
}

export function BarcodeIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/ic--twotone-barcode.svg" {...props} />;
}

export function ArrowsCrossIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/vaadin--arrows-cross.svg" {...props} />;
}

export function StarFourPointsIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/mdi--star-four-points.svg" {...props} />;
}

export function ShurikenIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/file-icons--shuriken.svg" {...props} />;
}

export function GlobeLightIcon(props: BottomZoneIconProps) {
  return <IconBase src="/icons/stash--globe-light.svg" {...props} />;
}

function TextMarker() {
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.36em] text-[#f32333] sm:text-[12px]"
      style={{ fontFamily: '"Lato", sans-serif' }}
    >
      PORTFOLIO
    </span>
  );
}

type IconComponent = ComponentType<{
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  scaleX?: number;
  scaleY?: number;
  color?: string;
  gapLeft?: number | string;
  gapRight?: number | string;
  style?: CSSProperties;
}>;

type IconSlot =
  | { kind: "icon"; component: IconComponent; props?: BottomZoneIconProps }
  | { kind: "label" };

const ICON_SEQUENCE: IconSlot[] = [
  { kind: "icon", component: HandFilledIcon, props: { size: 18, scaleX: 1.05, scaleY: 1.05} },
  { kind: "icon", component: XCrossIcon, props: { size: 16, scaleX: 1.1, scaleY: 1.1 } },
  { kind: "icon", component: HandFilledIcon, props: { size: 18, scaleX: 1.05, scaleY: 1.05 } },
  { kind: "icon", component: BarcodeIcon, props: { size: 18, scaleX: 4, scaleY: 2, gapRight: 30, gapLeft: 20} },
  { kind: "icon", component: BarcodeIcon, props: { size: 18, scaleX: 4, scaleY: 2, gapRight: 20, gapLeft: 20 } },
  { kind: "icon", component: ArrowsCrossIcon, props: { size: 18, scaleX: 1.08, scaleY: 1.08 } },
  { kind: "icon", component: StarFourPointsIcon, props: { size: 18, scaleX: 1.12, scaleY: 1.12} },
  { kind: "icon", component: ShurikenIcon, props: { size: 18, scaleX: 1.48, scaleY: 1.48,
    animation: {
      loadIn: [{ type: "slide", from: { y: 24 }, to: { y: 0 }, duration: 0.5, ease: "easeOut" }],
      idle: [
        { type: "spin", degrees: -360, duration: 1.4, ease: "easeInOut" }, // spins left
        { type: "pause", duration: 1 },
      ],
    }
  } },
  { kind: "icon", component: GlobeLightIcon, props: { size: 18, scaleX: 1.08, scaleY: 1.08, gapRight: 1, gapLeft: 12 } },
  { kind: "icon", component: StarFourPointsIcon, props: { size: 18, scaleX: 1.12, scaleY: 1.12} },
  { kind: "label" },
  { kind: "icon", component: StarFourPointsIcon, props: { size: 18, scaleX: 1.12, scaleY: 1.12} },
  { kind: "icon", component: GlobeLightIcon, props: { size: 18, scaleX: 1.08, scaleY: 1.08, gapRight: 12, gapLeft: 1 } },
  { kind: "icon", component: ShurikenIcon, props: { size: 18, scaleX: -1.48, scaleY: 1.48,
    animation: {
      loadIn: [{ type: "slide", from: { y: 24 }, to: { y: 0 }, duration: 0.5, ease: "easeOut" }],
      idle: [
        { type: "spin", degrees: -360, duration: 1.4, ease: "easeInOut" }, // spins left
        { type: "pause", duration: 1 },
      ],
    }
  } },
  { kind: "icon", component: StarFourPointsIcon, props: { size: 18, scaleX: 1.12, scaleY: 1.12} },
  { kind: "icon", component: ArrowsCrossIcon, props: { size: 18, scaleX: 1.08, scaleY: 1.08} },
  { kind: "icon", component: BarcodeIcon, props: { size: 18, scaleX: 4, scaleY: 2, gapRight: 30, gapLeft: 20} },
  { kind: "icon", component: BarcodeIcon, props: { size: 18, scaleX: 4, scaleY: 2, gapRight: 20, gapLeft: 20 } },
  { kind: "icon", component: HandFilledIcon, props: { size: 18, scaleX: 1.05, scaleY: 1.05,
    animation: {
      idle: [
        { type: "slide", from: { y: 0 }, to: { y: -6 }, duration: 0.3, ease: [0.64, 0, 0.78, 0] },
        { type: "slide", from: { y: -6 }, to: { y: 0 }, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        { type: "pause", duration: 1 },
      ],
    }
  } },

  { kind: "icon", component: XCrossIcon, props: { size: 16, scaleX: 1.1, scaleY: 1.1} },
  { kind: "icon", component: HandFilledIcon, props: { size: 18, scaleX: 1.05, scaleY: 1.05,
    animation: {
      idle: [
        { type: "pause", duration: 1 },
        { type: "slide", from: { y: 0 }, to: { y: -6 }, duration: 0.3, ease: [0.64, 0, 0.78, 0] },
        { type: "slide", from: { y: -6 }, to: { y: 0 }, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      ],
    }
   } },
];

export default function BottomZone({
  className = "",
  style,
  messages = DEFAULT_MESSAGES,
}: BottomZoneProps) {
  const monologue = messages.join("  ·  ");

  // Animation config for the icon row
  const config = {
    loadIn: [
      {
        type: "slide",
        from: { x: 48 },
        to: { x: 0 },
        duration: 0.5,
        ease: "easeOut",
      },
      {
        type: "fade",
        to: 1,
        duration: 0.5,
      }
    ],
  } satisfies ElementAnimationConfig;

  const iconRowScope = useElementAnimation({ config })



  return (
    <footer
      aria-label="Bottom zone"
      className={`mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 ${className}`.trim()}
      style={{ maxWidth: 1180, ...style }}
    >
      <div className="flex w-full flex-col items-center gap-3 text-[#f32333]">
        <div
          className="w-full max-w-280 text-center text-[17px] font-medium uppercase tracking-[0.20em] text-[#f32333] sm:text-[9px]"
          style={{ fontFamily: '"Lato", sans-serif' }}
        >
          <p className="mx-auto max-w-full text-balance leading-tight">{monologue}</p>
        </div>

        <div className="h-px w-full max-w-280 bg-[#f32333]/45" />


        {/*Remember im setting opacity to 0, then animating it to 1*/}
        <div ref={iconRowScope} className="opacity-0 flex w-full max-w-280 flex-wrap items-center justify-center gap-y-4">
          {ICON_SEQUENCE.map((item, index) => {
            if (item.kind === "label") {
              return <TextMarker key={`portfolio-${index}`} />;
            }

            const Icon = item.component;

            return (
              <span key={`${Icon.name}-${index}`} className="inline-flex items-center">
                <Icon {...item.props} />
              </span>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
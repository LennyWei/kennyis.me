"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

interface FitTextSVGProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  containerClassName?: string;
  axis?: "x" | "xy";
  adjust?: "spacing" | "spacingAndGlyphs";
  /** "horizontal" (default) fills the box left-to-right. "vertical" rotates
   *  the text 90° so it fills the box bottom-to-top, e.g. for a tall column. */
  orientation?: "horizontal" | "vertical";
}

export function FitTextSVG({
  children,
  className = "",
  style,
  containerClassName = "",
  axis = "x",
  adjust = "spacingAndGlyphs",
  orientation = "horizontal",
}: FitTextSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const rect = container.getBoundingClientRect();
      setBox({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const isVertical = orientation === "vertical";
  // The dimension the text stretches ALONG, and the dimension it fills as
  // thickness (font-size direction). For vertical text these are swapped
  // relative to the physical box.
  const fitLength = isVertical ? box.height : box.width;
  const fitThickness = isVertical ? box.width : box.height;

  useEffect(() => {
    if (axis !== "xy") {
      setScaleY(1);
      return;
    }
    const textEl = textRef.current;
    if (!textEl || fitThickness === 0) return;

    const bbox = textEl.getBBox();
    if (bbox.height === 0) return;

    setScaleY((fitThickness * 1.0) / bbox.height);
  }, [box, axis, children, fitThickness]);

  const cx = box.width / 2;
  const cy = box.height / 2;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: "100%", height: "100%" }}
    >
      {box.width > 0 && box.height > 0 && (
        <svg width={box.width} height={box.height} viewBox={`0 0 ${box.width} ${box.height}`}>
          <g transform={isVertical ? `rotate(-90 ${cx} ${cy})` : undefined}>
            <text
              ref={textRef}
              x={isVertical ? cx - fitLength / 2 : 0}
              y={isVertical ? cy : box.height / 2}
              dominantBaseline="middle"
              textLength={fitLength}
              lengthAdjust={adjust}
              className={className}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: `scaleY(${scaleY * 1.2})`,
                whiteSpace: "pre",
                ...style,
              }}
            >
              {children}
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}
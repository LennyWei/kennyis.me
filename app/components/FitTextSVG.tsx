"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

/**
 * FitTextSVG
 * ----------
 * Like FitText, but uses SVG's native `textLength` attribute to stretch text
 * to an exact width instead of a CSS transform + JS measurement dance. The
 * browser's text layout engine does the horizontal fitting itself — more
 * accurate, and structurally simpler (no hidden measuring clone needed for
 * the X axis, since textLength doesn't require knowing the natural width
 * up front).
 *
 * Vertical fit (axis="xy") still requires one JS measurement via getBBox(),
 * since SVG has no textLength equivalent for height — but it's simpler than
 * the old approach since textLength doesn't affect vertical metrics, so a
 * single getBBox() read on the live element gives an honest natural height.
 *
 * USAGE — same drop-in pattern as FitText, inside a sized container:
 *
 * <GridBlock rowStart={1} rowSpan={1} colStart={3} colSpan={2}>
 *   <FitTextSVG className="font-bold uppercase fill-[#f5eedc]">
 *     About Me
 *   </FitTextSVG>
 * </GridBlock>
 *
 * Note: styling is via SVG conventions — use `fill` for text color (not
 * `color`), and font-family/weight/size still work as normal CSS properties
 * on the <text> element via className or style.
 */

interface FitTextSVGProps {
  children: string;
  /** Classes for the <text> element — font-family, font-weight, fill (color), etc. */
  className?: string;
  /** Inline styles for the <text> element */
  style?: CSSProperties;
  /** Classes for the outer wrapping div */
  containerClassName?: string;
  /** "x" (default) fits width only, natural height. "xy" also fits height via a measured scale. */
  axis?: "x" | "xy";
  /**
   * "spacingAndGlyphs" (default) stretches letterforms to hit the exact width.
   * "spacing" only adjusts spacing between characters, leaving letter shapes
   * untouched — often looks more typographically honest, less "distorted."
   */
  adjust?: "spacing" | "spacingAndGlyphs";
}

export function FitTextSVG({
  children,
  className = "",
  style,
  containerClassName = "",
  axis = "x",
  adjust = "spacingAndGlyphs",
}: FitTextSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [scaleY, setScaleY] = useState(1);

  // Track the container's actual size.
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

  // Vertical fit, only when requested — textLength already guarantees the
  // X axis is exact, so bbox height here reflects natural (unstretched-Y)
  // size at the current font-size.
  useEffect(() => {
    if (axis !== "xy") {
      setScaleY(1);
      return;
    }
    const textEl = textRef.current;
    if (!textEl || box.height === 0) return;

    const bbox = textEl.getBBox();
    if (bbox.height === 0) return;

    setScaleY(box.height*1.0 / bbox.height);
  }, [box, axis, children]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: "100%", height: "100%" }}
    >
      {box.width > 0 && box.height > 0 && (
        <svg width={box.width} height={box.height} viewBox={`0 0 ${box.width} ${box.height}`}>
          <text
            ref={textRef}
            x={0}
            y={box.height / 2}
            dominantBaseline="middle"
            textLength={box.width}
            lengthAdjust={adjust}
            className={className}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: `scaleY(${scaleY*1.2})`, // arbitrary increase to look better
              whiteSpace: "pre",
              ...style,
            }}
          >
            {children}
          </text>
        </svg>
      )}
    </div>
  );
}
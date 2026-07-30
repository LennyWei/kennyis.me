"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/**
 * FitText - only for one line text
 * -------
 * Scales its text content so it exactly fills the width (and optionally
 * height) of its parent container — like a magazine masthead that's been
 * stretched to hit both margins exactly.
 *
 * This is NOT the same as responsive font-sizing (clamp(), vw units, etc).
 * Those change font-size, which scales width and height together and stops
 * once the text "looks about right." FitText instead measures the text's
 * natural, unscaled size and applies a CSS transform: scaleX/scaleY to snap
 * it to an exact pixel target — including non-uniform stretching if you want
 * the glyphs themselves squished or stretched, not just resized.
 *
 * USAGE — drop straight into a GridBlock, sized to 100% of it:
 *
 * <GridBlock rowStart={1} rowSpan={1} colStart={3} colSpan={2}>
 *   <FitText className="font-semibold text-[#f5eedc]">Your Name</FitText>
 * </GridBlock>
 *
 * By default only the X axis is scaled (axis="x") — this preserves the
 * font's natural height/proportions and just widens or narrows letterforms,
 * which usually looks more intentional than stretching both axes. Pass
 * axis="xy" if you specifically want the box's aspect ratio to dictate the
 * text's aspect ratio too (more distortion, use sparingly).
 *
 * Notes / limitations:
 * - Works best on a single line of text. Multi-line text will measure as
 *   a block and scale as a block, which usually isn't what you want.
 * - The starting font-size (via className/style) still matters a little —
 *   pick something in the right ballpark so the browser doesn't have to
 *   stretch by an extreme factor before layout/kerning look off.
 * - Re-measures on container resize and once webfonts finish loading.
 */

interface FitTextProps {
  children: ReactNode;
  /** Classes applied to the text itself (font, weight, color, etc.) */
  className?: string;
  /** Inline styles applied to the text itself */
  style?: CSSProperties;
  /** Classes applied to the outer wrapper (rarely needed) */
  containerClassName?: string;
  /** "x" (default) stretches width only, preserving natural height. "xy" stretches both. */
  axis?: "x" | "xy";
}

export function FitText({
  children,
  className = "",
  style,
  containerClassName = "",
  axis = "x",
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const measure = () => {
      // Reset to natural size before measuring, or we'd measure our own scaled output.
      text.style.transform = "none";

      const containerRect = container.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();
      if (textRect.width === 0 || textRect.height === 0) return;

      const scaleX = containerRect.width / textRect.width;
      const scaleY = axis === "xy" ? containerRect.height / textRect.height : scaleX;

      setScale({ x: scaleX, y: scaleY });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);

    // Web fonts often swap in after initial layout, which changes natural
    // text size — re-measure once they're actually ready.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }

    return () => ro.disconnect();
  }, [children, axis]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <span
        ref={textRef}
        className={className}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transformOrigin: "top left",
          transform: `scaleX(${scale.x}) scaleY(${scale.y})`,
          ...style,
        }}
      >
        {children}
      </span>
    </div>
  );
}
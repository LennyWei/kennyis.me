"use client";

import { CSSProperties, JSX, useEffect, useRef, useState } from "react";

/**
 * FitParagraphSVG
 * -----------------
 * Multi-line sibling to FitTextSVG. Wraps plain text into lines that fit the
 * container's width (measured with canvas `measureText`, driven off the real
 * computed font from `className`/`style`), then justifies each line — except
 * the last line of each paragraph, which stays ragged, same as Google Docs —
 * to the container width.
 *
 * Two ways to control size:
 *  - `fontSize` — set an exact px size yourself (as before).
 *  - `targetLines` — instead, tell it how many lines you want the text to
 *    occupy, and it binary-searches for the largest font size (within
 *    `minFontSize`/`maxFontSize`) that wraps into that many lines or fewer.
 *    Give one or the other, not both.
 *
 * Line spacing is controlled explicitly via `lineHeight` either way.
 *
 * USAGE — exact size:
 *
 * <FitParagraphSVG fontSize={18} lineHeight={1.5} className="fill-[#f5eedc]">
 *   {`A paragraph that wraps at whatever size you specify...`}
 * </FitParagraphSVG>
 *
 * USAGE — fill a fixed number of lines:
 *
 * <FitParagraphSVG targetLines={4} lineHeight={1.4} className="fill-[#f5eedc]">
 *   {`Body copy that grows/shrinks to fill exactly 4 lines of its box...`}
 * </FitParagraphSVG>
 *
 * CAVEATS on targetLines — it can only pick a font size, not rewrite your
 * text, so:
 *  - If the copy is too short to ever reach N lines even at `maxFontSize`,
 *    you'll get maxFontSize with fewer than N lines (nothing to stretch it
 *    with — this is a hard limit of font-size-only fitting).
 *  - If the copy is too long to fit in N lines even at `minFontSize`,
 *    you'll get minFontSize with more than N lines rather than an
 *    unreadably tiny font. Better than infinite shrinking, but worth
 *    knowing this is a soft target, not a guarantee, at the extremes.
 *
 * Other notes:
 * - Use "\n\n" (a blank line) between paragraphs. Single "\n" is treated as
 *   a soft break (folded into a space) — the wrapper decides where lines break.
 * - `adjust="words"` (default) grows only the gaps BETWEEN words, leaving each
 *   word's own letter-spacing untouched — real justified body text.
 * - `adjust="spacing"` grows every character gap uniformly, via SVG textLength.
 * - `adjust="spacingAndGlyphs"` also stretches the letterforms themselves —
 *   only reads as intentional at large headline sizes.
 * - The component sizes its own SVG height to fit all wrapped lines, so put
 *   it in a GridBlock/container sized by width — height will follow content
 *   (with `fontSize`) or land near your target (with `targetLines`).
 */

interface FitParagraphSVGProps {
  /**
   * Plain text, OR an array of paragraph strings.
   * - As a string: use a literal blank line ("\n\n") between paragraphs.
   *   A single "\n" is just a soft break, folded into a space — easy to
   *   get wrong by accident in a template literal.
   * - As a string[]: each element is one paragraph, no whitespace parsing
   *   involved — the safer option if paragraphSpacing/multiple paragraphs
   *   matter to you.
   */
  children: string | string[];
  /** Exact font size in px. Omit if using `targetLines` instead. */
  fontSize?: number;
  /** Auto-fit the font size so the text wraps into this many lines or fewer. Omit if using `fontSize`. */
  targetLines?: number;
  /** Lower bound for the targetLines search. Default 8. */
  minFontSize?: number;
  /** Upper bound for the targetLines search. Default 200. */
  maxFontSize?: number;
  /** Multiplier of fontSize. Default 1.3. */
  lineHeight?: number;
  /** Extra px between paragraphs, on top of lineHeight. Default = lineHeight px * 0.5 */
  paragraphSpacing?: number;
  /** Classes for each line — font-family/weight, fill (color), etc. */
  className?: string;
  /** Inline styles for each line. */
  style?: CSSProperties;
  /** Classes for the outer wrapping div. */
  containerClassName?: string;
  /** Force-justify the last line of each paragraph too (off by default, like Google Docs). */
  justifyLastLine?: boolean;
  /** Alignment for the ragged last line, when justifyLastLine is false. */
  lastLineAlign?: "left" | "right" | "center";
  /**
   * "words" (default) stretches only the gaps between words — real justify.
   * "spacing" stretches every character gap uniformly, via SVG textLength.
   * "spacingAndGlyphs" also stretches the letterforms themselves.
   */
  adjust?: "words" | "spacing" | "spacingAndGlyphs";
}

interface LineData {
  words: string[];
  wordWidths: number[];
  spaceWidth: number;
  naturalWidth: number;
}

let sharedCanvas: HTMLCanvasElement | null = null;
function getMeasureCtx() {
  if (!sharedCanvas) sharedCanvas = document.createElement("canvas");
  return sharedCanvas.getContext("2d")!;
}

/** Pure greedy word-wrap, given a ctx already set to the font/size to test. */
function wrapParagraphs(
  ctx: CanvasRenderingContext2D,
  rawParagraphs: string[],
  width: number,
): LineData[][] {
  const spaceWidth = ctx.measureText(" ").width;

  return rawParagraphs.map((para) => {
    const words = para.replace(/\n/g, " ").trim().split(/\s+/).filter(Boolean);
    const lines: LineData[] = [];
    let currentWords: string[] = [];
    let currentWidth = 0;

    const pushLine = () => {
      if (!currentWords.length) return;
      const wordWidths = currentWords.map((w) => ctx.measureText(w).width);
      const naturalWidth =
        wordWidths.reduce((a, b) => a + b, 0) + spaceWidth * (currentWords.length - 1);
      lines.push({ words: currentWords, wordWidths, spaceWidth, naturalWidth });
    };

    for (const word of words) {
      const wWidth = ctx.measureText(word).width;
      const candidateWidth = currentWidth + (currentWords.length ? spaceWidth : 0) + wWidth;

      if (!currentWords.length || candidateWidth <= width) {
        currentWords.push(word);
        currentWidth = candidateWidth;
      } else {
        pushLine();
        currentWords = [word];
        currentWidth = wWidth;
      }
    }
    pushLine();
    return lines;
  });
}

export function FitParagraphSVG({
  children,
  fontSize,
  targetLines,
  minFontSize = 8,
  maxFontSize = 200,
  lineHeight = 1.3,
  paragraphSpacing,
  className = "",
  style,
  containerClassName = "",
  justifyLastLine = false,
  lastLineAlign = "left",
  adjust = "words",
}: FitParagraphSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  const [paragraphs, setParagraphs] = useState<LineData[][]>([]);
  const [resolvedFontSize, setResolvedFontSize] = useState(fontSize ?? 16);

  // Track the container's actual width — that's the only dimension we need
  // up front, since height is derived from however many lines we wrap into.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Word-wrap using canvas measureText, driven off the *real* computed font
  // that className/style resolve to (read via a hidden probe span). If
  // targetLines is set, binary-search font size first; otherwise use the
  // literal fontSize prop.
  useEffect(() => {
    if (!width || !probeRef.current) return;

    const computed = getComputedStyle(probeRef.current);
    const buildFont = (fs: number) =>
      `${computed.fontStyle} ${computed.fontWeight} ${fs}px ${computed.fontFamily}`;
    const ctx = getMeasureCtx();
    const rawParagraphs = Array.isArray(children)
      ? children
      : children.split(/\n\s*\n/);

    let finalSize = fontSize ?? 16;

    if (targetLines) {
      let lo = minFontSize;
      let hi = maxFontSize;

      // 24 iterations narrows an 8–200px range to well under 0.01px —
      // way more precision than needed, cheap since measureText is fast.
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        ctx.font = buildFont(mid);
        const trialLines = wrapParagraphs(ctx, rawParagraphs, width);
        const count = trialLines.reduce((n, p) => n + p.length, 0);

        if (count <= targetLines) {
          lo = mid; // fits within target — try growing further
        } else {
          hi = mid; // overflowed — back off
        }
      }
      finalSize = lo;
    }

    ctx.font = buildFont(finalSize);
    setParagraphs(wrapParagraphs(ctx, rawParagraphs, width));
    setResolvedFontSize(finalSize);
  }, [children, width, fontSize, targetLines, minFontSize, maxFontSize]);

  const lineHeightPx = resolvedFontSize * lineHeight;
  const paraGapPx = paragraphSpacing ?? lineHeightPx * 0.5;
  const totalLines = paragraphs.reduce((n, p) => n + p.length, 0);
  const totalHeight =
    totalLines * lineHeightPx + Math.max(0, paragraphs.length - 1) * paraGapPx;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: "100%", height: "auto" }}
    >
      {/* Invisible probe so we can read the real computed font that
          className/style resolve to — canvas measureText needs a font string. */}
      <span
        ref={probeRef}
        className={className}
        style={{ ...style, position: "absolute", visibility: "hidden" }}
      >
        .
      </span>

      {width > 0 && paragraphs.length > 0 && (
        <svg width={width} height={totalHeight} viewBox={`0 0 ${width} ${totalHeight}`}>
          {(() => {
            let y = resolvedFontSize * 0.85; // baseline offset for the first line
            const rendered: JSX.Element[] = [];

            paragraphs.forEach((lines, pi) => {
              lines.forEach((line, li) => {
                const isLastLineOfParagraph = li === lines.length - 1;
                const shouldJustify = !isLastLineOfParagraph || justifyLastLine;
                const lineText = line.words.join(" ");
                const key = `${pi}-${li}`;

                // Word-gap justify: only possible with 2+ words, since a
                // single word has no inter-word gap to stretch. Falls back
                // to the character-stretch method below in that edge case.
                if (adjust === "words" && shouldJustify && line.words.length > 1) {
                  const extra = width - line.naturalWidth;
                  const gap = line.spaceWidth + extra / (line.words.length - 1);

                  let x = 0;
                  const tspans = line.words.map((word, wi) => {
                    const el = (
                      <tspan key={wi} x={x}>
                        {word}
                      </tspan>
                    );
                    x += line.wordWidths[wi] + gap;
                    return el;
                  });

                  rendered.push(
                    <text
                      key={key}
                      y={y}
                      className={className}
                      style={{ whiteSpace: "pre", ...style, fontSize: resolvedFontSize }}
                    >
                      {tspans}
                    </text>,
                  );
                } else {
                  // Ragged line (no justify) -> don't stretch. Any line that
                  // SHOULD justify but landed here — whether because adjust
                  // is "spacing"/"spacingAndGlyphs", or because it's a lone
                  // word that word-gap justify can't handle — still needs
                  // to stretch via textLength, or it silently stays ragged.
                  const doStretch = shouldJustify;

                  let xPos = 0;
                  let anchor: "start" | "middle" | "end" = "start";
                  if (!shouldJustify) {
                    if (lastLineAlign === "right") {
                      xPos = width;
                      anchor = "end";
                    } else if (lastLineAlign === "center") {
                      xPos = width / 2;
                      anchor = "middle";
                    }
                  }

                  rendered.push(
                    <text
                      key={key}
                      x={xPos}
                      y={y}
                      textAnchor={anchor}
                      textLength={doStretch ? width : undefined}
                      lengthAdjust={
                        doStretch
                          ? adjust === "spacingAndGlyphs"
                            ? "spacingAndGlyphs"
                            : "spacing"
                          : undefined
                      }
                      className={className}
                      style={{ whiteSpace: "pre", ...style, fontSize: resolvedFontSize }}
                    >
                      {lineText}
                    </text>,
                  );
                }

                y += lineHeightPx;
              });
              y += paraGapPx;
            });

            return rendered;
          })()}
        </svg>
      )}
    </div>
  );
}
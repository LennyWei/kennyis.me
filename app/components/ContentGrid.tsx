"use client";

import { CSSProperties, ReactNode } from "react";

/**
 * ContentGrid / GridBlock
 * ------------------------
 * A pure layout primitive. It knows nothing about images, text, or icons —
 * it just carves up a box into a `rows` x `cols` grid and lets you place
 * children into arbitrary rectangular regions of it via <GridBlock>.
 *
 * NOTE: Grid lines are 1-indexed, same as native CSS grid. In a 6-row grid,
 * the top row starts at rowStart={1}, not 0.
 *
 * ---------------------------------------------------------------
 * EXAMPLE — the workflow you described:
 * A 4-col x 6-row grid. Image in a 2x5 block top-left, title in a 1x2
 * block top-right, links in a 1x4 block along the bottom, body filling
 * whatever's left.
 *
 * <ContentGrid rows={6} cols={4} height="600px" width="100%" gap="1rem">
 *   <GridBlock rowStart={1} rowSpan={5} colStart={1} colSpan={2}>
 *     <img src="/me.jpg" className="h-full w-full object-cover" />
 *   </GridBlock>
 *
 *   <GridBlock rowStart={1} rowSpan={1} colStart={3} colSpan={2}>
 *     <h2 className="text-2xl font-semibold">Project Title</h2>
 *   </GridBlock>
 *
 *   <GridBlock rowStart={2} rowSpan={4} colStart={3} colSpan={2}>
 *     <p className="text-sm text-[#f5eedc]/80">Body copy goes here...</p>
 *   </GridBlock>
 *
 *   <GridBlock rowStart={6} rowSpan={1} colStart={1} colSpan={4}>
 *     <div className="flex gap-4">{/* link icons *\/}</div>
 *   </GridBlock>
 * </ContentGrid>
 * ---------------------------------------------------------------
 */

interface ContentGridProps {
  /** Number of rows to divide the grid into */
  rows: number;
  /** Number of columns to divide the grid into */
  cols: number;
  /**
   * Optional per-row track sizes, e.g. ["2fr", "1fr", "1fr", "1fr", "1fr", "1fr"]
   * to make row 1 twice as tall as the rest. Must have `rows` entries if provided.
   * Accepts any valid CSS track size: "1fr", "120px", "20%", "min-content", etc.
   * Omit to make all rows equal (1fr each).
   */
  rowSizes?: string[];
  /** Optional per-column track sizes — same rules as rowSizes, but for cols. */
  colSizes?: string[];
  /** CSS height, e.g. "600px", "80vh", "100%". Defaults to "auto". */
  height?: string;
  /** CSS width, e.g. "70vw", "100%". Defaults to "100%". */
  width?: string;
  /** Gap between cells, e.g. "1rem", "12px". Defaults to "0px". */
  gap?: string;
  /** Tailwind/utility classes for the outer grid container */
  className?: string;
  /** If true, draws faint grid lines so you can eyeball placement while building */
  showGuides?: boolean;
  children: ReactNode;
}

export function ContentGrid({
  rows,
  cols,
  rowSizes,
  colSizes,
  height = "auto",
  width = "100%",
  gap = "0px",
  className = "",
  showGuides = false,
  children,
}: ContentGridProps) {
  const style: CSSProperties = {
    display: "grid",
    gridTemplateRows: rowSizes ? rowSizes.join(" ") : `repeat(${rows}, 1fr)`,
    gridTemplateColumns: colSizes ? colSizes.join(" ") : `repeat(${cols}, 1fr)`,
    height,
    width,
    gap,
    ...(showGuides
      ? {
          backgroundImage:
            `repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 1px, transparent 1px, transparent calc(100% / ${cols})),` +
            `repeating-linear-gradient(to bottom, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 1px, transparent 1px, transparent calc(100% / ${rows}))`,
        }
      : {}),
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

interface GridBlockProps {
  /** Which column line to start at (1-indexed) */
  colStart: number;
  /** How many columns to span */
  colSpan: number;
  /** Which row line to start at (1-indexed) */
  rowStart: number;
  /** How many rows to span */
  rowSpan: number;
  /** Tailwind/utility classes for this block (sizing content, alignment, overflow, etc.) */
  className?: string;
  children?: ReactNode;
}

export function GridBlock({
  colStart,
  colSpan,
  rowStart,
  rowSpan,
  className = "",
  children,
}: GridBlockProps) {
  const style: CSSProperties = {
    gridColumn: `${colStart} / span ${colSpan}`,
    gridRow: `${rowStart} / span ${rowSpan}`,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

type SnapCtx = {
  activeIndex: number;
  activeId: string | null;
  register: (el: HTMLElement | null, i: number, id?: string) => void;
  scrollTo: (idOrIndex: string | number) => void;
};
const Ctx = createContext<SnapCtx | null>(null);

export function useSnapScroll() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSnapScroll must be used inside <SnapScroll>");
  return ctx;
}
/** Same as useSnapScroll, but returns null instead of throwing when used outside a <SnapScroll> — for components that want to degrade gracefully rather than require the context. */
export function useSnapScrollOptional() {
  return useContext(Ctx);
}

export function SnapScroll({
  children,
  className = "",
  axis = "y",
  strength = "proximity",
  /**
   * CSS selector for the fixed/sticky header that overlaps the top of this
   * scroll container. Its live height is measured and exposed as the
   * `--snap-header-h` custom property, which both this container's
   * scroll-padding-top and each <SnapSection>'s content sizing read from —
   * so sections snap to *below* the header instead of having their top
   * edge (and therefore their vertically-centered content) hidden behind
   * it. Pass null if there's no overlapping header.
   */
  headerSelector = "header",
}: {
  children: React.ReactNode;
  className?: string;
  axis?: "y" | "x";
  strength?: "mandatory" | "proximity";
  headerSelector?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sections = useRef<Map<number, { el: HTMLElement; id?: string }>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sectionCount, setSectionCount] = useState(0);

  const register = useCallback((el: HTMLElement | null, i: number, id?: string) => {
    if (el) sections.current.set(i, { el, id });
    else sections.current.delete(i);
    setSectionCount(sections.current.size);
  }, []);

  const scrollTo = useCallback((idOrIndex: string | number) => {
    const entry = [...sections.current.entries()].find(([i, s]) =>
      typeof idOrIndex === "number" ? i === idOrIndex : s.id === idOrIndex
    );
    entry?.[1].el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Keep --snap-header-h in sync with the header's real rendered height,
  // live across resizes (font loading, responsive breakpoints, etc.)
  // instead of a guessed constant that silently drifts.
  useEffect(() => {
    if (!headerSelector) {
      document.documentElement.style.setProperty("--snap-header-h", "0px");
      return;
    }
    const headerEl = document.querySelector<HTMLElement>(headerSelector);
    if (!headerEl) {
      document.documentElement.style.setProperty("--snap-header-h", "0px");
      return;
    }
    const update = () => {
      document.documentElement.style.setProperty("--snap-header-h", `${headerEl.getBoundingClientRect().height}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(headerEl);
    return () => ro.disconnect();
  }, [headerSelector]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || sectionCount === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { i: number; id?: string; dist: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const found = [...sections.current.entries()].find(([, s]) => s.el === entry.target);
          if (!found) continue;
          const rootRect = entry.rootBounds;
          const center = rootRect ? rootRect.top + rootRect.height / 2 : 0;
          const dist = Math.abs(entry.boundingClientRect.top + entry.boundingClientRect.height / 2 - center);
          if (!best || dist < best.dist) best = { i: found[0], id: found[1].id, dist };
        }
        if (best) {
          setActiveIndex(best.i);
          setActiveId(best.id ?? null);
        }
      },
      { root, threshold: 0, rootMargin: "-45% 0px -45% 0px" }
    );
    sections.current.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionCount]);

  return (
    <Ctx.Provider value={{ activeIndex, activeId, register, scrollTo }}>
      <div
        ref={containerRef}
        className={`[&::-webkit-scrollbar]:hidden ${className}`}
        style={{
          overflowY: axis === "y" ? "scroll" : undefined,
          overflowX: axis === "x" ? "scroll" : undefined,
          scrollSnapType: `${axis} ${strength}`,
          // Pushes the snap stop down past the header instead of letting
          // the section's top edge (and thus its centered content) land
          // underneath it.
          scrollPaddingTop: axis === "y" ? "var(--snap-header-h, 0px)" : undefined,
          scrollPaddingLeft: axis === "x" ? "var(--snap-header-h, 0px)" : undefined,
          height: axis === "y" ? "100vh" : undefined,
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function SnapSection({
  index,
  id,
  children,
  className = "",
  align = "start",
  /**
   * If true (default), content is vertically centered within the visible
   * area below the header — i.e. `100vh - var(--snap-header-h)` — rather
   * than centered within the full 100vh box, part of which is hidden
   * behind the header. Set false for sections that manage their own
   * height (e.g. a short "Projects" divider using minHeight="40vh").
   */
  fillViewport = true,
  minHeight,
}: {
  index: number;
  id?: string;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  fillViewport?: boolean;
  /** Overrides the computed height entirely — use for short, non-full-height sections like a divider heading. */
  minHeight?: string;
}) {
  const { register, activeIndex } = useSnapScroll();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    register(ref.current, index, id);
    return () => register(null, index);
  }, [index, id, register]);

  const resolvedMinHeight = minHeight ?? (fillViewport ? "calc(90vh - var(--snap-header-h, 0px))" : "auto");

  return (
    <section
      ref={ref}
      id={id}
      className={`flex flex-col items-center justify-center ${className}`.trim()}
      style={{
        scrollSnapAlign: align,
        scrollSnapStop: "always",
        minHeight: resolvedMinHeight,
        // Belt-and-suspenders: also keeps anchor-link / keyboard-focus
        // jumps (not just wheel-scroll snapping) landing below the header.
        scrollMarginTop: "var(--snap-header-h, 0px)",
      }}
      data-active={activeIndex === index}
    >
      {children}
    </section>
  );
}
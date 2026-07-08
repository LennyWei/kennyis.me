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

export function SnapScroll({
  children,
  className = "",
  axis = "y",
  strength = "proximity",
}: {
  children: React.ReactNode;
  className?: string;
  axis?: "y" | "x";
  strength?: "mandatory" | "proximity";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sections = useRef<Map<number, { el: HTMLElement; id?: string }>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const register = (el: HTMLElement | null, i: number, id?: string) => {
    if (el) sections.current.set(i, { el, id });
    else sections.current.delete(i);
  };

  const scrollTo = useCallback((idOrIndex: string | number) => {
    const entry = [...sections.current.entries()].find(([i, s]) =>
      typeof idOrIndex === "number" ? i === idOrIndex : s.id === idOrIndex
    );
    entry?.[1].el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const found = [...sections.current.entries()].find(([, s]) => s.el === entry.target);
            if (found) {
              setActiveIndex(found[0]);
              setActiveId(found[1].id ?? null);
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );
    sections.current.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [children]);

  return (
    <Ctx.Provider value={{ activeIndex, activeId, register, scrollTo }}>
      <div
        ref={containerRef}
        className={className}
        style={{
          overflowY: axis === "y" ? "scroll" : undefined,
          overflowX: axis === "x" ? "scroll" : undefined,
          scrollSnapType: `${axis} ${strength}`,
          height: axis === "y" ? "100vh" : undefined,
          scrollBehavior: "smooth",
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
}: {
  index: number;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { register, activeIndex } = useSnapScroll();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    register(ref.current, index, id);
    return () => register(null, index);
  }, [index, id]);

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{ scrollSnapAlign: "start", scrollSnapStop: "always", minHeight: "100vh" }}
      data-active={activeIndex === index}
    >
      {children}
    </section>
  );
}
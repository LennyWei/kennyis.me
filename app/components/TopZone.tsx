import type { CSSProperties } from "react";

export interface TopZoneProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
  [key: string]: unknown;
}

export default function TopZone({
  className = "",
  style,
  title = "... Kenny Liang ...",
}: TopZoneProps) {
  return (
    <section
      className={`w-full  py-0 
        text-center ${className}`.trim()}
      style={style}
    >
      <h1
        className="select-none text-balance text-[clamp(5rem,12vw,10rem)] leading-[0.9] tracking-[0.005em] text-[#f32333] drop-shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        style={{ fontFamily: '"UnifrakturMaguntia", serif' }}
      >
        {title}
      </h1>
    </section>
  );
}
import type { CSSProperties } from "react";

export interface ThinHeaderProps {
  className?: string;
  style?: CSSProperties;
  links?: Array<{ label: string; href: string }>;
  mark?: string;
  status?: string;
  [key: string]: unknown;
}

const DEFAULT_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "mailto:hello@kennyliang.com" },
];

export default function ThinHeader({
  className = "",
  style,
  links = DEFAULT_LINKS,
  mark = "KL",
  status = "first pass / 2026",
}: ThinHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b
         border-[#f5eedc]/10 bg-[rgba(9,9,9,0.92)] 
         px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] 
         backdrop-blur-xl sm:px-6 lg:px-8 ${className}`.trim()}
      style={style} 
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-black uppercase tracking-[0.14em] text-[#f5eedc]"
            style={{ fontFamily: '"Lato", sans-serif' }}
          >
            {mark}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5eedc]" />
          <span
            className="text-[11px] font-normal uppercase tracking-[0.12em] text-[#f5eedc]/60"
            style={{ fontFamily: '"Lato", sans-serif' }}
          >
            {status}
          </span>
        </div>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 sm:gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5eedc] transition-opacity hover:opacity-70"
              style={{ fontFamily: '"Lato", sans-serif' }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
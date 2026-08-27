import type { CSSProperties } from "react";

export interface ThinHeaderProps {
  className?: string;
  style?: CSSProperties;
  links?: Array<{ label: string; href: string }>;
  mark?: string;
  status?: string;
  githubHref?: string;
  linkedinHref?: string;
  [key: string]: unknown;
}

const DEFAULT_LINKS = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "mailto:kenny712126@gmail.com" },
];

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export default function ThinHeader({
  className = "",
  style,
  links = DEFAULT_LINKS,
  mark = "KL",
  status = "2026",
  githubHref = "https://github.com/LennyWei",
  linkedinHref = "https://www.linkedin.com/in/kenny-liang-570aab296/",
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

          <span className="h-3 w-px bg-[#f5eedc]/20" aria-hidden="true" />

          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-[#f5eedc] transition-opacity hover:opacity-70"
          >
            <GithubIcon />
          </a>
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-[#f5eedc] transition-opacity hover:opacity-70"
          >
            <LinkedinIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
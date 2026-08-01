"use client";

import {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface FitTextProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  minFontSize?: number;
  maxFontSize?: number;
}

export default function FitText({
  children,
  className = "",
  style,
  minFontSize = 8,
  maxFontSize = 512,
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        text.style.fontSize = `${mid}px`;

        const fits =
          text.scrollWidth <= maxWidth &&
          text.scrollHeight <= maxHeight;

        if (fits) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFontSize(best);
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    document.fonts?.ready.then(fit);

    return () => observer.disconnect();
  }, [children, minFontSize, maxFontSize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center"
    >
      <div
        ref={textRef}
        className={className}
        style={{
          ...style,
          fontSize,
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
"use client";
 
import { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import type { CarouselRenderMeta } from "./CarouselManager";
import { createFrameLimiter } from "./CarouselFrameLimiter";
 
/**
 * The sun ray shape, traced from sun1.svg. Original file was a 1078x1078
 * square with two layers: an opaque background rect, and this ray path,
 * which itself contains a second circular sub-path (center 539,539,
 * radius 295.83) forming the hole. We drop the background rect (we want
 * transparency outside the rays) and force fill-rule="evenodd" so the
 * inner circle always renders as a true hole regardless of winding order.
 */
const SUN_VIEWBOX_SIZE = 1078;
const SUN_HOLE_CENTER = 539;
const SUN_HOLE_RADIUS = 295.83;
const SUN_RAY_PATH_D =
  "M692.94,847.99c-16.6,37.68,11.38,83.78,179.97,118.95-101.72-2.94-217.34-43.05-309.76-83.78-29.53,28.53-21.08,81.77,121.02,178.5-92.99-41.62-184.61-123-254.49-196-38.39,14.91-51.22,67.25,43.13,211.34-69.85-74.01-123.24-184.13-159.79-278.27-41.05-.71-72.73,42.92-40.65,211.79-36.32-95.19-43.57-217.54-41.36-318.58-37.68-16.6-83.78,11.38-118.95,179.97,2.94-101.72,43.05-217.34,83.78-309.76-28.53-29.53-81.77-21.08-178.5,121.02,41.62-92.98,123-184.61,196-254.49-14.91-38.39-67.25-51.22-211.34,43.13,74.01-69.85,184.13-123.24,278.27-159.79.71-41.05-42.92-72.73-211.79-40.65,95.19-36.32,217.54-43.57,318.58-41.36,16.6-37.68-11.38-83.78-179.97-118.95,101.72,2.94,217.34,43.05,309.76,83.78,29.53-28.53,21.08-81.77-121.02-178.5,92.99,41.62,184.61,123,254.49,196,38.39-14.91,51.22-67.25-43.13-211.34,69.85,74.01,123.24,184.13,159.79,278.27,41.05.71,72.73-42.92,40.65-211.79,36.32,95.19,43.57,217.54,41.36,318.58,37.68,16.6,83.78-11.38,118.95-179.97-2.94,101.72-43.05,217.34-83.78,309.76,28.53,29.53,81.77,21.08,178.5-121.02-41.62,92.99-123,184.61-196,254.49,14.91,38.39,67.25,51.22,211.34-43.13-74.01,69.85-184.13,123.24-278.27,159.79-.71,41.05,42.92,72.73,211.79,40.65-95.19,36.32-217.54,43.57-318.58,41.36ZM835.83,539c0-163.38-132.45-295.83-295.83-295.83s-295.83,132.45-295.83,295.83,132.45,295.83,295.83,295.83,295.83-132.45,295.83-295.83Z";
 
const HOLE_DIAMETER_RATIO = (SUN_HOLE_RADIUS * 2) / SUN_VIEWBOX_SIZE; // ~0.549 of the icon's size
const HOLE_CENTER_RATIO = SUN_HOLE_CENTER / SUN_VIEWBOX_SIZE; // 0.5, kept explicit in case the source art changes
 
export interface SunHeroItem {
  id: string;
  color: string;
  imageSrc: string;
  /** Fills any transparent parts of imageSrc. Defaults to a dark neutral. */
  holeBackgroundColor?: string;
  targetSectionId?: string;
}
 
export interface SunHeroIconProps {
  item: SunHeroItem;
  meta: CarouselRenderMeta;
  /** Rendered size (px) of the whole sun icon, square. */
  size?: number;
  /** Rotation speed (deg/sec) while the carousel item is accelerating/decelerating (enter or exit phase). */
  fastSpinDegPerSec?: number;
  /** Rotation speed (deg/sec) while the carousel item is in its slow middle pass. */
  slowSpinDegPerSec?: number;
}
 
export function SunHeroIcon({
  item,
  meta,
  size = 200,
  fastSpinDegPerSec = 160,
  slowSpinDegPerSec = 35,
}: SunHeroIconProps) {
  const rotate = useMotionValue(0);
  const angleRef = useRef(0);
  const limiterRef = useRef(createFrameLimiter(meta.fps));
 
  useEffect(() => {
    limiterRef.current = createFrameLimiter(meta.fps);
  }, [meta.fps]);
 
  useAnimationFrame((_, deltaMs) => {
    // Note: no isPaused check here on purpose — the carousel freezes its
    // own translation on pause, but the sun keeps spinning at whatever
    // speed it had at the moment of pause (meta.speedFactor is frozen too,
    // so this reads as "still spinning, just not gaining/losing speed").
    const rawFactor = meta.speedFactor.get();
    const span = 1 - meta.minSpeedFactor;
    const normalizedFactor = span > 0 ? (rawFactor - meta.minSpeedFactor) / span : 1;
 
    const spinSpeed = slowSpinDegPerSec + (fastSpinDegPerSec - slowSpinDegPerSec) * normalizedFactor;
    // Angle itself accumulates every real frame (correct average speed);
    // only how often it's PUSHED to the visual motion value is throttled,
    // via the same limiter shape the carousel uses for its own fps prop —
    // so the spin steps at exactly the same rate as the translation.
    angleRef.current += spinSpeed * (deltaMs / 1000);
    if (limiterRef.current.shouldStep(deltaMs)) {
      rotate.set(angleRef.current);
    }
  });
 
  const holeDiameter = size * HOLE_DIAMETER_RATIO;
  const holeOffset = size * HOLE_CENTER_RATIO - holeDiameter / 2;
 
  const handleClick = () => {
    if (!item.targetSectionId) return;
    document.getElementById(item.targetSectionId)?.scrollIntoView({ behavior: "smooth" });
  };
 
  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => meta.requestPause(true)}
      onMouseLeave={() => meta.requestPause(false)}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size, cursor: item.targetSectionId ? "pointer" : "default" }}
      aria-label={item.targetSectionId ? `Go to ${item.targetSectionId}` : undefined}
    >
      {/* Backing circle: sits behind the image, fills in any transparent PNG areas */}
      <div
        className="absolute rounded-full"
        style={{
          width: holeDiameter,
          height: holeDiameter,
          left: holeOffset,
          top: holeOffset,
          background: item.holeBackgroundColor ?? "#111",
        }}
      />
 
      {/* Image, clipped to the same circle as the hole so it never bleeds into the ray gaps */}
      <div
        className="absolute overflow-hidden rounded-full flex items-center justify-center"
        style={{ width: holeDiameter, height: holeDiameter, left: holeOffset, top: holeOffset }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageSrc} alt="" className="h-[0%] w-[0%] object-cover" draggable={false} />
      </div>
 

      {/* Rays: rotate around their own center; hole stays transparent, revealing the image below */}
      <motion.svg
        viewBox={`0 0 ${SUN_VIEWBOX_SIZE} ${SUN_VIEWBOX_SIZE}`}
        width={size}
        height={size}
        className="absolute left-0 top-0 z-20"
        style={{ rotate, overflow: "visible" }}
      >
        <defs>
          <filter id="sun-glow" x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.95 0 1 0 0 0.8 0 0 1 0 0.25 0 0 0 1 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={SUN_RAY_PATH_D} fill={item.color} fillRule="evenodd" filter="url(#sun-glow)" />
      </motion.svg>
    </button>
  );
}
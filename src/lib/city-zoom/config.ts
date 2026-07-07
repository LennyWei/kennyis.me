export interface CityZoomConfig {
  /** Base scroll speed of the streaks (roughly: screen-widths per second) */
  speed: number;
  /** Number of horizontal "lanes" streaks travel in */
  laneCount: number;
  /** How many streaks appear per lane per unit length (higher = busier) */
  streakDensity: number;
  /** Length of each streak's tail as a fraction of its lane's repeat period (0..1) */
  streakLength: number;
  /**
   * How strongly lanes near the top/bottom edges (= "close to camera") move
   * faster and render thicker than lanes near the horizon (screen center).
   * 1 = linear falloff, higher = more exaggerated depth compression.
   */
  perspective: number;
  /** Glow / brightness multiplier applied to the streak color */
  glow: number;
  /** Chromatic aberration strength — RGB fringing on streak edges from the "speed" */
  chromaticAberration: number;
  /** Primary streak color (hex) */
  colorA: string;
  /** Secondary streak color (hex) — each lane is randomly tinted between A and B */
  colorB: string;
  /** Background gradient color at top/bottom edges (closest to camera) */
  bgTop: string;
  /** Background gradient color at the horizon (screen center) */
  bgBottom: string;
}

export const defaultCityZoomConfig: CityZoomConfig = {
  "speed": 0.5999999999999999,
  "laneCount": 42,
  "streakDensity": 0.2,
  "streakLength": 0.95,
  "perspective": 6,
  "glow": 1.9000000000000001,
  "chromaticAberration": 1,
  "colorA": "#f4b360",
  "colorB": "#d6833c",
  "bgTop": "#1b100b",
  "bgBottom": "#0c0a09"
}

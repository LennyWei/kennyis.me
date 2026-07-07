"use client";

import { useControls, button } from "leva";
import { CityZoomConfig, defaultCityZoomConfig } from "@/src/lib/city-zoom/config";

/**
 * Dev-only tuning panel. Renders Leva's floating panel and returns a live
 * config object you can feed straight into <CityZoomBackdrop config={...} />.
 *
 * Usage:
 *   const config = useCityZoomControls();
 *   return <CityZoomBackdrop config={config} />;
 *
 * When it looks right, click "Log config to console", copy the JSON that's
 * printed, and paste it over defaultCityZoomConfig in src/lib/city-zoom/config.ts.
 * Then swap useCityZoomControls() back out for defaultCityZoomConfig and drop
 * <CityZoomControls /> usage from your production tree — Leva is a dev tool.
 */
export function useCityZoomControls(): CityZoomConfig {
  const motionValues = useControls("City Zoom / Motion", {
    speed: { value: defaultCityZoomConfig.speed, min: 0, max: 5, step: 0.05 },
    laneCount: { value: defaultCityZoomConfig.laneCount, min: 4, max: 80, step: 1 },
    streakDensity: {
      value: defaultCityZoomConfig.streakDensity,
      min: 0.2,
      max: 4,
      step: 0.05,
    },
    streakLength: {
      value: defaultCityZoomConfig.streakLength,
      min: 0.02,
      max: 0.95,
      step: 0.01,
    },
    perspective: {
      value: defaultCityZoomConfig.perspective,
      min: 0.2,
      max: 6,
      step: 0.1,
    },
  });

  const lookValues = useControls("City Zoom / Look", {
    glow: { value: defaultCityZoomConfig.glow, min: 0, max: 3, step: 0.05 },
    chromaticAberration: {
      value: defaultCityZoomConfig.chromaticAberration,
      min: 0,
      max: 3,
      step: 0.05,
    },
    colorA: defaultCityZoomConfig.colorA,
    colorB: defaultCityZoomConfig.colorB,
    bgTop: defaultCityZoomConfig.bgTop,
    bgBottom: defaultCityZoomConfig.bgBottom,
  });

  useControls(
    "City Zoom / Export",
    () => ({
      "Log config to console": button(() => {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ ...motionValues, ...lookValues }, null, 2));
      }),
    }),
    [motionValues, lookValues]
  );

  return { ...motionValues, ...lookValues } as CityZoomConfig;
}

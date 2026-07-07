"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { fragmentShader, vertexShader } from "@/src/lib/city-zoom/shader";
import { CityZoomConfig, defaultCityZoomConfig } from "@/src/lib/city-zoom/config";

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

function StreakPlane({ config }: { config: CityZoomConfig }) {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Uniforms are created once; values are pushed in every frame in useFrame
  // below so the Leva panel / prop changes stay live without remounting.
  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
      uSpeed: { value: config.speed },
      uLaneCount: { value: config.laneCount },
      uStreakDensity: { value: config.streakDensity },
      uStreakLength: { value: config.streakLength },
      uPerspective: { value: config.perspective },
      uGlow: { value: config.glow },
      uChromaticAberration: { value: config.chromaticAberration },
      uColorA: { value: hexToVec3(config.colorA) },
      uColorB: { value: hexToVec3(config.colorB) },
      uBgTop: { value: hexToVec3(config.bgTop) },
      uBgBottom: { value: hexToVec3(config.bgBottom) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uResolution.value.set(size.width, size.height);
    u.uSpeed.value = config.speed;
    u.uLaneCount.value = config.laneCount;
    u.uStreakDensity.value = config.streakDensity;
    u.uStreakLength.value = config.streakLength;
    u.uPerspective.value = config.perspective;
    u.uGlow.value = config.glow;
    u.uChromaticAberration.value = config.chromaticAberration;
    (u.uColorA.value as THREE.Vector3).copy(hexToVec3(config.colorA));
    (u.uColorB.value as THREE.Vector3).copy(hexToVec3(config.colorB));
    (u.uBgTop.value as THREE.Vector3).copy(hexToVec3(config.bgTop));
    (u.uBgBottom.value as THREE.Vector3).copy(hexToVec3(config.bgBottom));
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export interface CityZoomBackdropProps {
  /** Partial overrides merged on top of defaultCityZoomConfig */
  config?: Partial<CityZoomConfig>;
  className?: string;
}

export default function CityZoomBackdrop({ config, className }: CityZoomBackdropProps) {
  const merged: CityZoomConfig = { ...defaultCityZoomConfig, ...config };

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <Canvas
        orthographic
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <StreakPlane config={merged} />
      </Canvas>
    </motion.div>
  );
}

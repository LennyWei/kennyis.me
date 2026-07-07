"use client"; // Critical for Next.js to allow canvas rendering

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "@/src/lib/city-zoom/shader"; // Adjust path as needed

interface ShaderPlaneProps {
  imagePath: string;
  panSpeed: number;
  stretch: number;
  blurAmount: number;
  updateInterval: number;
}

const ShaderPlane = ({ imagePath, panSpeed, stretch, blurAmount, updateInterval }: ShaderPlaneProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const texture = useTexture(imagePath);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Important: Linear filtering helps smooth out the extreme stretch natively
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const uniforms = useMemo(
    () => ({
      u_backgroundTexture: { value: texture },
      u_time: { value: 0 },
      u_panSpeed: { value: panSpeed },
      u_stretch: { value: stretch },
      u_blurAmount: { value: blurAmount },
    }),
    [texture, panSpeed, stretch, blurAmount]
  );

  useFrame((state) => {
    if (materialRef.current) {
      // Quantizing the clock time (instead of using it raw) makes the pan
      // *update* in discrete steps while keeping the same overall speed —
      // it just holds each position for `updateInterval` seconds before
      // jumping to the next, rather than gliding continuously.
      const rawTime = state.clock.elapsedTime;
      const steppedTime =
        updateInterval > 0
          ? Math.floor(rawTime / updateInterval) * updateInterval
          : rawTime;

      materialRef.current.uniforms.u_time.value = steppedTime;
      materialRef.current.uniforms.u_panSpeed.value = panSpeed;
      materialRef.current.uniforms.u_stretch.value = stretch;
      materialRef.current.uniforms.u_blurAmount.value = blurAmount;
    }
  });
  const { viewport } = useThree();

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

interface BackgroundProps {
  imagePath: string;
  panSpeed?: number;
  stretch?: number;        // How much the image is stretched horizontally (1 = no stretch)
  blurAmount?: number;     // Gaussian tap spacing in texture UV units (small, e.g. 0.001–0.004)
  updateInterval?: number; // Seconds between visual updates (0 = smooth every frame; 0.5 = updates twice a second)
}

export default function DirectionalBlurBackground({
  imagePath,
  panSpeed = 0.5,
  stretch = 20.0,      // High value = strong horizontal stretch
  blurAmount = 0.0015, // Fixed in texture space — stays stable at any stretch value
  updateInterval = 0,  // 0 = smooth motion; try 0.1–0.5 for a choppy/low-fps look
}: BackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <Suspense fallback={null}>
          <ShaderPlane 
            imagePath={imagePath} 
            panSpeed={panSpeed} 
            stretch={stretch} 
            blurAmount={blurAmount}
            updateInterval={updateInterval}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
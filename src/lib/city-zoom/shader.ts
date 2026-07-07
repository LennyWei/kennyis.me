export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLaneCount;
  uniform float uStreakDensity;
  uniform float uStreakLength;
  uniform float uPerspective;
  uniform float uGlow;
  uniform float uChromaticAberration;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uBgTop;
  uniform vec3 uBgBottom;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Intensity of streaks for a single lane at a given x (x may be aberration-shifted).
  float streakLane(float x, float laneIndex, float depth, float time) {
    float laneSeed = hash11(laneIndex + 7.0);
    // depth 0 = horizon (far / slow), depth 1 = edge (near / fast)
    float speedMul = mix(0.15, 1.0, pow(depth, uPerspective));
    float laneSpeed = uSpeed * speedMul * mix(0.7, 1.3, laneSeed);

    float period = mix(0.18, 0.55, hash11(laneIndex + 41.0)) / max(uStreakDensity, 0.001);
    float xShifted = x + time * laneSpeed;
    float cell = floor(xShifted / period);
    float localX = fract(xShifted / period);

    float streakSeed = hash21(vec2(laneIndex, cell));
    float len = clamp(uStreakLength, 0.02, 0.98) * mix(0.4, 1.0, streakSeed);

    float intensity = 0.0;
    if (localX < len) {
      // head (t=0) is brightest, tail (t=1) decays — an analytic motion-blur streak
      float t = localX / len;
      intensity = exp(-t * 6.0);
    }

    float brightness = mix(0.25, 1.0, hash11(laneIndex + cell * 3.17));
    return intensity * brightness;
  }

  // Sums the 3 nearest lanes for a given x sample (called once per color channel).
  float sceneAt(vec2 uv, float x, float time, out float outLaneIndex) {
    float laneF = (uv.y * 0.5 + 0.5) * uLaneCount;
    float laneIndex = floor(laneF);
    float depth = clamp(abs(uv.y) * 2.0, 0.0, 1.0);

    float col = 0.0;
    float bestLane = laneIndex;
    float bestMask = 0.0;
    for (int i = -1; i <= 1; i++) {
      float li = laneIndex + float(i);
      float laneCenter = (li + 0.5) / uLaneCount * 2.0 - 1.0;
      float distToLane = abs(uv.y - laneCenter);
      float thickness = mix(0.006, 0.028, depth);
      float mask = smoothstep(thickness, 0.0, distToLane);
      float v = streakLane(x, li, depth, time) * mask;
      col += v;
      if (mask > bestMask) { bestMask = mask; bestLane = li; }
    }
    outLaneIndex = bestLane;
    return col;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / max(uResolution.y, 1.0);

    vec3 bg = mix(uBgBottom, uBgTop, smoothstep(-1.0, 1.0, abs(uv.y)));

    float ca = uChromaticAberration * 0.01;
    float laneIndexR, laneIndexG, laneIndexB;
    float r = sceneAt(uv, uv.x + ca, uTime, laneIndexR);
    float g = sceneAt(uv, uv.x, uTime, laneIndexG);
    float b = sceneAt(uv, uv.x - ca, uTime, laneIndexB);

    vec3 tintR = mix(uColorA, uColorB, hash11(laneIndexR));
    vec3 tintG = mix(uColorA, uColorB, hash11(laneIndexG));
    vec3 tintB = mix(uColorA, uColorB, hash11(laneIndexB));

    vec3 streaks = vec3(r * tintR.r, g * tintG.g, b * tintB.b) * uGlow;

    vec3 finalColor = bg + streaks;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

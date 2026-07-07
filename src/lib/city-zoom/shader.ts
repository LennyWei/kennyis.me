// shaders.ts

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D u_backgroundTexture;
  uniform float u_time;
  uniform float u_panSpeed;
  uniform float u_stretch;    // Horizontal stretch factor applied to the image
  uniform float u_blurAmount; // Gaussian blur tap spacing, in texture UV units

  varying vec2 vUv;

  float normpdf(float x, float sigma) {
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
  }

  const int mSize = 11;
  const int kSize = (mSize - 1) / 2;

  void main() {
    // 1. STRETCH: compress the U range so the texture is genuinely
    //    stretched horizontally across the plane, then scroll it.
    vec2 baseUv = vUv;
    baseUv.x = baseUv.x / u_stretch;
    baseUv.x += u_time * u_panSpeed;

    // 2. Build a normalized 1D gaussian kernel (same technique as the
    //    classic ShaderToy 11-tap blur).
    float kernel[mSize];
    float sigma = 7.0;
    for (int j = 0; j <= kSize; ++j) {
      kernel[kSize + j] = kernel[kSize - j] = normpdf(float(j), sigma);
    }

    float Z = 0.0;
    for (int j = 0; j < mSize; ++j) {
      Z += kernel[j];
    }

    // 3. BLUR: taps are spaced by u_blurAmount in fixed texture-space UV
    //    units — NOT divided by u_stretch. Because we sample through the
    //    already-compressed baseUv, this fixed-size kernel gets visually
    //    stretched right along with the image (exactly what we want),
    //    while staying small enough in texture space to never wrap
    //    around and ghost, no matter how high u_stretch goes.
    vec3 finalColour = vec3(0.0);
    for (int i = -kSize; i <= kSize; ++i) {
      for (int j = -kSize; j <= kSize; ++j) {
        vec2 offset = vec2(float(i), float(j)) * u_blurAmount;
        finalColour += kernel[kSize + j] * kernel[kSize + i] *
          texture2D(u_backgroundTexture, baseUv + offset).rgb;
      }
    }

    gl_FragColor = vec4(finalColour / (Z * Z), 1.0);
  }
`;
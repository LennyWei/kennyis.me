var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/i3zeL32xmdhiHJrdwCas/ZaNgNKOKR7ONSL81ALpI/Gijzhsih2.js
import { jsx as _jsx2, jsxs as _jsxs2 } from "react/jsx-runtime";
import { addFonts, ComponentViewportProvider, cx, getFonts, RichText, Shader, SmartComponentScopedContainer, useComponentViewport, useLocaleInfo, useVariantState, withCSS, withFX } from "./_framer-runtime.js";
import { LayoutGroup, motion as motion2, MotionConfigContext } from "framer-motion";
import * as React2 from "react";
import { useRef as useRef2 } from "react";

// http-url:https://framerusercontent.com/modules/QEytd7xyjUsL7yuVUzSs/O7s2vxltmhiskELYwyrY/LiquidGradient.js
import { defineShader, ControlType } from "./_framer-runtime.js";
var LiquidGradient_default = defineShader({ title: "Liquid Gradient", resolutionScale: "consistent", fragment: `
// === CONSTANTS ===
const float GOLDEN_ANGLE = 2.3999632;
const float TAU = 6.28318530;

// === PCG hash - https://www.jcgt.org/published/0009/03/02/
uvec3 hash3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}

// Seed
vec3 seedRandom(float seedVal) {
    uvec3 s = uvec3(
        floatBitsToUint(seedVal),
        floatBitsToUint(seedVal * 1.5 + 7.31),
        floatBitsToUint(seedVal * 2.7 + 13.37)
    );
    s = hash3(s);
    return vec3(s) / float(0xFFFFFFFFu);
}

// === COLOR SPACE UTILITIES ===
vec3 toLinear(vec3 c) {
    return pow(c, vec3(2.2));
}

vec3 toSrgb(vec3 c) {
    return pow(clamp(c, 0.0, 1.0), vec3(0.4545));
}

vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
    
    l = pow(max(l, 0.0), 1.0/3.0);
    m = pow(max(m, 0.0), 1.0/3.0);
    s = pow(max(s, 0.0), 1.0/3.0);
    
    return vec3(
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    );
}

vec3 oklabToLinear(vec3 c) {
    float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
    
    l = l * l * l;
    m = m * m * m;
    s = s * s * s;
    
    return vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec3 oklabToLch(vec3 lab) {
    return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y));
}

vec3 lchToOklab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
    vec3 lch0 = oklabToLch(lab0);
    vec3 lch1 = oklabToLch(lab1);
    
    if (lch0.y < 0.05) lch0.z = lch1.z;
    if (lch1.y < 0.05) lch1.z = lch0.z;
    
    float dh = lch1.z - lch0.z;
    if (dh > 3.14159265) dh -= 6.28318530;
    if (dh < -3.14159265) dh += 6.28318530;
    
    return lchToOklab(vec3(
        mix(lch0.x, lch1.x, t),
        mix(lch0.y, lch1.y, t),
        lch0.z + dh * t
    ));
}

// === PALETTE SAMPLING ===
vec3 getColor(int idx) {
    if (u_colors_length < 1) return vec3(0.0);
    int safeIdx = clamp(idx, 0, u_colors_length - 1);
    return u_colors[safeIdx].rgb;
}

vec3 paletteN(float t, int count) {
    if (count < 1) return vec3(0.0);
    if (count < 2) return toLinear(getColor(0));
    
    float segmentSize = 1.0 / float(count - 1);
    t = clamp(t, 0.0, 1.0);
    int idx = min(int(floor(t / segmentSize)), count - 2);
    float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);
    
    vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
    vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));
    
    return oklabToLinear(mixLch(lab0, lab1, localT));
}

// === DITHER ===
float IGN(vec2 uv) {
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
}

float quickNoise(vec2 I) {
    return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453);
}

// Dither Mode: 0=Off, 1=IGN, 2=quickNoise
float getDither(vec2 I, float mode) {
    if (mode < 0.5) return 0.5;          // 0: Off
    if (mode < 1.5) return IGN(I);       // 1: Smooth
    return quickNoise(I);                // 2: Grain
}

// === POST-PROCESS ===
vec3 softGamutMap(vec3 linearRgb) {
    float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
    float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));
    
    if (minC >= 0.0 && maxC <= 1.0) return linearRgb;
    
    vec3 lab = linearToOklab(max(linearRgb, 0.0));
    float L = clamp(lab.x, 0.0, 1.0);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);
    
    float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
    
    if (C > maxChroma * 0.7) {
        float knee = maxChroma * 0.7;
        C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
    }
    
    return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
}

vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
    vec3 lab = linearToOklab(linearRgb);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);
    
    lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
    C *= saturation;
    lab.y = C * cos(h);
    lab.z = C * sin(h);
    
    return oklabToLinear(lab);
}

// === MAIN ===
void main() {
    vec2 fragCoord = v_uv * u_resolution;
    vec2 r = u_resolution;
    vec2 p = (fragCoord * 2.0 - r) / r.y;
    
    int colorCount = u_colors_length;
    
    // Early out: no colors -> black
    if (colorCount < 1) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float t = u_time * 0.3;
    
    // Map time onto a circle so animation seamlessly wraps.
    float looping = step(0.5, u_loop);
    float phase = TAU * u_time / max(u_loop, 0.01);
    float radius = u_loop * u_speed * 0.3 / TAU;
    float tA = sin(phase) * radius;
    float tB = (1.0 - cos(phase)) * radius;
    
    // Seed-based offsets
    vec3 seedOffset = seedRandom(u_seed);
    vec3 seedOffset2 = seedRandom(u_seed + 100.0);
    
    // Golden angle rotation
    float seedAngle = u_seed * GOLDEN_ANGLE;
    vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;
    
    // Seed-based rotation
    float cs = cos(seedAngle);
    float sn = sin(seedAngle);
    p = mat2(cs, -sn, sn, cs) * p;
    
    // Get dither value
    float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);
    
    // === TURBULENCE ===
    float totalVal = 0.0;
    float totalWeight = 0.0;
    int turbIter = int(u_turbIter);
    
    float freq = 1.0 / max(u_turbFreq, 0.01);
    
    for (float i = 0.0; i < 4.0; i++) {
        float eph = i / 4.0;
       
        vec2 q = p * u_scale;
        float sq = eph * eph;
        
        if (u_jellify > 0.5) {
            q.yx *= mix(1.0, 0.5, 1.0 - exp(-sq));
        }
        
        float a = seedPhase.x;
        float d = seedPhase.y;
        
        for (int j = 2; j < 13; j++) {
            if (j >= turbIter) break;
            float fj = float(j);
            // When looping, use circular time. Otherwise original t.
            float t1 = mix(t * u_speed, tA, looping);
            float t2 = mix(t * u_speed, tB, looping);
            q += u_turbAmp * sin(q.yx / freq * fj + t1 + vec2(a, d) + seedOffset.xy * fj) / fj;
            a += cos(fj + d * 1.2 + q.x * 2.0 - t1 + seedOffset2.z + t2 * 0.3 * looping);
            d += sin(fj * q.y + a + seedOffset.z + t1 + seedOffset2.y + t2 * 0.3 * looping);
        }
        
        float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
        float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
        totalVal += v * weight;
        totalWeight += weight;
    }
    
    float val = totalVal / totalWeight;
    val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
    val = pow(val, exp(-u_distBias));
    val = clamp(val + (dither - 0.5) * u_dither, 0.0, 1.0);
    
    vec3 col = paletteN(val, colorCount);
    col *= u_exposure;
    col = applyContrastSaturation(col, u_contrast, u_saturation);
    col = softGamutMap(col);
    col = toSrgb(col);
    
    fragColor = vec4(col, 1.0);
}
`, propertyControls: { colors: { type: ControlType.Array, title: "Colors", control: { type: ControlType.Color }, maxCount: 8, defaultValue: ["#00001A", "#2962FF", "#40BCFF", "#FFB8B5", "#FFC14F"] }, seed: { type: ControlType.Number, title: "Seed", defaultValue: 648, min: 0, max: 1e3, step: 1 }, speed: { type: ControlType.Number, title: "Speed", defaultValue: 0.3, min: 0, max: 2, step: 0.01 }, loop: { type: ControlType.Number, title: "Loop", defaultValue: 0, min: 0, max: 60, step: 0.5, hiddenWhenUnset: true, displayStepper: true }, scale: { type: ControlType.Number, title: "Scale", defaultValue: 0.42, min: 0.1, max: 2, step: 0.01 }, turbAmp: { type: ControlType.Number, title: "Amplitude", defaultValue: 0.6, min: 0, max: 1, step: 0.01 }, turbFreq: { type: ControlType.Number, title: "Frequency", defaultValue: 0.1, min: 0.1, max: 2, step: 0.01 }, turbIter: { type: ControlType.Number, title: "Definition", defaultValue: 7, min: 3, max: 10, step: 1, displayStepper: true }, waveFreq: { type: ControlType.Number, title: "Bands", defaultValue: 3.8, min: 0.1, max: 5, step: 0.1 }, distBias: { type: ControlType.Number, title: "Bias", defaultValue: 0, min: -1, max: 1, step: 0.1, hiddenWhenUnset: true }, jellify: { type: ControlType.Boolean, title: "Jellify", defaultValue: false, hiddenWhenUnset: true }, ditherMode: { type: ControlType.Enum, title: "Noise", options: [0, 1, 2], optionTitles: ["Off", "Smooth", "Grain"], defaultValue: 0 }, dither: { type: ControlType.Number, title: "Amount", defaultValue: 0.05, min: 0, max: 0.2, step: 0.01, hidden: (props) => props.ditherMode === 0 }, exposure: { type: ControlType.Number, title: "Exposure", defaultValue: 1.1, min: 0.5, max: 2, step: 0.1, section: "Filters", displayStepper: true, hiddenWhenUnset: true }, contrast: { type: ControlType.Number, title: "Contrast", defaultValue: 1.1, min: 0.5, max: 2, step: 0.1, section: "Filters", displayStepper: true, hiddenWhenUnset: true }, saturation: { type: ControlType.Number, title: "Saturation", defaultValue: 1, min: 0, max: 2, step: 0.1, section: "Filters", displayStepper: true, hiddenWhenUnset: true } } });

// http-url:https://framerusercontent.com/modules/lbpix3duir33r8Urta6B/Rw9oetBZ5TDZMyESMyXg/CollageSwitcher.js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { addPropertyControls, ControlType as ControlType2, useIsStaticRenderer } from "./_framer-runtime.js";
import { motion, useInView } from "framer-motion";
function CollageSwitcher(props) {
  const { width = 760, cardHeight = 420, backgroundColor = "#0F0F10", textColor = "#F3E8CE", mutedTextColor = "#B8AB93", borderColor = "#2A2A2B", accentColor = "#FF8A3D", radius = 24, eyebrowFont = { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1em" }, titleFont = { fontSize: "32px", variant: "Semibold", letterSpacing: "-0.03em", lineHeight: "1em" }, captionFont = { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1.3em" }, accentFont = { variant: "Semibold", fontSize: "14px", letterSpacing: "-0.01em", lineHeight: "1em" }, items = [{ eyebrow: "Collage 01", title: "MOVING SYSTEMS", caption: "A prominent center block for shape, rhythm, and identity fragments.", accentLabel: "active" }, { eyebrow: "Collage 02", title: "SIGNAL FIELDS", caption: "Keyboard-switchable panels built from barcode strips, dots, and interface marks.", accentLabel: "next" }, { eyebrow: "Collage 03", title: "UTILITY GLYPHS", caption: "A denser collage state with warmer accents and ability-style controls.", accentLabel: "alt" }], style } = props;
  const safeItems = items.length > 0 ? items : [{ eyebrow: "Issue", title: "COLLAGE", caption: "Add collage items in controls.", accentLabel: "" }];
  const [index, setIndex] = React.useState(0);
  const isStatic = useIsStaticRenderer();
  const artRef = React.useRef(null);
  const isInView = useInView(artRef, { margin: "-10% 0px -10% 0px", amount: 0.2 });
  const goPrevious = React.useCallback(() => {
    React.startTransition(() => {
      setIndex((prev) => (prev - 1 + safeItems.length) % safeItems.length);
    });
  }, [safeItems.length]);
  const goNext = React.useCallback(() => {
    React.startTransition(() => {
      setIndex((prev) => (prev + 1) % safeItems.length);
    });
  }, [safeItems.length]);
  React.useEffect(() => {
    if (typeof __dai_window !== "undefined") {
      const onKeyDown = (event) => {
        if (event.key === "ArrowLeft")
          goPrevious();
        if (event.key === "ArrowRight")
          goNext();
      };
      __dai_window.addEventListener("keydown", onKeyDown);
      return () => __dai_window.removeEventListener("keydown", onKeyDown);
    }
    return;
  }, [goNext, goPrevious]);
  React.useEffect(() => {
    React.startTransition(() => {
      setIndex((prev) => prev % safeItems.length);
    });
  }, [safeItems.length]);
  const activeItem = safeItems[index];
  const collageShapes = React.useMemo(() => {
    const sharedPanel = { position: "absolute", borderRadius: radius * 0.5, border: `1px solid ${borderColor}`, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(2px)" };
    if (index % 3 === 0) {
      return /* @__PURE__ */ _jsxs(_Fragment, { children: [/* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "10%", left: "6%", width: "46%", height: "52%" } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "22%", right: "8%", width: "38%", height: "30%", borderRadius: 999 } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, bottom: "10%", left: "14%", width: "62%", height: "22%" } }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", right: "12%", bottom: "14%", width: "24%", height: "18%", borderTop: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}` } }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", left: "10%", bottom: "16%", width: "18%", height: 4, background: accentColor } })] });
    }
    if (index % 3 === 1) {
      return /* @__PURE__ */ _jsxs(_Fragment, { children: [/* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "14%", left: "10%", width: "34%", height: "66%", borderRadius: radius } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "12%", right: "8%", width: "44%", height: "24%" } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, bottom: "14%", right: "10%", width: "44%", height: "42%", borderRadius: 999 } }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", top: "22%", right: "16%", width: "32%", height: "12%", display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 2 }, children: Array.from({ length: 56 }).map((_, i) => /* @__PURE__ */ _jsx("span", { style: { width: "100%", aspectRatio: "1 / 1", background: i % 3 === 0 ? accentColor : borderColor, borderRadius: 999, opacity: 0.9 } }, `dot-${i}`)) }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", left: "14%", bottom: "20%", width: "22%", height: 8, background: accentColor, borderRadius: 999 } })] });
    }
    return /* @__PURE__ */ _jsxs(_Fragment, { children: [/* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "12%", left: "8%", width: "38%", height: "24%", borderRadius: 999 } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, top: "16%", right: "9%", width: "42%", height: "56%" } }), /* @__PURE__ */ _jsx("div", { style: { ...sharedPanel, bottom: "10%", left: "14%", width: "30%", height: "28%" } }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "16%", height: "56%", display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2 }, children: Array.from({ length: 100 }).map((_, i) => /* @__PURE__ */ _jsx("span", { style: { width: "100%", background: i % 2 === 0 ? textColor : "transparent", border: i % 2 === 0 ? "none" : `1px solid ${borderColor}`, opacity: i % 2 === 0 ? 0.2 : 0.4 } }, `barcode-${i}`)) }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", right: "12%", bottom: "14%", width: "30%", height: "2px", background: accentColor } })] });
  }, [accentColor, borderColor, index, radius, textColor]);
  const shouldAnimate = !isStatic && isInView;
  return /* @__PURE__ */ _jsx("section", { style: { position: "relative", width, height: cardHeight, background: "transparent", display: "flex", justifyContent: "center", alignItems: "center", ...style }, children: /* @__PURE__ */ _jsxs("article", { style: { position: "relative", width: "100%", height: "100%", borderRadius: radius, border: `1px solid ${borderColor}`, background: backgroundColor, overflow: "hidden", display: "grid", gridTemplateRows: "1fr auto" }, children: [/* @__PURE__ */ _jsxs("div", { ref: artRef, style: { position: "relative", overflow: "hidden", borderBottom: `1px solid ${borderColor}` }, children: [shouldAnimate ? /* @__PURE__ */ _jsx(motion.div, { style: { position: "absolute", inset: -40, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 70% 60%, rgba(255,130,60,0.12), transparent 45%)", filter: "blur(4px)" }, animate: { x: [0, 22, -14, 0], y: [0, -16, 8, 0] }, transition: { duration: 16, ease: "linear", repeat: Infinity } }) : /* @__PURE__ */ _jsx("div", { style: { position: "absolute", inset: -40, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 70% 60%, rgba(255,130,60,0.08), transparent 45%)", filter: "blur(4px)" } }), /* @__PURE__ */ _jsx("div", { style: { position: "absolute", inset: 0 }, children: collageShapes }), /* @__PURE__ */ _jsx("button", { type: "button", "aria-label": "Show previous collage", onClick: goPrevious, style: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 999, border: `1px solid ${borderColor}`, background: "rgba(8,8,8,0.6)", color: textColor, cursor: "pointer" }, children: "\u2190" }), /* @__PURE__ */ _jsx("button", { type: "button", "aria-label": "Show next collage", onClick: goNext, style: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 999, border: `1px solid ${borderColor}`, background: "rgba(8,8,8,0.6)", color: textColor, cursor: "pointer" }, children: "\u2192" })] }), /* @__PURE__ */ _jsxs("div", { style: { position: "relative", padding: "18px 20px 20px 20px", display: "grid", gap: 10 }, children: [/* @__PURE__ */ _jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [/* @__PURE__ */ _jsx("span", { style: { color: mutedTextColor, textTransform: "uppercase", fontSize: eyebrowFont.fontSize, lineHeight: eyebrowFont.lineHeight, letterSpacing: eyebrowFont.letterSpacing, fontWeight: eyebrowFont.fontWeight, fontFamily: eyebrowFont.fontFamily, fontStyle: eyebrowFont.fontStyle, textAlign: eyebrowFont.textAlign }, children: activeItem.eyebrow }), activeItem.accentLabel ? /* @__PURE__ */ _jsx("span", { style: { color: backgroundColor, background: accentColor, borderRadius: 999, padding: "5px 10px", textTransform: "uppercase", fontSize: accentFont.fontSize, lineHeight: accentFont.lineHeight, letterSpacing: accentFont.letterSpacing, fontWeight: accentFont.fontWeight, fontFamily: accentFont.fontFamily, fontStyle: accentFont.fontStyle, textAlign: accentFont.textAlign }, children: activeItem.accentLabel }) : null] }), /* @__PURE__ */ _jsx("h3", { style: { margin: 0, color: textColor, textTransform: "uppercase", fontSize: titleFont.fontSize, lineHeight: titleFont.lineHeight, letterSpacing: titleFont.letterSpacing, fontWeight: titleFont.fontWeight, fontFamily: titleFont.fontFamily, fontStyle: titleFont.fontStyle, textAlign: titleFont.textAlign }, children: activeItem.title }), /* @__PURE__ */ _jsx("p", { style: { margin: 0, color: mutedTextColor, fontSize: captionFont.fontSize, lineHeight: captionFont.lineHeight, letterSpacing: captionFont.letterSpacing, fontWeight: captionFont.fontWeight, fontFamily: captionFont.fontFamily, fontStyle: captionFont.fontStyle, textAlign: captionFont.textAlign, maxWidth: "68ch" }, children: activeItem.caption })] })] }) });
}
addPropertyControls(CollageSwitcher, { width: { type: ControlType2.Number, title: "Width", defaultValue: 760, min: 320, max: 1200, step: 1 }, cardHeight: { type: ControlType2.Number, title: "Card Height", defaultValue: 420, min: 280, max: 900, step: 1 }, backgroundColor: { type: ControlType2.Color, title: "Background", defaultValue: "#FFFFFF" }, textColor: { type: ControlType2.Color, title: "Text", defaultValue: "#000000" }, mutedTextColor: { type: ControlType2.Color, title: "Muted Text", defaultValue: "#CCCCCC" }, borderColor: { type: ControlType2.Color, title: "Border", defaultValue: "#EEEEEE" }, accentColor: { type: ControlType2.Color, title: "Accent", defaultValue: "#000000" }, radius: { type: ControlType2.Number, title: "Radius", defaultValue: 24, min: 0, max: 80, step: 1 }, eyebrowFont: { type: ControlType2.Font, title: "Eyebrow Font", defaultValue: { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1em" }, controls: "extended", defaultFontType: "sans-serif" }, titleFont: { type: ControlType2.Font, title: "Title Font", defaultValue: { fontSize: "32px", variant: "Semibold", letterSpacing: "-0.03em", lineHeight: "1em" }, controls: "extended", defaultFontType: "sans-serif" }, captionFont: { type: ControlType2.Font, title: "Caption Font", defaultValue: { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1.3em" }, controls: "extended", defaultFontType: "sans-serif" }, accentFont: { type: ControlType2.Font, title: "Accent Font", defaultValue: { variant: "Semibold", fontSize: "14px", letterSpacing: "-0.01em", lineHeight: "1em" }, controls: "extended", defaultFontType: "sans-serif" }, items: { type: ControlType2.Array, title: "Collages", defaultValue: [{ eyebrow: "Collage 01", title: "MOVING SYSTEMS", caption: "A prominent center block for shape, rhythm, and identity fragments.", accentLabel: "active" }, { eyebrow: "Collage 02", title: "SIGNAL FIELDS", caption: "Keyboard-switchable panels built from barcode strips, dots, and interface marks.", accentLabel: "next" }, { eyebrow: "Collage 03", title: "UTILITY GLYPHS", caption: "A denser collage state with warmer accents and ability-style controls.", accentLabel: "alt" }], control: { type: ControlType2.Object, controls: { eyebrow: { type: ControlType2.String, title: "Eyebrow", defaultValue: "Issue" }, title: { type: ControlType2.String, title: "Title", defaultValue: "COLLAGE TITLE" }, caption: { type: ControlType2.String, title: "Caption", defaultValue: "Describe the collage panel.", displayTextArea: true }, accentLabel: { type: ControlType2.String, title: "Accent", defaultValue: "", placeholder: "Optional" } } }, maxCount: 12 } });

// http-url:https://framerusercontent.com/modules/i3zeL32xmdhiHJrdwCas/ZaNgNKOKR7ONSL81ALpI/Gijzhsih2.js
var SmartComponentScopedContainerWithFX = withFX(SmartComponentScopedContainer);
var CollageSwitcherFonts = getFonts(CollageSwitcher);
var serializationHash = "framer-W2gXH";
var variantClassNames = { Z9HUKEjbN: "framer-v-nwyyvp" };
var transition1 = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" };
var transition2 = { delay: 0, duration: 28, ease: [0, 0, 1, 1], type: "tween" };
var animation = { opacity: 1, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, skewX: 0, skewY: 0, x: -180, y: 0 };
var Transition = ({ value, children }) => {
  const config = React2.useContext(MotionConfigContext);
  const transition = value ?? config.transition;
  const contextValue = React2.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)]);
  return /* @__PURE__ */ _jsx2(MotionConfigContext.Provider, { value: contextValue, children });
};
var Variants = motion2.create(React2.Fragment);
var getProps = ({ height, id, width, ...props }) => {
  return { ...props };
};
var createLayoutDependency = (props, variants) => {
  if (props.layoutDependency)
    return variants.join("-") + props.layoutDependency;
  return variants.join("-");
};
var Component = /* @__PURE__ */ React2.forwardRef(function(props, ref) {
  const fallbackRef = useRef2(null);
  const refBinding = ref ?? fallbackRef;
  const defaultLayoutId = React2.useId();
  const { activeLocale, setLocale } = useLocaleInfo();
  const componentViewport = useComponentViewport();
  const { style, className, layoutId, variant, ...restProps } = getProps(props);
  const { baseVariant, classNames, clearLoadingGesture, gestureHandlers, gestureVariant, isLoading, setGestureState, setVariant, variants } = useVariantState({ defaultVariant: "Z9HUKEjbN", ref: refBinding, variant, variantClassNames });
  const layoutDependency = createLayoutDependency(props, variants);
  const sharedStyleClassNames = [];
  const scopingClassNames = cx(serializationHash, ...sharedStyleClassNames);
  return /* @__PURE__ */ _jsx2(LayoutGroup, { id: layoutId ?? defaultLayoutId, children: /* @__PURE__ */ _jsx2(Variants, { animate: variants, initial: false, children: /* @__PURE__ */ _jsx2(Transition, { value: transition1, children: /* @__PURE__ */ _jsx2(motion2.section, { ...restProps, ...gestureHandlers, className: cx(scopingClassNames, "framer-nwyyvp", className, classNames), "data-framer-name": "Variant 1", layoutDependency, layoutId: "MiddleGradientSwitcherZone__Z9HUKEjbN", ref: refBinding, style: { ...style }, children: /* @__PURE__ */ _jsxs2(motion2.div, { className: "framer-s43f6k", "data-border": true, "data-framer-name": "Moving Gradient Stage", layoutDependency, layoutId: "MiddleGradientSwitcherZone__Eo8tcgHD0", style: { "--border-bottom-width": "1px", "--border-color": "rgba(245, 238, 220, 0.16)", "--border-left-width": "1px", "--border-right-width": "1px", "--border-style": "solid", "--border-top-width": "1px", backgroundColor: "rgb(16, 16, 16)", borderBottomLeftRadius: 34, borderBottomRightRadius: 34, borderTopLeftRadius: 34, borderTopRightRadius: 34 }, children: [/* @__PURE__ */ _jsx2(SmartComponentScopedContainerWithFX, { __framer__loop: animation, __framer__loopEffectEnabled: true, __framer__loopPauseOffscreen: true, __framer__loopRepeatDelay: 0, __framer__loopRepeatType: "loop", __framer__loopTransition: transition2, __perspectiveFX: false, __smartComponentFX: true, __targetOpacity: 1, className: "framer-1fw8qhk-container", "data-framer-name": "Noise Gradient Background", layoutDependency, layoutId: "MiddleGradientSwitcherZone__y3aSsRu2P-container", rendersWithMotion: true, children: /* @__PURE__ */ _jsx2(Shader, { __fromCanvasComponent: true, animated: LiquidGradient_default.animated, buffers: LiquidGradient_default.buffers, fallbackImage: "https://framerusercontent.com/images/TYKiEX4tF7TwZIhidjimPmRH14.png?scale-down-to=1124&width=2248&height=1120", fragmentShader: LiquidGradient_default.fragment, height: "100%", heightmapSource: LiquidGradient_default.heightmapSource, mode: "progressive", mouse: LiquidGradient_default.mouse && { enabled: LiquidGradient_default.mouse === "enabledByDefault" }, resolutionScale: LiquidGradient_default.resolutionScale, skipInitialFallback: true, uniforms: { u_colors: { type: "array", value: ["rgb(10, 10, 10)", "rgb(58, 36, 20)", "rgb(180, 106, 42)", "rgb(245, 238, 220)", "rgb(21, 21, 21)"] }, u_contrast: { type: "number", value: 1.18 }, u_distBias: { type: "number", value: 0 }, u_dither: { type: "number", value: 0.08 }, u_ditherMode: { type: "enum", value: 2 }, u_exposure: { type: "number", value: 1.02 }, u_jellify: { type: "boolean", value: false }, u_loop: { type: "number", value: 0 }, u_saturation: { type: "number", value: 0.92 }, u_scale: { type: "number", value: 0.58 }, u_seed: { type: "number", value: 321 }, u_speed: { type: "number", value: 0.1 }, u_turbAmp: { type: "number", value: 0.64 }, u_turbFreq: { type: "number", value: 1.13 }, u_turbIter: { type: "number", value: 8 }, u_waveFreq: { type: "number", value: 3.8 } }, vertexShader: LiquidGradient_default.vertex, width: "100%" }) }), /* @__PURE__ */ _jsx2(motion2.div, { className: "framer-1nryw0v", "data-framer-name": "Noise Overlay", layoutDependency, layoutId: "MiddleGradientSwitcherZone__JDeNn60m0", style: { opacity: 0.35 } }), /* @__PURE__ */ _jsxs2(motion2.div, { className: "framer-8m0xiq", "data-framer-name": "Stage Label Row", layoutDependency, layoutId: "MiddleGradientSwitcherZone__XvvV0eCxR", children: [/* @__PURE__ */ _jsx2(RichText, { __fromCanvasComponent: true, children: /* @__PURE__ */ _jsx2(React2.Fragment, { children: /* @__PURE__ */ _jsx2(motion2.p, { dir: "auto", style: { "--font-selector": "R0Y7TGF0by05MDA=", "--framer-font-family": '"Lato", sans-serif', "--framer-font-size": "11px", "--framer-font-weight": "900", "--framer-letter-spacing": "0.18em", "--framer-line-height": "1.15em", "--framer-text-color": "var(--extracted-r6o4lv, #F5EEDC)", "--framer-text-transform": "uppercase" }, children: "moving collage surface" }) }), className: "framer-y1coag", "data-framer-name": "Stage Label", fonts: ["GF;Lato-900"], layoutDependency, layoutId: "MiddleGradientSwitcherZone__g20H16POI", style: { "--extracted-r6o4lv": "#F5EEDC" }, verticalAlignment: "top", withExternalLayout: true }), /* @__PURE__ */ _jsx2(RichText, { __fromCanvasComponent: true, children: /* @__PURE__ */ _jsx2(React2.Fragment, { children: /* @__PURE__ */ _jsx2(motion2.p, { dir: "auto", style: { "--font-selector": "R0Y7TGF0by05MDA=", "--framer-font-family": '"Lato", sans-serif', "--framer-font-size": "11px", "--framer-font-weight": "900", "--framer-letter-spacing": "0.18em", "--framer-line-height": "1.15em", "--framer-text-color": "var(--extracted-r6o4lv, rgba(245, 238, 220, 0.68))", "--framer-text-transform": "uppercase" }, children: "use \u2190 / \u2192 keys" }) }), className: "framer-nhzwhz", "data-framer-name": "Keyboard Hint", fonts: ["GF;Lato-900"], layoutDependency, layoutId: "MiddleGradientSwitcherZone__K9qirMJxp", style: { "--extracted-r6o4lv": "rgba(245, 238, 220, 0.68)" }, verticalAlignment: "top", withExternalLayout: true })] }), /* @__PURE__ */ _jsx2(motion2.div, { className: "framer-i627aa", "data-framer-name": "Centered Collage Switcher Wrap", layoutDependency, layoutId: "MiddleGradientSwitcherZone__RvC5Q3R7n", children: /* @__PURE__ */ _jsx2(ComponentViewportProvider, { children: /* @__PURE__ */ _jsx2(SmartComponentScopedContainer, { className: "framer-d90bez-container", "data-framer-name": "Centered Collage Switcher", isAuthoredByUser: true, layoutDependency, layoutId: "MiddleGradientSwitcherZone__EJ1wM59z9-container", name: "Centered Collage Switcher", nodeId: "EJ1wM59z9", rendersWithMotion: true, scopeId: "Gijzhsih2", children: /* @__PURE__ */ _jsx2(CollageSwitcher, { accentColor: "rgb(217, 130, 58)", accentFont: { fontFamily: '"Lato-900", sans-serif', fontSize: "10px", letterSpacing: "0.1em", lineHeight: "1em" }, backgroundColor: "rgb(14, 14, 15)", borderColor: "rgba(245, 238, 220, 0.22)", captionFont: { fontFamily: '"Lora-500", sans-serif', fontSize: "14px", letterSpacing: "-0.01em", lineHeight: "1.35em" }, cardHeight: 420, eyebrowFont: { fontFamily: '"Lato-900", sans-serif', fontSize: "11px", letterSpacing: "0.14em", lineHeight: "1em" }, height: "100%", id: "EJ1wM59z9", items: [{ accentLabel: "active", caption: "A prominent center block for shape, rhythm, and identity fragments.", eyebrow: "Collage 01", title: "MOVING SYSTEMS" }, { accentLabel: "next", caption: "Keyboard-switchable panels built from barcode strips, dots, and interface marks.", eyebrow: "Collage 02", title: "SIGNAL FIELDS" }, { accentLabel: "alt", caption: "A denser collage state with warmer accents and ability-style controls.", eyebrow: "Collage 03", title: "UTILITY GLYPHS" }], layoutId: "MiddleGradientSwitcherZone__EJ1wM59z9", mutedTextColor: "rgba(245, 238, 220, 0.68)", name: "Centered Collage Switcher", radius: 28, style: { height: "100%", width: "100%" }, textColor: "rgb(245, 238, 220)", titleFont: { fontFamily: '"Lato-900", sans-serif', fontSize: "32px", letterSpacing: "-0.035em", lineHeight: "0.95em" }, width: "100%" }) }) }) })] }) }) }) }) });
});
var css = ["@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }", ".framer-W2gXH.framer-yt3lja, .framer-W2gXH .framer-yt3lja { display: block; }", ".framer-W2gXH.framer-nwyyvp { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 14px; height: min-content; justify-content: flex-start; max-width: 1180px; overflow: var(--overflow-clip-fallback, clip); padding: 34px 28px 58px 28px; position: relative; width: 100%; }", ".framer-W2gXH .framer-s43f6k { align-content: center; align-items: center; display: flex; flex: none; flex-direction: column; flex-wrap: nowrap; gap: 0px; height: 560px; justify-content: center; overflow: var(--overflow-clip-fallback, clip); padding: 42px; position: relative; width: 100%; will-change: var(--framer-will-change-override, transform); }", ".framer-W2gXH .framer-1fw8qhk-container { bottom: 0px; flex: none; left: 0px; position: absolute; right: 0px; top: 0px; z-index: 0; }", ".framer-W2gXH .framer-1nryw0v { flex: none; height: 1px; left: -7px; mix-blend-mode: overlay; overflow: var(--overflow-clip-fallback, clip); position: absolute; top: -141px; width: 1px; z-index: 1; }", ".framer-W2gXH .framer-8m0xiq { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; height: min-content; justify-content: space-between; left: 28px; overflow: visible; padding: 0px; position: absolute; top: 24px; width: min-content; z-index: 2; }", ".framer-W2gXH .framer-y1coag, .framer-W2gXH .framer-nhzwhz { flex: none; height: auto; position: relative; white-space: pre; width: auto; }", ".framer-W2gXH .framer-i627aa { align-content: center; align-items: center; display: flex; flex: none; flex-direction: row; flex-wrap: nowrap; gap: 0px; height: min-content; justify-content: center; overflow: visible; padding: 0px; position: relative; width: 89%; z-index: 3; }", ".framer-W2gXH .framer-d90bez-container { flex: none; height: 420px; position: relative; width: 760px; }", '.framer-W2gXH[data-border="true"]::after, .framer-W2gXH [data-border="true"]::after { content: ""; border-width: var(--border-top-width, 0) var(--border-right-width, 0) var(--border-bottom-width, 0) var(--border-left-width, 0); border-color: var(--border-color, none); border-style: var(--border-style, none); width: 100%; height: 100%; position: absolute; box-sizing: border-box; left: 0; top: 0; border-radius: inherit; corner-shape: inherit; pointer-events: none; }'];
var FramerGijzhsih2 = withCSS(Component, css, "framer-W2gXH");
var Gijzhsih2_default = FramerGijzhsih2;
FramerGijzhsih2.displayName = "Middle Gradient Switcher Zone";
FramerGijzhsih2.defaultProps = { height: 652, width: 1180 };
addFonts(FramerGijzhsih2, [{ explicitInter: true, fonts: [{ cssFamilyName: "Lato", source: "google", style: "normal", uiFamilyName: "Lato", url: "https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh50XewqFGC_p9dw.woff2", weight: "900" }] }, ...CollageSwitcherFonts], { supportsExplicitInterCodegen: true });
var __FramerMetadata__ = { "exports": { "Props": { "type": "tsType", "annotations": { "framerContractVersion": "1" } }, "default": { "type": "reactComponent", "name": "FramerGijzhsih2", "slots": [], "annotations": { "framerCanvasComponentVariantDetails": '{"propertyName":"variant","data":{"default":{"layout":["fixed","auto"],"constraints":[null,"1180px",null,null]}}}', "framerColorSyntax": "true", "framerIntrinsicWidth": "1180", "framerAutoSizeImages": "true", "framerContractVersion": "1", "framerDisplayContentsDiv": "false", "framerComponentViewportWidth": "true", "framerIntrinsicHeight": "652", "framerImmutableVariables": "true" } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  Gijzhsih2_default as default
};

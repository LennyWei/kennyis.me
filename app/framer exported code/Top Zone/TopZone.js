var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/NQBETzerPyNTl5EK3Nd9/Fg5ljaRyqte0ZLjHa0xT/QvwJirpcO.js
import { jsx as _jsx2 } from "react/jsx-runtime";
import { addFonts, cx, RichText, useComponentViewport, useLocaleInfo, useVariantState, withCodeBoundaryForOverrides, withCSS } from "./_framer-runtime.js";
import { LayoutGroup, motion as motion2, MotionConfigContext } from "framer-motion";
import * as React from "react";
import { useRef } from "react";

// http-url:https://framerusercontent.com/modules/z8bj7mbH22u5e21zUOl8/oaaRnLBHg0nCc75jAg1B/LandingAnimationOverrides.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { isStaticRenderer } from "./_framer-runtime.js";
import { motion } from "framer-motion";
function withLetterSpacingIntro(Component2) {
  return /* @__PURE__ */ forwardRef((props, ref) => {
    const staticRender = isStaticRenderer();
    const MotionComponent = motion(Component2);
    return /* @__PURE__ */ _jsx(MotionComponent, { ref, ...props, style: { ...props.style }, initial: staticRender ? false : { opacity: 0, letterSpacing: "0.18em", y: 8 }, animate: staticRender ? void 0 : { opacity: 1, letterSpacing: props?.style?.letterSpacing ?? "normal", y: 0 }, transition: staticRender ? void 0 : { duration: 1.1, delay: 0.06, ease: [0.44, 0, 0.56, 1] } });
  });
}

// http-url:https://framerusercontent.com/modules/NQBETzerPyNTl5EK3Nd9/Fg5ljaRyqte0ZLjHa0xT/QvwJirpcO.js
var RichTextWithLetterSpacingIntro142jkrz = withCodeBoundaryForOverrides(RichText, { nodeId: "WUCEsMj3G", override: withLetterSpacingIntro, scopeId: "QvwJirpcO" });
var serializationHash = "framer-1JxIJ";
var variantClassNames = { h5ewpvDTX: "framer-v-1y0ut2i" };
var transition1 = { bounce: 0.2, delay: 0, duration: 0.4, type: "spring" };
var Transition = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext);
  const transition = value ?? config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)]);
  return /* @__PURE__ */ _jsx2(MotionConfigContext.Provider, { value: contextValue, children });
};
var Variants = motion2.create(React.Fragment);
var getProps = ({ height, id, width, ...props }) => {
  return { ...props };
};
var createLayoutDependency = (props, variants) => {
  if (props.layoutDependency)
    return variants.join("-") + props.layoutDependency;
  return variants.join("-");
};
var Component = /* @__PURE__ */ React.forwardRef(function(props, ref) {
  const fallbackRef = useRef(null);
  const refBinding = ref ?? fallbackRef;
  const defaultLayoutId = React.useId();
  const { activeLocale, setLocale } = useLocaleInfo();
  const componentViewport = useComponentViewport();
  const { style, className, layoutId, variant, ...restProps } = getProps(props);
  const { baseVariant, classNames, clearLoadingGesture, gestureHandlers, gestureVariant, isLoading, setGestureState, setVariant, variants } = useVariantState({ defaultVariant: "h5ewpvDTX", ref: refBinding, variant, variantClassNames });
  const layoutDependency = createLayoutDependency(props, variants);
  const sharedStyleClassNames = [];
  const scopingClassNames = cx(serializationHash, ...sharedStyleClassNames);
  return /* @__PURE__ */ _jsx2(LayoutGroup, { id: layoutId ?? defaultLayoutId, children: /* @__PURE__ */ _jsx2(Variants, { animate: variants, initial: false, children: /* @__PURE__ */ _jsx2(Transition, { value: transition1, children: /* @__PURE__ */ _jsx2(motion2.section, { ...restProps, ...gestureHandlers, className: cx(scopingClassNames, "framer-1y0ut2i", className, classNames), "data-framer-name": "Variant 1", layoutDependency, layoutId: "TopZone__h5ewpvDTX", ref: refBinding, style: { ...style }, children: /* @__PURE__ */ _jsx2(RichTextWithLetterSpacingIntro142jkrz, { __fromCanvasComponent: true, children: /* @__PURE__ */ _jsx2(React.Fragment, { children: /* @__PURE__ */ _jsx2(motion2.h1, { dir: "auto", style: { "--font-selector": "R0Y7VW5pZnJha3R1ck1hZ3VudGlhLXJlZ3VsYXI=", "--framer-font-family": '"UnifrakturMaguntia", sans-serif', "--framer-font-size": "129px", "--framer-letter-spacing": "0.005em", "--framer-line-height": "0.9em", "--framer-text-alignment": "center", "--framer-text-color": "var(--extracted-gdpscs, var(--token-8c13092a-4700-4647-9d96-fd61a1d0ed02, rgb(245, 238, 220)))" }, children: "\u2026 Kenny Liang \u2026" }) }), className: "framer-142jkrz", "data-framer-name": "Display Title", fonts: ["GF;UnifrakturMaguntia-regular"], layoutDependency, layoutId: "TopZone__WUCEsMj3G", style: { "--extracted-gdpscs": "var(--token-8c13092a-4700-4647-9d96-fd61a1d0ed02, rgb(245, 238, 220))" }, verticalAlignment: "top", withExternalLayout: true }) }) }) }) });
});
var css = ["@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }", ".framer-1JxIJ.framer-17g9tyl, .framer-1JxIJ .framer-17g9tyl { display: block; }", ".framer-1JxIJ.framer-1y0ut2i { align-content: center; align-items: center; display: flex; flex-direction: column; flex-wrap: nowrap; gap: 20px; height: min-content; justify-content: flex-start; max-width: 1180px; overflow: var(--overflow-clip-fallback, clip); padding: 22px 28px 24px 28px; position: relative; width: 100%; }", ".framer-1JxIJ .framer-142jkrz { --framer-text-wrap: balance; flex: none; height: 116px; overflow: visible; position: relative; white-space: pre-wrap; width: 100%; word-break: break-word; word-wrap: break-word; }"];
var FramerQvwJirpcO = withCSS(Component, css, "framer-1JxIJ");
var QvwJirpcO_default = FramerQvwJirpcO;
FramerQvwJirpcO.displayName = "Top Zone";
FramerQvwJirpcO.defaultProps = { height: 162.1, width: 1180 };
addFonts(FramerQvwJirpcO, [{ explicitInter: true, fonts: [{ cssFamilyName: "UnifrakturMaguntia", source: "google", style: "normal", uiFamilyName: "UnifrakturMaguntia", url: "https://fonts.gstatic.com/s/unifrakturmaguntia/v22/WWXPlieVYwiGNomYU-ciRLRvEmK7oaVummxNNgNa1A.woff2", weight: "400" }] }], { supportsExplicitInterCodegen: true });
var __FramerMetadata__ = { "exports": { "Props": { "type": "tsType", "annotations": { "framerContractVersion": "1" } }, "default": { "type": "reactComponent", "name": "FramerQvwJirpcO", "slots": [], "annotations": { "framerContractVersion": "1", "framerAutoSizeImages": "true", "framerImmutableVariables": "true", "framerCanvasComponentVariantDetails": '{"propertyName":"variant","data":{"default":{"layout":["fixed","auto"],"constraints":[null,"1180px",null,null]}}}', "framerDisplayContentsDiv": "false", "framerIntrinsicWidth": "1180", "framerComponentViewportWidth": "true", "framerIntrinsicHeight": "162.1", "framerColorSyntax": "true" } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  QvwJirpcO_default as default
};

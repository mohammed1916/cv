/**
 * Capture a screenshot of the visualizer panel as a base64 PNG data URL.
 * Targets any element with [data-visualizer-root] in the DOM.
 */

// Browsers may report colour-mix() results as color(srgb r g b / a), which
// html2canvas cannot parse. Convert those values on the captured copy only.
const SRGB_COLOR = /color\(\s*srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)(?:\s*\/\s*([\d.e+-]+%?))?\s*\)/gi;
const COLOR_PROPS = [
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "box-shadow",
  "text-shadow",
  "fill",
  "stroke",
];

function toLegacyColor(value) {
  return value.replace(SRGB_COLOR, (_, r, g, b, a) => {
    const [R, G, B] = [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, parseFloat(v))) * 255));
    const alpha = a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a);
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  });
}

function sanitiseClone(clonedDoc) {
  const root = clonedDoc.querySelector("[data-capture-root]");
  if (!root) return;
  const view = clonedDoc.defaultView;
  for (const el of [root, ...root.querySelectorAll("*")]) {
    const style = view.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const value = style.getPropertyValue(prop);
      if (value && /color\(/i.test(value)) {
        el.style.setProperty(prop, toLegacyColor(value), "important");
      }
    }
  }
}

export async function captureVisualizer() {
  const target =
    document.querySelector("[data-visualizer-root]") || document.querySelector(".problem-content");
  if (!target) throw new Error("No visualizer panel found on the page.");

  // Dynamic import to keep html2canvas out of the critical bundle
  const { default: html2canvas } = await import("html2canvas");

  target.setAttribute("data-capture-root", "");
  try {
    const canvas = await html2canvas(target, {
      backgroundColor: "#0f172a",
      scale: 1.5,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        try {
          sanitiseClone(clonedDoc);
        } catch {
          /* Keep the capture even if a colour cannot be converted. */
        }
      },
    });
    return canvas.toDataURL("image/png");
  } finally {
    target.removeAttribute("data-capture-root");
  }
}

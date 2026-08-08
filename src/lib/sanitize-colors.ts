/**
 * html2canvas cannot parse modern CSS color functions (oklch/lab/color-mix)
 * emitted by Tailwind v4. This walks a cloned DOM tree and rewrites every
 * color-bearing computed style into a plain rgb() value the library accepts.
 */
const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "fill",
  "stroke",
] as const;

let ctx: CanvasRenderingContext2D | null = null;
function toRgb(value: string): string | null {
  if (!value) return null;
  if (!/oklch|oklab|lab\(|lch\(|color\(|color-mix/i.test(value)) return null;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "rgb(0, 0, 0)";
  try {
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    return typeof resolved === "string" ? resolved : null;
  } catch {
    return "rgb(0, 0, 0)";
  }
}

export function sanitizeColors(root: HTMLElement) {
  const elements: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of elements) {
    const computed = window.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const current = computed[prop as keyof CSSStyleDeclaration] as unknown as string;
      const fixed = toRgb(current);
      if (fixed) el.style.setProperty(prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), fixed);
    }
    const bgImage = computed.backgroundImage;
    if (bgImage && /oklch|oklab|color-mix/i.test(bgImage)) el.style.backgroundImage = "none";
    const shadow = computed.boxShadow;
    if (shadow && /oklch|oklab|color-mix/i.test(shadow)) el.style.boxShadow = "none";
  }
}

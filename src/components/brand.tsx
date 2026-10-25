// Claw Street brand: the approved pixel-robot lockup (Kessai Labs design reference
// "Logo Claw Street lockup", Main.dc.html). Every rect, colour and the glow filter are copied
// exactly from that reference; nothing here is redrawn. Display: Claw Street — Powered by Credence.

import { useId } from "react";
import { cn } from "@/lib/utils";

export const BRAND = {
  product: "Claw Street",
  infrastructure: "Credence",
  company: "Kessai Labs",
  display: "Claw Street — Powered by Credence",
  accent: "#3DFF8F",
} as const;

type Pixel = [x: number, y: number, w: number, h: number, fill: string, glow?: boolean];

const A = BRAND.accent;
// Rect-for-rect from the reference SVG (viewBox 0 0 24 19); "A" marks {{accent}}.
const PIXELS: Pixel[] = [
  [11, 0, 2, 1, A, true],
  [11, 1, 2, 1, "#6F8396"],
  [6, 2, 11, 1, "#EAF2F8"],
  [17, 2, 1, 1, "#A9BBCC"],
  [5, 3, 13, 7, "#EAF2F8"],
  [18, 3, 1, 7, "#A9BBCC"],
  [6, 3, 1, 1, "#FFFFFF"],
  [7, 4, 10, 5, "#071421"],
  [8, 5, 2, 2, "#22E6FF", true],
  [14, 5, 2, 2, "#22E6FF", true],
  [8, 5, 1, 1, "#FFFFFF"],
  [14, 5, 1, 1, "#FFFFFF"],
  [8, 7, 1, 1, "#FF6FA8"],
  [15, 7, 1, 1, "#FF6FA8"],
  [10, 7, 1, 1, "#22E6FF"],
  [13, 7, 1, 1, "#22E6FF"],
  [11, 8, 2, 1, "#22E6FF"],
  [10, 10, 4, 1, "#6F8396"],
  [7, 11, 9, 6, "#EAF2F8"],
  [16, 11, 1, 6, "#A9BBCC"],
  [9, 12, 6, 3, "#071421"],
  [10, 13, 1, 1, A],
  [12, 13, 1, 1, "#22E6FF"],
  [13, 13, 1, 1, "#FFC94A"],
  [1, 12, 6, 1, "#6F8396"],
  [17, 12, 6, 1, "#6F8396"],
  [0, 7, 1, 3, A],
  [3, 7, 1, 3, A],
  [0, 10, 4, 1, A],
  [1, 11, 2, 1, A],
  [20, 7, 1, 3, A],
  [23, 7, 1, 3, A],
  [20, 10, 4, 1, A],
  [21, 11, 2, 1, A],
  [8, 17, 3, 1, "#6F8396"],
  [13, 17, 3, 1, "#6F8396"],
  [7, 18, 4, 1, "#A9BBCC"],
  [13, 18, 4, 1, "#A9BBCC"],
];

export function ClawStreetBot({ width = 48, className }: { width?: number; className?: string }) {
  const glow = `cs-glow-${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={width}
      height={(width * 19) / 24}
      viewBox="0 0 24 19"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Claw Street bot: a pixel robot with two claws raised"
      className={className}
    >
      <defs>
        <filter
          id={glow}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
        >
          <feGaussianBlur stdDeviation="0.35" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {PIXELS.map(([x, y, w, h, fill, glows], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={fill}
          {...(glows ? { filter: `url(#${glow})` } : {})}
        />
      ))}
    </svg>
  );
}

/** "CLAW STREET" in Press Start 2P, STREET in the accent, as in the reference. */
export function ClawStreetWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-pixel tracking-[0.06em] text-[#EAF2F8]", className)}>
      CLAW <span style={{ color: BRAND.accent }}>STREET</span>
    </span>
  );
}

export function PoweredByCredence({ className }: { className?: string }) {
  return (
    <span className={cn("font-pixel tracking-[0.18em] text-[#8FA3B6]", className)}>
      POWERED BY CREDENCE
    </span>
  );
}

/** Compact horizontal lockup for the sidebar. */
export function ClawStreetLockup() {
  return (
    <span className="flex items-center gap-3" aria-label={BRAND.display}>
      <ClawStreetBot width={40} />
      <span className="flex flex-col gap-1.5 leading-none">
        <ClawStreetWordmark className="text-[11px]" />
        <PoweredByCredence className="text-[6px]" />
      </span>
    </span>
  );
}

/** The stacked lockup of the reference artboard, scaled for a page hero. */
export function ClawStreetHero() {
  return (
    <div className="flex flex-col items-center gap-5 py-2" aria-label={BRAND.display}>
      <ClawStreetBot width={168} />
      <div className="flex flex-col items-center gap-3">
        <ClawStreetWordmark className="text-xl sm:text-2xl" />
        <PoweredByCredence className="text-[9px]" />
      </div>
    </div>
  );
}

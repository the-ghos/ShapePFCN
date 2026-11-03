import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** Deep night background with slowly breathing warm/cool light pools and film grain. */
export const Background: React.FC<{ warm?: number; cool?: number; drift?: number }> = ({
  warm = 1,
  cool = 1,
  drift = 1,
}) => {
  const f = useCurrentFrame() * drift;
  const wx = 28 + Math.sin(f / 70) * 6;
  const wy = 30 + Math.cos(f / 85) * 5;
  const cx = 74 + Math.cos(f / 90) * 6;
  const cy = 64 + Math.sin(f / 60) * 5;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${wx}% ${wy}%, rgba(120,40,40,${0.55 * warm}) 0%, rgba(60,20,50,${0.35 * warm}) 25%, transparent 55%),
            radial-gradient(circle at ${cx}% ${cy}%, rgba(30,70,120,${0.55 * cool}) 0%, rgba(30,30,80,${0.3 * cool}) 28%, transparent 60%),
            radial-gradient(circle at 50% 45%, #241a3a 0%, #120f22 45%, ${C.bg0} 100%)`,
        }}
      />
      <Grain />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)" }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

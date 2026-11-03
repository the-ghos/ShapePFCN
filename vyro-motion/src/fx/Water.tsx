import React from "react";
import { interpolate, Easing, random } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A glossy teardrop. (cx, cy) is the center of the round bottom. */
export const Drop: React.FC<{ cx: number; cy: number; size: number; stretch?: number; id: string; opacity?: number }> = ({
  cx,
  cy,
  size,
  stretch = 1,
  id,
  opacity = 1,
}) => {
  const r = size / 2;
  const tip = r * 2.4 * stretch;
  const d = `M ${cx} ${cy - tip}
    C ${cx + r * 0.35} ${cy - tip * 0.55}, ${cx + r} ${cy - r * 0.6}, ${cx + r} ${cy}
    A ${r} ${r} 0 1 1 ${cx - r} ${cy}
    C ${cx - r} ${cy - r * 0.6}, ${cx - r * 0.35} ${cy - tip * 0.55}, ${cx} ${cy - tip} Z`;
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-body`} cx="0.38" cy="0.62" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#9fdcff" stopOpacity="0.85" />
          <stop offset="0.65" stopColor="#7B5CFF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0.85" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={size * 0.35} />
        </filter>
      </defs>
      <path d={d} fill="#7fb8ff" opacity={0.55} filter={`url(#${id}-glow)`} />
      <path d={d} fill={`url(#${id}-body)`} />
      <ellipse cx={cx - r * 0.38} cy={cy - r * 0.2} rx={r * 0.18} ry={r * 0.34} fill="#fff" opacity={0.9} transform={`rotate(20 ${cx - r * 0.38} ${cy - r * 0.2})`} />
      <path d={`M ${cx + r * 0.55} ${cy + r * 0.35} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx - r * 0.1} ${cy + r * 0.8}`} stroke="#fff" strokeOpacity={0.5} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Concentric water ripples in perspective, starting at local frame t0. */
export const Ripples: React.FC<{
  frame: number;
  t0: number;
  cx: number;
  cy: number;
  count?: number;
  maxR?: number;
  squash?: number;
  duration?: number;
  gap?: number;
  id: string;
  width?: number;
}> = ({ frame, t0, cx, cy, count = 5, maxR = 900, squash = 0.32, duration = 70, gap = 7, id, width = 4 }) => {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-rg`} x1="0" x2="1">
          <stop offset="0" stopColor="#FFB03A" />
          <stop offset="0.5" stopColor="#FF5A1F" />
          <stop offset="0.75" stopColor="#7B5CFF" />
          <stop offset="1" stopColor="#45C8FF" />
        </linearGradient>
      </defs>
      {new Array(count).fill(0).map((_, i) => {
        const start = t0 + i * gap;
        const p = interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        if (frame < start || p >= 1) return null;
        const rr = p * maxR * (1 - i * 0.08);
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={rr}
            ry={rr * squash}
            fill="none"
            stroke={`url(#${id}-rg)`}
            strokeWidth={width * (1 - p) + 0.6}
            opacity={(1 - p) * (1 - i * 0.12)}
          />
        );
      })}
    </g>
  );
};

/** Radial splash of droplets launched at frame t0 from (cx, cy). */
export const Splash: React.FC<{ frame: number; t0: number; cx: number; cy: number; count?: number; power?: number; id: string }> = ({
  frame,
  t0,
  cx,
  cy,
  count = 26,
  power = 1,
  id,
}) => {
  const t = frame - t0;
  if (t < 0 || t > 50) return null;
  return (
    <g>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${id}-${i}-${k}`);
        const ang = -Math.PI * (0.08 + r("a") * 0.84);
        const v = (9 + r("v") * 16) * power;
        const g = 0.9;
        const x = cx + Math.cos(ang) * v * t * (r("s") > 0.5 ? 1 : 1);
        const y = cy + Math.sin(ang) * v * t * 0.8 + 0.5 * g * t * t;
        const size = 2 + r("z") * 7;
        const life = 1 - t / (30 + r("l") * 20);
        if (life <= 0) return null;
        const col = r("c") > 0.5 ? "#9fdcff" : r("c") > 0.25 ? "#FFB03A" : "#7B5CFF";
        return (
          <g key={i} opacity={life}>
            <circle cx={x} cy={y} r={size} fill={col} />
            <circle cx={x - size * 0.3} cy={y - size * 0.3} r={size * 0.3} fill="#fff" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

/** Upward crown/column of water (Worthington jet). */
export const Crown: React.FC<{ frame: number; t0: number; cx: number; cy: number; scale?: number; id: string }> = ({ frame, t0, cx, cy, scale = 1, id }) => {
  const t = frame - t0;
  if (t < 0 || t > 40) return null;
  const h = Math.sin((t / 40) * Math.PI) * 180 * scale;
  const w = 18 * scale * (1 - t / 60);
  return (
    <g opacity={1 - t / 40}>
      <defs>
        <linearGradient id={`${id}-jet`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7B5CFF" stopOpacity="0.2" />
          <stop offset="1" stopColor="#bfe8ff" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - w} ${cy} Q ${cx - w * 0.4} ${cy - h * 0.6} ${cx} ${cy - h} Q ${cx + w * 0.4} ${cy - h * 0.6} ${cx + w} ${cy} Z`} fill={`url(#${id}-jet)`} />
      <circle cx={cx} cy={cy - h - w * 0.9} r={w * 0.8} fill="#cfefff" />
    </g>
  );
};

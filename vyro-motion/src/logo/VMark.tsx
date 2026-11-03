import React from "react";
import { C } from "../theme";

// Geometry traced from the VYRO MOTION logo (1080px artboard coordinates)
export const LEFT_ARM = "M358 255 L475 255 L562 505 L508 605 Z";
export const RIGHT_ARM = "M638 255 L738 255 L558 592 L530 540 Z";
export const SPEED_LINES = [
  { x1: 328, x2: 402, y: 339, color: C.speed1 },
  { x1: 299, x2: 407, y: 386, color: C.speed2 },
  { x1: 341, x2: 424, y: 433, color: C.speed3 },
];
export const MARK_VIEWBOX = { x: 270, y: 235, w: 490, h: 390 };

export type VMarkProps = {
  /** 0..1 progress for each element. */
  left?: number;
  right?: number;
  lines?: [number, number, number];
  /** 0..1 position of a specular light sweep, <0 or >1 hides it */
  sweep?: number;
  glow?: number;
  id?: string;
  style?: React.CSSProperties;
  width?: number;
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const VMark: React.FC<VMarkProps> = ({
  left = 1,
  right = 1,
  lines = [1, 1, 1],
  sweep = -1,
  glow = 0,
  id = "vm",
  style,
  width = 600,
}) => {
  const { x, y, w, h } = MARK_VIEWBOX;
  const l = clamp(left);
  const r = clamp(right);
  // arms slide along their own diagonal axis
  const leftT = `translate(${(1 - l) * -260} ${(1 - l) * -600})`;
  const rightT = `translate(${(1 - r) * 330} ${(1 - r) * -620})`;
  const sweepX = x - 200 + sweep * (w + 400);
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      width={width}
      height={(width * h) / w}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`${id}-l`} x1="358" y1="255" x2="530" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.orangeLight} />
          <stop offset="0.5" stopColor={C.orange} />
          <stop offset="1" stopColor={C.red} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="738" y1="255" x2="545" y2="590" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="0.55" stopColor={C.violet} />
          <stop offset="1" stopColor={C.violetDeep} />
        </linearGradient>
        <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={LEFT_ARM} transform={leftT} />
          <path d={RIGHT_ARM} transform={rightT} />
        </clipPath>
      </defs>

      {glow > 0 ? (
        <g opacity={glow} filter={`url(#${id}-glow)`}>
          <path d={LEFT_ARM} fill={`url(#${id}-l)`} transform={leftT} />
          <path d={RIGHT_ARM} fill={`url(#${id}-r)`} transform={rightT} />
        </g>
      ) : null}

      {SPEED_LINES.map((s, i) => {
        const p = clamp(lines[i]);
        const len = (s.x2 - s.x1) * p;
        return (
          <line
            key={i}
            x1={s.x2 - len - (1 - p) * 140}
            x2={s.x2 - (1 - p) * 140}
            y1={s.y}
            y2={s.y}
            stroke={s.color}
            strokeWidth={18}
            strokeLinecap="round"
            opacity={p * 0.92}
          />
        );
      })}

      <path d={LEFT_ARM} fill={`url(#${id}-l)`} transform={leftT} opacity={l > 0 ? 1 : 0} />
      <path d={RIGHT_ARM} fill={`url(#${id}-r)`} transform={rightT} opacity={r > 0 ? 0.88 : 0} style={{ mixBlendMode: "screen" }} />

      {sweep > -0.2 && sweep < 1.2 ? (
        <g clipPath={`url(#${id}-clip)`}>
          <rect
            x={sweepX}
            y={y - 100}
            width={160}
            height={h + 200}
            fill={`url(#${id}-sweep)`}
            transform={`skewX(-22) translate(${(y + h / 2) * 0.4} 0)`}
          />
        </g>
      ) : null}
    </svg>
  );
};

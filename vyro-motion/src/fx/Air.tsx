import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

const PALETTE = ["#FFB03A", "#FF5A1F", "#45C8FF", "#7B5CFF", "#ffffff"];

/** Floating dust + flowing air streaks + soft smoke blobs. */
export const Air: React.FC<{ count?: number; speed?: number; opacity?: number; streaks?: number; seed?: string }> = ({
  count = 90,
  speed = 1,
  opacity = 1,
  streaks = 14,
  seed = "air",
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {/* smoke */}
      {new Array(6).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-smoke-${i}-${k}`);
        const x = r("x") * width + Math.sin(f / (60 + r("p") * 60) + i) * 160 * speed;
        const y = r("y") * height + Math.cos(f / (80 + r("q") * 50) + i) * 90 * speed;
        const s = 420 + r("s") * 520;
        const col = i % 2 ? "rgba(90,70,200,0.18)" : "rgba(255,110,60,0.13)";
        return (
          <div
            key={`s${i}`}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              width: s,
              height: s * 0.6,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${col}, transparent 70%)`,
              filter: "blur(40px)",
              rotate: `${f * 0.1 * (i % 2 ? 1 : -1) + r("rot") * 180}deg`,
            }}
          />
        );
      })}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={`${seed}-streak`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* wind streaks */}
        {new Array(streaks).fill(0).map((_, i) => {
          const r = (k: string) => random(`${seed}-st-${i}-${k}`);
          const len = 120 + r("l") * 340;
          const v = (4 + r("v") * 9) * speed;
          const span = width + len * 2;
          const x = ((r("x") * span + f * v) % span) - len;
          const y = r("y") * height + Math.sin((x / width) * Math.PI * 2 + r("ph") * 6) * 40;
          return (
            <rect
              key={`w${i}`}
              x={x}
              y={y}
              width={len}
              height={1.5 + r("h") * 1.5}
              rx={1}
              fill={`url(#${seed}-streak)`}
              opacity={0.12 + r("o") * 0.2}
            />
          );
        })}
        {/* dust particles */}
        {new Array(count).fill(0).map((_, i) => {
          const r = (k: string) => random(`${seed}-p-${i}-${k}`);
          const depth = 0.3 + r("d") * 0.7;
          const vx = (0.4 + r("vx") * 1.4) * speed * depth;
          const x = (r("x") * width + f * vx + Math.sin(f / 40 + i) * 20 * depth) % width;
          const y = (r("y") * height - f * 0.35 * speed * depth + Math.cos(f / 50 + i * 2) * 14 + height * 10) % height;
          const tw = 0.5 + 0.5 * Math.sin(f / (8 + r("t") * 14) + i);
          const size = 1 + depth * 3.2;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill={PALETTE[Math.floor(r("c") * PALETTE.length)]}
              opacity={(0.25 + tw * 0.6) * depth}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

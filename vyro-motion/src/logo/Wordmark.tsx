import React from "react";
import { C, displayFont, labelFont } from "../theme";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** "VYRO" + "MOTION". vyro / motion are 0..1 progress values. */
export const Wordmark: React.FC<{
  vyro?: number;
  motion?: number;
  size?: number;
  color?: string;
  motionColor?: string;
  sweep?: number;
}> = ({ vyro = 1, motion = 1, size = 150, color = C.white, motionColor = C.motion, sweep = -1 }) => {
  const letters = "VYRO".split("");
  const mLetters = "MOTION".split("");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          fontFamily: displayFont,
          fontSize: size,
          lineHeight: 1,
          color,
          letterSpacing: size * 0.02,
          position: "relative",
          transform: "scaleX(1.18)",
        }}
      >
        {letters.map((l, i) => {
          const p = easeOut(vyro * 1.6 - i * 0.2);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                paddingBottom: size * 0.04,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: `0 ${(1 - p) * 110}%`,
                  filter: `blur(${(1 - p) * 12}px)`,
                  opacity: p,
                }}
              >
                {l}
              </span>
            </span>
          );
        })}
        {sweep > -0.1 && sweep < 1.1 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,190,120,0.9) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
              mixBlendMode: "overlay",
              WebkitMaskImage: "linear-gradient(#000,#000)",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: labelFont,
          fontWeight: 600,
          fontSize: size * 0.36,
          color: motionColor,
          marginTop: size * 0.22,
          letterSpacing: size * (0.12 + (1 - easeOut(motion)) * 0.5),
          marginRight: -size * 0.12,
          opacity: clamp01(motion * 1.5),
        }}
      >
        {mLetters.map((l, i) => {
          const p = easeOut(motion * 1.8 - i * 0.12);
          return (
            <span key={i} style={{ display: "inline-block", opacity: p, translate: `0 ${(1 - p) * -30}px` }}>
              {l}
            </span>
          );
        })}
      </div>
    </div>
  );
};

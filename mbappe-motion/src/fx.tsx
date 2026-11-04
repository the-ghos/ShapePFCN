import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";

export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const GOLD =
  "linear-gradient(100deg, #8a5a12 0%, #f7d774 22%, #fff6c9 32%, #e0a93a 46%, #fbe08a 62%, #a8701c 80%, #f2c75c 100%)";
export const DISPLAY = "Anton, Impact, sans-serif";
export const BODY = "Montserrat, Arial, sans-serif";

/* ---------- Gold text with moving shine ---------- */
export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  style?: React.CSSProperties;
  shineSpeed?: number;
}> = ({ children, size, style, shineSpeed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 1.08,
        paddingTop: size * 0.12,
        letterSpacing: size * 0.02,
        textTransform: "uppercase",
        backgroundImage: GOLD,
        backgroundSize: "250% 100%",
        backgroundPosition: `${(frame * 2.2 * shineSpeed) % 250}% 50%`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter:
          "drop-shadow(0 6px 0 rgba(60,35,0,0.85)) drop-shadow(0 0 28px rgba(255,190,60,0.45))",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Glitch / stagger letter reveal ---------- */
export const GlitchWord: React.FC<{
  text: string;
  start: number;
  size: number;
  gold?: boolean;
  stagger?: number;
  color?: string;
}> = ({ text, start, size, gold, stagger = 2, color = "#fff" }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {text.split("").map((ch, i) => {
        const s = start + i * stagger;
        const p = interpolate(frame, [s, s + 8], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        const glitching = frame >= s && frame < s + 6;
        const jx = glitching ? (random(`gx${i}${frame}`) - 0.5) * 30 : 0;
        const jy = glitching ? (random(`gy${i}${frame}`) - 0.5) * 16 : 0;
        const split = glitching ? 10 : 0;
        const common: React.CSSProperties = {
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 1,
          display: "inline-block",
          whiteSpace: "pre",
          opacity: p,
          translate: `${jx}px ${jy + (1 - p) * 60}px`,
          scale: String(interpolate(p, [0, 1], [1.8, 1])),
          filter: `blur(${(1 - p) * 10}px)`,
        };
        if (gold) {
          return (
            <span
              key={i}
              style={{
                ...common,
                backgroundImage: GOLD,
                backgroundSize: "300% 100%",
                backgroundPosition: `${(frame * 3 + i * 20) % 300}% 50%`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: `${common.filter} drop-shadow(0 5px 0 rgba(60,35,0,0.9)) drop-shadow(0 0 24px rgba(255,190,60,0.5))`,
              }}
            >
              {ch}
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{
              ...common,
              color,
              textShadow: `${split}px 0 rgba(255,0,60,0.8), ${-split}px 0 rgba(0,220,255,0.8), 0 6px 30px rgba(0,0,0,0.7)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Slide-up line of text ---------- */
export const RiseText: React.FC<{
  children: React.ReactNode;
  start: number;
  style?: React.CSSProperties;
  dur?: number;
}> = ({ children, start, style, dur = 12 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div style={{ overflow: "hidden", paddingBottom: 12 }}>
      <div
        style={{
          translate: `0px ${(1 - p) * 110}%`,
          opacity: p,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- Media ---------- */
export const Clip: React.FC<{
  src: string;
  trim?: number; // seconds into clip
  rate?: number;
  zoom?: [number, number];
  style?: React.CSSProperties;
}> = ({ src, trim = 0, rate = 1, zoom = [1.08, 1], style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Video
        src={staticFile(`clips/${src}.mp4`)}
        trimBefore={f(trim)}
        playbackRate={rate}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: String(
            interpolate(frame, [0, durationInFrames], zoom, clamp),
          ),
          ...style,
        }}
      />
    </AbsoluteFill>
  );
};

export const Photo: React.FC<{
  src: string;
  zoom?: [number, number];
  pan?: [number, number];
  originY?: string;
  style?: React.CSSProperties;
  dur?: number;
}> = ({ src, zoom = [1.05, 1.18], pan = [0, 0], originY = "40%", style, dur }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = dur ?? durationInFrames;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(`img/${src}.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: `50% ${originY}`,
          scale: String(interpolate(frame, [0, d], zoom, clamp)),
          translate: `${interpolate(frame, [0, d], pan, clamp)}px 0px`,
          ...style,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Zoom-through entry / exit wrapper ---------- */
export const ZoomCut: React.FC<{
  children: React.ReactNode;
  inFrames?: number;
  outFrames?: number;
  inScale?: number;
  outScale?: number;
}> = ({ children, inFrames = 7, outFrames = 5, inScale = 1.35, outScale = 1.25 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const pin = interpolate(frame, [0, inFrames], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pout = interpolate(frame, [d - outFrames, d], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const scale = interpolate(pin, [0, 1], [inScale, 1]) * interpolate(pout, [0, 1], [1, outScale]);
  const blur = (1 - pin) * 14 + pout * 12;
  return (
    <AbsoluteFill style={{ scale: String(scale), filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Gold particles ---------- */
export const Particles: React.FC<{
  count?: number;
  converge?: [number, number];
  seed?: string;
  rise?: boolean;
  opacity?: number;
}> = ({ count = 70, converge, seed = "p", rise = true, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * width;
        const y0 = random(`${seed}y${i}`) * height;
        const sz = 3 + random(`${seed}s${i}`) * 9;
        const sp = 0.6 + random(`${seed}v${i}`) * 2.2;
        let x = x0 + Math.sin(frame / 20 + i) * 18;
        let y = rise ? (y0 - frame * sp * 3 + height * 4) % (height + 40) : y0;
        if (converge) {
          const p = interpolate(frame, converge, [0, 1], {
            ...clamp,
            easing: Easing.in(Easing.cubic),
          });
          x = x * (1 - p) + (width / 2) * p;
          y = y * (1 - p) + (height / 2) * p;
        }
        const tw = 0.5 + 0.5 * Math.sin(frame / 6 + i * 1.7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: "radial-gradient(circle, #fff7d1 0%, #f5c84c 45%, rgba(245,200,76,0) 72%)",
              opacity: 0.35 + tw * 0.65,
              boxShadow: `0 0 ${sz * 2}px rgba(255,200,80,0.9)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Rotating gold rays ---------- */
export const Rays: React.FC<{ opacity?: number }> = ({ opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        background: `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 42%, rgba(255,200,90,0.32) 0deg 6deg, rgba(0,0,0,0) 6deg 18deg)`,
        maskImage: "radial-gradient(circle at 50% 42%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 42%, black 0%, transparent 70%)",
      }}
    />
  );
};

/* ---------- Confetti ---------- */
export const Confetti: React.FC<{ count?: number; seed?: string }> = ({
  count = 60,
  seed = "c",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * width + Math.sin(frame / 9 + i) * 40;
        const sp = 7 + random(`${seed}v${i}`) * 12;
        const y = -80 + ((random(`${seed}y${i}`) * height * 1.5 + frame * sp) % (height + 160));
        const rot = frame * (4 + random(`${seed}r${i}`) * 10) + i * 40;
        const w = 14 + random(`${seed}w${i}`) * 16;
        const silver = random(`${seed}c${i}`) > 0.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: w * 0.45,
              background: silver
                ? "linear-gradient(90deg,#9aa3ad,#ffffff,#8d96a0)"
                : "linear-gradient(90deg,#a9741d,#ffe9a3,#c98f2a)",
              rotate: `${rot}deg`,
              scale: `1 ${Math.abs(Math.cos(rot / 30))}`,
              boxShadow: "0 0 8px rgba(255,210,120,0.6)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Shockwave ring ---------- */
export const Shockwave: React.FC<{ at: number; color?: string; y?: string }> = ({
  at,
  color = "255,215,120",
  y = "50%",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (frame < at || frame > at + 20) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: 2400 * p,
          height: 2400 * p,
          marginLeft: -1200 * p,
          marginTop: -1200 * p,
          borderRadius: "50%",
          border: `${30 * (1 - p) + 2}px solid rgba(${color},${1 - p})`,
          boxShadow: `0 0 80px rgba(${color},${(1 - p) * 0.8}), inset 0 0 80px rgba(${color},${(1 - p) * 0.6})`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Speed lines ---------- */
export const SpeedLines: React.FC<{ opacity?: number }> = ({ opacity = 0.6 }) => {
  const frame = useCurrentFrame();
  const lines = new Array(46).fill(0).map((_, i) => {
    const a = random(`sl${i}${Math.floor(frame / 2)}`) * 360;
    const len = 30 + random(`sll${i}${Math.floor(frame / 2)}`) * 25;
    return (
      <line
        key={i}
        x1={540 + Math.cos((a * Math.PI) / 180) * 1300}
        y1={960 + Math.sin((a * Math.PI) / 180) * 1300}
        x2={540 + Math.cos((a * Math.PI) / 180) * (1300 - len * 18)}
        y2={960 + Math.sin((a * Math.PI) / 180) * (1300 - len * 18)}
        stroke="white"
        strokeWidth={2 + random(`slw${i}`) * 5}
        strokeLinecap="round"
      />
    );
  });
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen" }}>
      <svg width={1080} height={1920}>
        {lines}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Light leak (CSS) ---------- */
export const LightLeak: React.FC<{ at: number; dur?: number; hue?: number }> = ({
  at,
  dur = 20,
  hue = 0,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  const o = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: o,
        filter: `hue-rotate(${hue}deg)`,
        background: `radial-gradient(ellipse 70% 50% at ${-20 + p * 140}% ${30 + p * 30}%, rgba(255,170,60,0.95), rgba(255,90,20,0.5) 40%, transparent 70%), radial-gradient(ellipse 40% 60% at ${110 - p * 90}% 70%, rgba(255,230,160,0.8), transparent 65%)`,
      }}
    />
  );
};

/* ---------- Vignette + grain ---------- */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 48%, transparent 55%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <svg width={1080} height={1920}>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              seed={frame % 12}
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

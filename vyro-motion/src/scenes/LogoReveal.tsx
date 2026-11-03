import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { OrbitRings } from "../fx/Rings";
import { Ripples, Splash } from "../fx/Water";
import { VMark } from "../logo/VMark";
import { Wordmark } from "../logo/Wordmark";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const snap = Easing.bezier(0.2, 0.9, 0.1, 1);
export const MEET = 34;

export const LogoReveal: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  const left = interpolate(f, [8, MEET], [0, 1], { ...cl, easing: snap });
  const right = interpolate(f, [14, MEET], [0, 1], { ...cl, easing: snap });
  const lines: [number, number, number] = [
    interpolate(f, [MEET + 4, MEET + 18], [0, 1], { ...cl, easing: snap }),
    interpolate(f, [MEET + 8, MEET + 22], [0, 1], { ...cl, easing: snap }),
    interpolate(f, [MEET + 12, MEET + 26], [0, 1], { ...cl, easing: snap }),
  ];
  const sweep = interpolate(f, [70, 100], [-0.2, 1.2], cl);
  const glow = interpolate(f, [MEET, MEET + 4, MEET + 40, 200], [0, 1, 0.45, 0.6], cl) + Math.sin(f / 9) * 0.06;

  // layout move: mark goes up to leave space for the wordmark
  const settle = interpolate(f, [92, 125], [0, 1], { ...cl, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const markY = interpolate(settle, [0, 1], [0, -150]);
  const markW = interpolate(settle, [0, 1], [760, 560]);
  const vyro = interpolate(f, [108, 140], [0, 1], cl);
  const motion = interpolate(f, [130, 165], [0, 1], cl);
  const textSweep = interpolate(f, [168, 196], [-0.1, 1.1], cl);

  const camScale = interpolate(f, [0, 30, 210], [1.25, 1.06, 1.0], { ...cl, easing: Easing.out(Easing.cubic) });
  const camRot = interpolate(f, [0, 40], [-4, 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const shake = f >= MEET && f < MEET + 10 ? Math.sin(f * 2.7) * (MEET + 10 - f) * 1.4 : 0;
  const shock = interpolate(f, [MEET, MEET + 26], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill>
      <Background warm={1} cool={1} />
      <Air count={80} speed={0.8} seed="reveal" streaks={10} />
      <AbsoluteFill style={{ scale: camScale, rotate: `${camRot}deg`, translate: `${shake}px ${-shake * 0.5}px` }}>
        <svg width={width} height={height} style={{ position: "absolute" }}>
          <defs>
            <radialGradient id="core">
              <stop offset="0" stopColor="#ffe3c4" stopOpacity="0.9" />
              <stop offset="0.4" stopColor="#FF5A1F" stopOpacity="0.25" />
              <stop offset="1" stopColor="#7B5CFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <OrbitRings
            frame={f}
            cx={cx}
            cy={cy + markY * 0.9}
            base={250 - settle * 30}
            progress={interpolate(f, [0, 70], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) })}
            opacity={interpolate(settle, [0, 1], [1, 0.55])}
          />
          {/* opening ripple carried from the intro */}
          <Ripples frame={f} t0={0} cx={cx} cy={cy} count={4} maxR={1300} squash={1} duration={50} gap={5} id="rv0" width={3} />
          {/* shockwave when the arms meet */}
          <circle cx={cx} cy={cy + 40} r={shock * 900} fill="none" stroke="#fff" strokeWidth={(1 - shock) * 14} opacity={(1 - shock) * 0.8} />
          <circle cx={cx} cy={cy + 40} r={shock * 620} fill="none" stroke="#FFB03A" strokeWidth={(1 - shock) * 6} opacity={(1 - shock) * 0.7} />
          <circle cx={cx} cy={cy + 60} r={260} fill="url(#core)" opacity={interpolate(f, [MEET, MEET + 3, MEET + 30], [0, 1, 0.15], cl)} />
          <Splash frame={f} t0={MEET} cx={cx} cy={cy + 160} count={30} power={1.2} id="rvsp" />
          {/* wind streaks shooting left when the speed lines fire */}
          {new Array(16).fill(0).map((_, i) => {
            const r = (k: string) => random(`rvs-${i}-${k}`);
            const t = f - (MEET + 6 + r("d") * 14);
            if (t < 0 || t > 30) return null;
            const y = cy - 160 + r("y") * 240;
            const x = cx - 150 - t * (30 + r("v") * 30);
            const len = 80 + r("l") * 220;
            return <rect key={i} x={x} y={y} width={len} height={2 + r("h") * 2} rx={2} fill={["#F2B33D", "#D9512A", "#B0174A", "#fff"][i % 4]} opacity={(1 - t / 30) * 0.7} />;
          })}
        </svg>

        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ translate: `0 ${markY}px` }}>
            <VMark left={left} right={right} lines={lines} sweep={sweep} glow={glow} width={markW} id="reveal" />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0 250px" }}>
          <Wordmark vyro={vyro} motion={motion} size={150} sweep={textSweep} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

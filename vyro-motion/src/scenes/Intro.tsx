import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { Crown, Drop, Ripples, Splash } from "../fx/Water";
import { C, labelFont } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const INTRO_IMPACT = 46;

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const surface = height * 0.6;

  // falling drop
  const fall = interpolate(f, [8, INTRO_IMPACT], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const dropY = interpolate(fall, [0, 1], [-120, surface]);
  const stretch = 1 + fall * 0.9;

  // second smaller drop
  const t2 = 74;
  const fall2 = interpolate(f, [52, t2], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const x2 = cx - 260;
  const y2 = surface + 60;

  const flash = interpolate(f, [INTRO_IMPACT, INTRO_IMPACT + 3, INTRO_IMPACT + 22], [0, 1, 0], cl);
  const camScale = interpolate(f, [0, 90, 110], [1.12, 1.0, 2.6], {
    ...cl,
    easing: Easing.bezier(0.6, 0, 0.4, 1),
  });
  const shake = f > INTRO_IMPACT && f < INTRO_IMPACT + 12 ? Math.sin(f * 3.1) * (INTRO_IMPACT + 12 - f) * 0.9 : 0;
  const fadeIn = interpolate(f, [0, 14], [0, 1], cl);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Background warm={0.7} cool={1} />
      <AbsoluteFill style={{ scale: camScale, translate: `${shake}px ${shake * 0.6}px`, transformOrigin: `50% ${(surface / height) * 100}%` }}>
        <Air count={110} speed={1.2} seed="intro" />
        <svg width={width} height={height} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="horizon" x1="0" x2="1">
              <stop offset="0" stopColor="#45C8FF" stopOpacity="0" />
              <stop offset="0.5" stopColor="#bcdcff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#FF5A1F" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="flash">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.3" stopColor="#ffd2a8" stopOpacity="0.6" />
              <stop offset="1" stopColor="#7B5CFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#45C8FF" stopOpacity="0" />
              <stop offset="1" stopColor="#bfe6ff" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* water surface sheen */}
          <ellipse cx={cx} cy={surface} rx={width * 0.55} ry={3} fill="url(#horizon)" opacity={0.6 + flash * 0.4} />
          <ellipse cx={cx} cy={surface + 2} rx={width * 0.4} ry={60} fill="url(#flash)" opacity={0.08 + flash * 0.5} />

          {/* drop + trail */}
          {f < INTRO_IMPACT ? (
            <>
              <rect x={cx - 2} y={dropY - 260 * fall} width={4} height={260 * fall} fill="url(#trail)" rx={2} />
              <Drop cx={cx} cy={dropY} size={44} stretch={stretch} id="d1" />
            </>
          ) : null}
          {/* reflection of drop */}
          {f < INTRO_IMPACT ? (
            <g opacity={fall * 0.25} transform={`translate(0 ${surface * 2}) scale(1 -1)`}>
              <Drop cx={cx} cy={dropY} size={44} stretch={stretch} id="d1r" />
            </g>
          ) : null}

          <Ripples frame={f} t0={INTRO_IMPACT} cx={cx} cy={surface} count={7} maxR={1100} duration={80} gap={6} id="r1" width={5} />
          <Crown frame={f} t0={INTRO_IMPACT + 2} cx={cx} cy={surface} id="cr1" scale={1.1} />
          <Splash frame={f} t0={INTRO_IMPACT} cx={cx} cy={surface} count={34} power={0.9} id="sp1" />

          {f < t2 && f >= 52 ? <Drop cx={x2} cy={interpolate(fall2, [0, 1], [-80, y2])} size={24} stretch={1 + fall2 * 0.8} id="d2" /> : null}
          <Ripples frame={f} t0={t2} cx={x2} cy={y2} count={4} maxR={500} duration={60} gap={6} id="r2" width={3} />
          <Splash frame={f} t0={t2} cx={x2} cy={y2} count={14} power={0.5} id="sp2" />

          {/* impact flash */}
          <circle cx={cx} cy={surface} r={260 + flash * 200} fill="url(#flash)" opacity={flash} />
        </svg>
      </AbsoluteFill>

      {/* opening caption */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90 }}>
        <div
          style={{
            fontFamily: labelFont,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: 18,
            color: C.white,
            opacity: interpolate(f, [12, 30, 70, 88], [0, 0.6, 0.6, 0], cl),
            translate: `0 ${interpolate(f, [12, 30], [12, 0], cl)}px`,
          }}
        >
          EVERYTHING STARTS WITH A DROP
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

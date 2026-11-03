import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { OrbitRings } from "../fx/Rings";
import { Drop, Ripples, Splash } from "../fx/Water";
import { VMark } from "../logo/VMark";
import { Wordmark } from "../logo/Wordmark";
import { C, labelFont } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const HIT = 20;

export const OUTRO_DURATION = 150;

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2 - 40;
  const fall = interpolate(f, [0, HIT], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const appear = interpolate(f, [HIT, HIT + 26], [0, 1], { ...cl, easing: out });
  const flash = interpolate(f, [HIT, HIT + 2, HIT + 20], [0, 1, 0], cl);
  const word = interpolate(f, [HIT + 10, HIT + 40], [0, 1], cl);
  const motion = interpolate(f, [HIT + 26, HIT + 56], [0, 1], cl);
  const tag = interpolate(f, [80, 100], [0, 1], { ...cl, easing: out });
  const sweep = interpolate(f, [62, 92], [-0.2, 1.2], cl);
  const fadeOut = interpolate(f, [OUTRO_DURATION - 22, OUTRO_DURATION - 2], [1, 0], cl);
  const cam = interpolate(f, [HIT, OUTRO_DURATION], [1.08, 0.97], { ...cl, easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Background />
        <Air count={70} speed={0.6} seed="outro" />
        <AbsoluteFill style={{ scale: cam }}>
          <svg width={width} height={height} style={{ position: "absolute" }}>
            <defs>
              <radialGradient id="ofl">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.4" stopColor="#ffcfa0" stopOpacity="0.5" />
                <stop offset="1" stopColor="#7B5CFF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <OrbitRings frame={f} cx={cx} cy={cy - 120} base={230} progress={appear} opacity={0.5} />
            {f < HIT ? <Drop cx={cx} cy={interpolate(fall, [0, 1], [-100, cy - 120])} size={40} stretch={1 + fall} id="od" /> : null}
            <Ripples frame={f} t0={HIT} cx={cx} cy={cy - 120} count={6} maxR={1200} squash={1} duration={60} gap={6} id="or" width={4} />
            <Splash frame={f} t0={HIT} cx={cx} cy={cy - 120} count={30} power={1} id="osp" />
            <circle cx={cx} cy={cy - 120} r={400} fill="url(#ofl)" opacity={flash} />
          </svg>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                translate: "0 -190px",
                scale: interpolate(appear, [0, 1], [0.6, 1]),
                opacity: appear,
                filter: `blur(${(1 - appear) * 16}px)`,
              }}
            >
              <VMark width={520} glow={0.5 + Math.sin(f / 10) * 0.1} sweep={sweep} id="outro" />
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0 200px" }}>
            <Wordmark vyro={word} motion={motion} size={140} />
            <div
              style={{
                marginTop: 46,
                fontFamily: labelFont,
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: interpolate(tag, [0, 1], [24, 9]),
                color: "rgba(255,255,255,0.7)",
                opacity: tag,
              }}
            >
              LE MOUVEMENT, PARTOUT.
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.25, mixBlendMode: "overlay" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 }}>
        <div style={{ height: 3, width: 300 * tag * fadeOut, background: `linear-gradient(90deg, ${C.orange}, ${C.violet}, ${C.blue})`, borderRadius: 2 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

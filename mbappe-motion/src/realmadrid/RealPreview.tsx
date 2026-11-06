import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";

/* ============================================================
   REAL MADRID · L'HISTOIRE CONTINUE — preview façon TV (9:16)
   Pas de voix off. Musique trap épique 70 BPM (1 temps = 0.857 s),
   drop à 30.86 s, cassure 43-44.4 s, fin 58.27 s.
   ============================================================ */

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-300-normal.woff2"), weight: "300" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const BEAT = 60 / 70;
const T = (n: number) => n * BEAT; // seconds
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const RM_TOTAL = s(56.6);

const DISPLAY = "Anton, Impact, sans-serif";
const SANS = "Montserrat, Arial, sans-serif";
const NAVY = "#0b1f4b";
const GOLD = "#febe10";
const WHITE = "#ffffff";

/* ---------------- media ---------------- */
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; pos?: string; style?: React.CSSProperties }> = ({
  src, trim = 0, rate = 1, zoom = [1.04, 1.0], pos = "50% 50%", style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Video src={staticFile(`rm/c/${src}.mp4`)} trimBefore={s(trim)} playbackRate={rate} muted objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: pos, scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)), transformOrigin: pos, ...style }} />
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ n: number | string; zoom?: [number, number]; pos?: string; style?: React.CSSProperties; blurFill?: boolean }> = ({
  n, zoom = [1.03, 1.14], pos = "50% 35%", style, blurFill = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const src = staticFile(`rm/img/${n}.jpg`);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {blurFill && <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.45)", scale: "1.3" }} />}
      <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transformOrigin: pos, scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)), ...style }} />
    </AbsoluteFill>
  );
};

/* ---------------- broadcast transitions ---------------- */
type Tr = "none" | "swipeL" | "swipeR" | "push" | "punch" | "iris" | "fade";
const Shot: React.FC<{ children: React.ReactNode; enter?: Tr; grade?: "pop" | "night" | "mono" }> = ({ children, enter = "none", grade = "pop" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { ...CL, easing: OUT });
  let clip = "none";
  let tx = 0, sc = 1, op = 1;
  if (enter === "swipeL") clip = `polygon(${(1 - p) * 120}% 0, 120% 0, 120% 100%, ${(1 - p) * 120 - 20}% 100%)`;
  if (enter === "swipeR") clip = `polygon(-20% 0, ${p * 120}% 0, ${p * 120 - 20}% 100%, -20% 100%)`;
  if (enter === "push") tx = (1 - p) * 1080;
  if (enter === "punch") sc = interpolate(p, [0, 1], [1.25, 1]);
  if (enter === "iris") clip = `circle(${p * 120}% at 50% 50%)`;
  if (enter === "fade") op = p;
  const filter = grade === "night" ? "saturate(1.1) contrast(1.12) brightness(0.95) hue-rotate(-8deg)" : grade === "mono" ? "grayscale(1) contrast(1.2) brightness(0.55)" : "saturate(1.12) contrast(1.08)";
  return (
    <AbsoluteFill style={{ clipPath: clip, translate: `${tx}px 0px`, scale: String(sc), opacity: op, filter }}>
      {children}
      {grade === "night" && <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "linear-gradient(180deg, rgba(30,91,216,0.55), transparent 55%, rgba(30,91,216,0.4))" }} />}
    </AbsoluteFill>
  );
};

/* white/gold diagonal bars that sweep across at a cut */
const BarWipe: React.FC<{ color?: string }> = ({ color = WHITE }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => {
        const p = interpolate(frame, [i * 2, i * 2 + 12], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
        const x = interpolate(p, [0, 1], [-1600, 1600]);
        return (
          <div key={i} style={{ position: "absolute", top: -300, left: x + i * 140, width: i === 1 ? 260 : 120, height: 2600, rotate: "18deg", background: i === 1 ? GOLD : color, opacity: 0.95 }} />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- graphics ---------------- */
const Rise: React.FC<{ children: React.ReactNode; at?: number; dur?: number; from?: "down" | "left" | "right"; style?: React.CSSProperties }> = ({ children, at = 0, dur = 12, from = "down", style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  const tr = from === "down" ? `0px ${(1 - p) * 105}%` : from === "left" ? `${(p - 1) * 110}% 0px` : `${(1 - p) * 110}% 0px`;
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ translate: tr, opacity: Math.min(1, p * 1.4), ...style }}>{children}</div>
    </div>
  );
};

/* top broadcast bug */
const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [s(0.6), s(1.2)], [0, 1], CL) * interpolate(frame, [s(55.6), s(56.0)], [1, 0], CL);
  return (
    <div style={{ position: "absolute", top: 70, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "stretch", boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ background: GOLD, color: NAVY, fontFamily: DISPLAY, fontSize: 30, padding: "4px 12px" }}>RM</div>
        <div style={{ background: NAVY, color: WHITE, fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: "0.2em", padding: "8px 16px" }}>PREVIEW</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.92)", color: NAVY, fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: "0.18em", padding: "8px 14px" }}>L'HISTOIRE CONTINUE</div>
    </div>
  );
};

/* chapter card: white slab slides in, number + title */
const Chapter: React.FC<{ n: string; title: string; sub: string; dark?: boolean }> = ({ n, title, sub, dark }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const p = interpolate(frame, [0, 9], [0, 1], { ...CL, easing: OUT });
  const q = interpolate(frame, [d - 6, d], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const bg = dark ? NAVY : WHITE;
  const fg = dark ? WHITE : NAVY;
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <AbsoluteFill style={{ background: bg, clipPath: `polygon(0 ${50 - 50 * p}%, 100% ${50 - 50 * p - 6 * p}%, 100% ${50 + 50 * p - 6 * p}%, 0 ${50 + 50 * p}%)`, translate: `${q * -1100}px 0px` }} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px", translate: `${q * -1100}px 0px` }}>
        <Rise at={4}><div style={{ fontFamily: DISPLAY, fontSize: 220, color: GOLD, lineHeight: 0.9 }}>{n}</div></Rise>
        <div style={{ width: interpolate(frame, [6, 16], [0, 300], { ...CL, easing: OUT }), height: 8, background: fg, margin: "18px 0" }} />
        <Rise at={8}><div style={{ fontFamily: DISPLAY, fontSize: 104, color: fg, lineHeight: 1.02 }}>{title}</div></Rise>
        <Rise at={12}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.25em", color: fg, opacity: 0.75, marginTop: 10 }}>{sub}</div></Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* lower third */
const Lower: React.FC<{ kicker: string; title: string; at?: number; color?: string }> = ({ kicker, title, at = 4, color = GOLD }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], { ...CL, easing: OUT });
  return (
    <div style={{ position: "absolute", left: 48, bottom: 330, display: "flex", flexDirection: "column", alignItems: "flex-start", translate: `${(1 - p) * -800}px 0px` }}>
      <div style={{ background: color, color: NAVY, fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: "0.2em", padding: "6px 14px" }}>{kicker}</div>
      <div style={{ background: NAVY, color: WHITE, fontFamily: DISPLAY, fontSize: 64, padding: "4px 20px 8px", borderLeft: `8px solid ${color}` }}>{title}</div>
    </div>
  );
};

const ReplayTag: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 150, right: 48, display: "flex", alignItems: "center", gap: 10, background: "rgba(11,31,75,0.85)", padding: "8px 16px", border: `2px solid ${GOLD}` }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", border: `4px solid ${GOLD}`, borderTopColor: "transparent", rotate: `${frame * 12}deg` }} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: "0.25em", color: WHITE }}>REPLAY</div>
    </div>
  );
};

/* telestrator: animated circle + arrow */
const Circle: React.FC<{ x: number; y: number; r?: number; at?: number; label?: string }> = ({ x, y, r = 110, at = 0, label }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...CL, easing: OUT });
  const c = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="none" stroke={GOLD} strokeWidth={9} strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ filter: "drop-shadow(0 0 10px rgba(254,190,16,0.9))" }} />
        <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.22} fill="rgba(254,190,16,0.18)" opacity={p} />
      </svg>
      {label && (
        <div style={{ position: "absolute", left: x - 90, top: y - r * 0.42 - 470, width: 180, display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
          <div style={{ background: GOLD, color: NAVY, fontFamily: DISPLAY, fontSize: 52, padding: "2px 18px" }}>{label}</div>
          <div style={{ width: 4, height: 360 * p, background: GOLD }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Arrow: React.FC<{ d: string; at?: number; dur?: number }> = ({ d, at = 0, dur = 14 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={WHITE} />
          </marker>
        </defs>
        <path d={d} fill="none" stroke={WHITE} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} markerEnd={p > 0.95 ? "url(#ah)" : undefined} style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.8))" }} />
      </svg>
    </AbsoluteFill>
  );
};

/* moving tracker circle following a player through key points [frame, x, y] */
const Tracker: React.FC<{ pts: [number, number, number][]; label?: string }> = ({ pts, label }) => {
  const frame = useCurrentFrame();
  const fr = pts.map((p) => p[0]);
  const x = interpolate(frame, fr, pts.map((p) => p[1]), CL);
  const y = interpolate(frame, fr, pts.map((p) => p[2]), CL);
  const vis = interpolate(frame, [pts[0][0], pts[0][0] + 6, pts[pts.length - 1][0] - 4, pts[pts.length - 1][0]], [0, 1, 1, 0], CL);
  const trail = pts.filter((p) => p[0] <= frame).map((p) => `${p[1]},${p[2]}`);
  return (
    <AbsoluteFill style={{ opacity: vis, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {trail.length > 0 && <polyline points={[...trail, `${x},${y}`].join(" ")} fill="none" stroke={GOLD} strokeWidth={8} strokeDasharray="22 14" strokeLinecap="round" />}
        <ellipse cx={x} cy={y} rx={95} ry={38} fill="none" stroke={GOLD} strokeWidth={8} style={{ filter: "drop-shadow(0 0 10px rgba(254,190,16,0.9))" }} />
      </svg>
      {label && <div style={{ position: "absolute", left: x - 60, top: y - 330, background: GOLD, color: NAVY, fontFamily: DISPLAY, fontSize: 46, padding: "0 16px" }}>{label}</div>}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ at: number[]; strength?: number }> = ({ at, strength = 0.85 }) => {
  const frame = useCurrentFrame();
  let w = 0;
  for (const a of at) if (frame >= a) w = Math.max(w, strength * Math.exp(-(frame - a) / 2.6));
  return <AbsoluteFill style={{ background: WHITE, opacity: w, pointerEvents: "none" }} />;
};

/* ================= SCENES ================= */

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Sequence durationInFrames={s(T(4))} layout="none">
        <Shot enter="fade"><Photo n={8} zoom={[1.25, 1.05]} pos="50% 45%" blurFill={false} /></Shot>
      </Sequence>
      <Sequence from={s(T(4))} layout="none">
        <Shot enter="iris"><Photo n={1} zoom={[1.0, 1.15]} pos="45% 55%" blurFill={false} /></Shot>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(11,31,75,0.9) 85%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 64px 300px" }}>
        <Rise at={10}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.35em", color: GOLD }}>DEPUIS 1902</div></Rise>
        <Rise at={14}><div style={{ fontFamily: DISPLAY, fontSize: 170, color: WHITE, lineHeight: 0.95 }}>REAL</div></Rise>
        <Rise at={18}><div style={{ fontFamily: DISPLAY, fontSize: 170, color: WHITE, lineHeight: 0.95 }}>MADRID</div></Rise>
        <div style={{ width: interpolate(frame, [26, 44], [0, 520], { ...CL, easing: OUT }), height: 10, background: GOLD, margin: "14px 0" }} />
        <Rise at={30}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, letterSpacing: "0.2em", color: WHITE }}>L'HISTOIRE CONTINUE</div></Rise>
      </AbsoluteFill>
    </>
  );
};

/* history timeline: big year + caption, over a dark stadium */
const YEARS: { y: string; t: string; sub: string }[] = [
  { y: "1902", t: "NAISSANCE D'UN GÉANT", sub: "FONDATION DU CLUB À MADRID" },
  { y: "1956–60", t: "5 COUPES D'EUROPE", sub: "CINQ DE SUITE · UN RECORD" },
  { y: "2014", t: "LA DÉCIMA", sub: "LA 10e · LISBONNE" },
  { y: "2016·17·18", t: "LE TRIPLÉ", sub: "TROIS LIGUES DES CHAMPIONS DE SUITE" },
];
const History: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = s(T(2));
  const idx = Math.min(YEARS.length - 1, Math.floor(frame / seg));
  const local = frame - idx * seg;
  const it = YEARS[idx];
  const p = interpolate(local, [0, 9], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill>
      <Shot grade="mono"><Clip src="r7" trim={12} rate={0.5} zoom={[1.3, 1.4]} /></Shot>
      {/* timeline rail */}
      <div style={{ position: "absolute", left: 80, top: 520, width: 6, height: 880, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: 80, top: 520, width: 6, height: interpolate(frame, [0, s(T(8))], [0, 880], CL), background: GOLD, boxShadow: `0 0 14px ${GOLD}` }} />
      {YEARS.map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 68, top: 520 + i * 290, width: 30, height: 30, borderRadius: "50%", background: i <= idx ? GOLD : "#555", border: `4px solid ${NAVY}` }} />
      ))}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140, paddingRight: 50 }}>
        <div style={{ opacity: p, translate: `${(1 - p) * 120}px 0px` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: it.y.length > 6 ? 150 : 230, color: GOLD, lineHeight: 0.95, textShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>{it.y}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 88, color: WHITE, lineHeight: 1.05 }}>{it.t}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: "0.18em", color: WHITE, opacity: 0.85, marginTop: 8 }}>{it.sub}</div>
        </div>
      </AbsoluteFill>
      <Flash at={YEARS.map((_, i) => i * seg)} strength={0.5} />
    </AbsoluteFill>
  );
};

/* 14 → 15 counter over the 2024 winners photo */
const Fifteen: React.FC = () => {
  const frame = useCurrentFrame();
  const n = frame < s(T(1.6)) ? 14 : 15;
  const pop = frame >= s(T(1.6)) ? interpolate(frame, [s(T(1.6)), s(T(1.6)) + 8], [1.5, 1], { ...CL, easing: Easing.out(Easing.back(2)) }) : 1;
  return (
    <>
      <Photo n={6} zoom={[1.15, 1.3]} pos="50% 40%" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,31,75,0.75), transparent 35%, transparent 55%, rgba(11,31,75,0.92))" }} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.3em", color: GOLD }}>{n === 14 ? "2022 · PARIS" : "2024 · LONDRES"}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 300, color: WHITE, lineHeight: 0.9, scale: String(pop) }}>{n}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 70, color: GOLD }}>{n === 14 ? "e" : "e"}</div>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.2em", color: WHITE }}>LIGUE DES CHAMPIONS</div>
        <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
          {new Array(15).fill(0).map((_, i) => (
            <div key={i} style={{ width: 34, height: 46, borderRadius: "6px 6px 14px 14px", background: i < n ? GOLD : "rgba(255,255,255,0.2)", boxShadow: i < n ? `0 0 10px ${GOLD}` : "none", scale: i === 14 && n === 15 ? String(pop) : "1" }} />
          ))}
        </div>
      </AbsoluteFill>
      <Flash at={[s(T(1.6))]} />
    </>
  );
};

/* r1 goal: play → freeze with telestrator → slow replay → celebration */
const GoalN5: React.FC = () => {
  const a = s(T(1.8)), b = s(T(3.4)), c = s(T(6.4));
  return (
    <>
      <Sequence durationInFrames={a} layout="none"><Shot><Clip src="r1" rate={1.0} zoom={[1.0, 1.05]} /></Shot></Sequence>
      <Sequence from={a} durationInFrames={b - a} layout="none">
        <AbsoluteFill>
          <Img src={staticFile("rm/img/fz_r1.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.6) brightness(0.8)" }} />
          <Circle x={290} y={1130} r={120} at={2} label="N°5" />
          <Arrow d="M 330 1080 Q 520 820 560 560" at={10} dur={12} />
          <Flash at={[0]} strength={0.6} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={b} durationInFrames={c - b} layout="none">
        <Shot enter="punch"><Clip src="r1" trim={1.55} rate={0.8} zoom={[1.12, 1.25]} pos="40% 50%" /></Shot>
        <ReplayTag />
      </Sequence>
      <Sequence from={c} layout="none">
        <Shot enter="swipeL"><Clip src="r1" trim={4.3} rate={0.9} zoom={[1.05, 1.15]} pos="50% 30%" /></Shot>
      </Sequence>
      <Lower kicker="AU BERNABÉU" title="BUT · N°5" at={s(T(6.4)) + 4} />
    </>
  );
};

/* Bernabéu montage r7 + split with r3 */
const Bernabeu: React.FC = () => {
  const cuts: { src: string; trim: number; rate: number; len: number; enter: Tr }[] = [
    { src: "r7", trim: 0.3, rate: 1.2, len: 2, enter: "swipeR" },
    { src: "r7", trim: 3.0, rate: 1.0, len: 1.5, enter: "punch" },
    { src: "r7", trim: 6.0, rate: 1.0, len: 1.5, enter: "push" },
    { src: "r7", trim: 20.6, rate: 1.0, len: 1.5, enter: "swipeL" },
  ];
  let acc = 0;
  return (
    <>
      {cuts.map((cu, i) => {
        const from = s(T(acc));
        acc += cu.len;
        return (
          <Sequence key={i} from={from} durationInFrames={s(T(acc)) - from} layout="none">
            <Shot enter={cu.enter}><Clip src={cu.src} trim={cu.trim} rate={cu.rate} zoom={[1.08, 1.0]} /></Shot>
          </Sequence>
        );
      })}
      <Sequence from={s(T(acc))} layout="none">
        <SplitCeleb />
      </Sequence>
    </>
  );
};
const SplitCeleb: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 952, overflow: "hidden", translate: `${(1 - p) * -1080}px 0px` }}>
        <Clip src="r7" trim={6.2} rate={0.8} zoom={[1.0, 1.1]} pos="50% 35%" />
      </div>
      <div style={{ position: "absolute", left: 0, top: 968, width: 1080, height: 952, overflow: "hidden", translate: `${(1 - p) * 1080}px 0px` }}>
        <Clip src="r3" trim={5.8} rate={0.8} zoom={[1.0, 1.1]} pos="50% 35%" />
      </div>
      <div style={{ position: "absolute", left: 0, top: 952, width: 1080, height: 16, background: GOLD }} />
    </AbsoluteFill>
  );
};

/* European night: r5 build/goal/slide + freeze */
const EuroGoal: React.FC = () => {
  const a = s(T(2.4)), b = s(T(4.6)), c = s(T(5.6));
  return (
    <>
      <Sequence durationInFrames={a} layout="none"><Shot grade="night"><Clip src="r5" trim={2.6} rate={1.0} zoom={[1.0, 1.06]} /></Shot></Sequence>
      <Sequence from={a} durationInFrames={b - a} layout="none"><Shot grade="night" enter="punch"><Clip src="r5" trim={5.55} rate={0.85} zoom={[1.15, 1.3]} pos="45% 50%" /></Shot></Sequence>
      <Sequence from={b} durationInFrames={c - b} layout="none">
        <AbsoluteFill>
          <Img src={staticFile("rm/img/fz_r5.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", scale: "1.25", transformOrigin: "50% 50%" }} />
          <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "rgba(30,91,216,0.5)" }} />
          <Flash at={[0]} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={c} layout="none"><Shot grade="night" enter="swipeR"><Clip src="r5" trim={8.0} rate={0.9} zoom={[1.1, 1.2]} pos="50% 40%" /></Shot></Sequence>
      <Lower kicker="LIGUE DES CHAMPIONS" title="TOUS ENSEMBLE" at={s(T(2.4)) + 6} color={GOLD} />
    </>
  );
};

/* r6: tracked run → goal → dance */
const RunN7: React.FC = () => {
  const a = s(T(4.2));
  // positions in the 1080x1920 frame, relative to this sequence (clip starts at r6 t=0.8)
  const off = s(0.8);
  return (
    <>
      <Sequence durationInFrames={a} layout="none">
        <Shot grade="night" enter="swipeL"><Clip src="r6" trim={0.8} rate={1.0} zoom={[1.0, 1.0]} /></Shot>
        <Tracker label="N°7" pts={[[s(0.9) - off, 640, 1150], [s(1.5) - off, 620, 1135], [s(2.0) - off, 500, 1110], [s(2.5) - off, 405, 1085], [s(3.0) - off, 430, 1085], [s(3.2) - off, 440, 1085]]} />
      </Sequence>
      <Sequence from={a} durationInFrames={s(T(2.6))} layout="none">
        <Shot grade="night" enter="punch"><Clip src="r6" trim={7.0} rate={0.9} zoom={[1.05, 1.2]} pos="50% 35%" /></Shot>
      </Sequence>
      <Lower kicker="LIGUE DES CHAMPIONS" title="SLALOM · N°7" at={s(T(0.6))} />
    </>
  );
};

/* trophies */
const Trophy: React.FC<{ n: number; kicker: string; title: string; pos?: string }> = ({ n, kicker, title, pos = "50% 30%" }) => (
  <>
    <Photo n={n} zoom={[1.02, 1.14]} pos={pos} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(11,31,75,0.92))" }} />
    <Lower kicker={kicker} title={title} at={3} />
  </>
);

const Mosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const imgs = [10, 13, 14, 15];
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      {imgs.map((n, i) => {
        const p = interpolate(frame, [i * 4, i * 4 + 10], [0, 1], { ...CL, easing: OUT });
        const x = (i % 2) * 540, y = Math.floor(i / 2) * 960;
        return (
          <div key={n} style={{ position: "absolute", left: x + 6, top: y + 6, width: 528, height: 948, overflow: "hidden", scale: String(interpolate(p, [0, 1], [0.6, 1])), opacity: p, boxShadow: `0 0 0 3px ${GOLD}` }}>
            <Img src={staticFile(`rm/img/${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%", scale: String(interpolate(frame, [0, 60], [1.05, 1.15], CL)) }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: GOLD, color: NAVY, fontFamily: DISPLAY, fontSize: 70, padding: "6px 28px", scale: String(interpolate(frame, [16, 24], [2, 1], { ...CL, easing: Easing.out(Easing.back(2)) })), opacity: interpolate(frame, [16, 20], [0, 1], CL) }}>LA 15e</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FAMILY = [7, 5, 2, 9];
const Family: React.FC = () => {
  const seg = s(T(1.1));
  return (
    <AbsoluteFill>
      {FAMILY.map((n, i) => (
        <Sequence key={n} from={i * seg} durationInFrames={i === FAMILY.length - 1 ? undefined : seg} layout="none">
          <Shot enter={i % 2 ? "swipeR" : "swipeL"}><Photo n={n} zoom={[1.12, 1.0]} pos={n === 9 ? "50% 25%" : "50% 35%"} /></Shot>
        </Sequence>
      ))}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
        <div style={{ background: NAVY, padding: "8px 26px", borderBottom: `6px solid ${GOLD}` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 84, color: WHITE }}>UNE SEULE FAMILLE</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [s(1.6), s(2.1)], [1, 0], CL);
  const pop = interpolate(frame, [0, 10], [1.6, 1], { ...CL, easing: Easing.out(Easing.back(1.8)) });
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Photo n={8} zoom={[1.05, 1.18]} pos="50% 45%" blurFill={false} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(11,31,75,0.25), rgba(11,31,75,0.85) 75%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <div style={{ scale: String(pop), textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 150, color: WHITE, lineHeight: 0.95, textShadow: "0 10px 40px rgba(0,0,0,0.7)" }}>¡HALA</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 190, color: GOLD, lineHeight: 0.95, textShadow: "0 10px 40px rgba(0,0,0,0.7)" }}>MADRID!</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}>
        <Rise at={8}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: WHITE, padding: "10px 30px", background: NAVY, border: `2px solid ${GOLD}`, borderRadius: 999 }}>@viber.flow4</div></Rise>
        <Rise at={12}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: GOLD, marginTop: 10 }}>#realmadrid #halamadrid #football #viberflow4</div></Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= TIMELINE (in beats) ================= */
const SCENES: { name: string; from: number; to: number; el: React.ReactNode; wipe?: boolean }[] = [
  { name: "Ouverture", from: 0, to: 8, el: <Opening /> },
  { name: "Histoire", from: 8, to: 16, el: <History />, wipe: true },
  { name: "14e → 15e", from: 16, to: 20, el: <Fifteen />, wipe: true },
  { name: "Chap. 01", from: 20, to: 21.5, el: <Chapter n="01" title="LE BERNABÉU" sub="LA MAISON DES LÉGENDES" />, wipe: false },
  { name: "But n°5", from: 21.5, to: 29.5, el: <GoalN5 /> },
  { name: "Bernabéu", from: 29.5, to: 36, el: <Bernabeu />, wipe: true },
  { name: "Chap. 02", from: 36, to: 37.5, el: <Chapter n="02" title="LES NUITS EUROPÉENNES" sub="LÀ OÙ LE REAL EST CHEZ LUI" dark /> },
  { name: "But LDC", from: 37.5, to: 43.5, el: <EuroGoal /> },
  { name: "Slalom n°7", from: 43.5, to: 50, el: <RunN7 />, wipe: true },
  { name: "Chap. 03", from: 50, to: 52, el: <Chapter n="03" title="LES TROPHÉES" sub="LA COLLECTION LA PLUS RICHE D'EUROPE" /> },
  { name: "Londres 2024", from: 52, to: 54, el: <Trophy n={6} kicker="LIGUE DES CHAMPIONS" title="LONDRES 2024" pos="50% 35%" /> },
  { name: "Mosaïque", from: 54, to: 56, el: <Mosaic />, wipe: true },
  { name: "Intercontinentale", from: 56, to: 58, el: <Trophy n={4} kicker="FIFA · 2024" title="COUPE INTERCONTINENTALE" />, wipe: true },
  { name: "Chap. 04", from: 58, to: 59.2, el: <Chapter n="04" title="UNE FAMILLE" sub="UN SEUL CŒUR" dark /> },
  { name: "Famille", from: 59.2, to: 63.6, el: <Family /> },
  { name: "Final", from: 63.6, to: 68, el: <Finale />, wipe: true },
];

const GlobalFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const big = [36, 50, 63.6].map((b) => s(T(b)));
  let w = 0;
  for (const a of big) if (frame >= a) w = Math.max(w, Math.exp(-(frame - a) / 3));
  return <AbsoluteFill style={{ background: WHITE, opacity: w * 0.9, pointerEvents: "none" }} />;
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width={1080} height={1920}>
          <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 8} /></filter>
          <rect width="100%" height="100%" filter="url(#gr)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const hits = [36, 50, 63.6, 21.5 + 3.4, 37.5 + 4.6].map((b) => s(T(b)));
  let a = 0;
  for (const h of hits) if (frame >= h) a = Math.max(a, 20 * Math.exp(-(frame - h) / 4));
  return <AbsoluteFill style={{ translate: `${(random(`x${frame}`) - 0.5) * 2 * a}px ${(random(`y${frame}`) - 0.5) * 2 * a}px` }}>{children}</AbsoluteFill>;
};

const Sound: React.FC = () => {
  const whoosh = SCENES.slice(1).map((sc) => sc.from);
  const impacts = [36, 50, 63.6, 21.5 + 1.8, 37.5 + 4.6, 16 + 1.6];
  return (
    <>
      <Sequence from={s(0.35)}><Audio src={staticFile("rm/music.wav")} volume={1} /></Sequence>
      <Audio src={staticFile("jb/crowd_amb.wav")} volume={0.22} loop />
      {whoosh.map((b, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, s(T(b)) - 8)} durationInFrames={22}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} /></Sequence>
      ))}
      {impacts.map((b, i) => (
        <Sequence key={`i${i}`} from={s(T(b))} durationInFrames={45}><Audio src={staticFile("sfx/impact.wav")} volume={0.5} /></Sequence>
      ))}
      {[8, 10, 12, 14].map((b, i) => (
        <Sequence key={`s${i}`} from={s(T(b))} durationInFrames={36}><Audio src={staticFile("sfx/shine.wav")} volume={0.2} /></Sequence>
      ))}
    </>
  );
};

export const RealPreview: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Shake>
      {SCENES.map((sc) => (
        <Sequence key={sc.name} name={sc.name} from={s(T(sc.from))} durationInFrames={Math.min(RM_TOTAL, s(T(sc.to))) - s(T(sc.from))}>
          {sc.el}
        </Sequence>
      ))}
      {SCENES.filter((sc) => sc.wipe).map((sc) => (
        <Sequence key={`bw${sc.name}`} from={s(T(sc.from)) - 6} durationInFrames={20} layout="none">
          <BarWipe />
        </Sequence>
      ))}
    </Shake>
    <GlobalFlash />
    <Grain />
    <Bug />
    <Sound />
  </AbsoluteFill>
);

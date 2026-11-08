import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";

/* ============================================================
   FC BARCELONE · LE PARCOURS — avant Atlético–Barça (8 nov. 2026)
   Musique vidIQ 120 BPM (temps = 0.5 s, mesures à x.09),
   drop 18.09 s, respiration 34–36 s, coup final 56 s.
   v2 : transitions zoom/whip avec flou de mouvement, pulsations sur
   le temps, punch-zooms, rampes de vitesse, pop-ups à ressort,
   décalage RVB sur les drops, images améliorées (EDSR x2).
   ============================================================ */

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-300-normal.woff2"), weight: "300" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const B = (n: number) => 0.09 + n * 0.5; // temps musical n -> secondes
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const FCB_TOTAL = s(58.3);

const DISPLAY = "Anton, Impact, sans-serif";
const SANS = "Montserrat, Arial, sans-serif";
const GRANA = "#a50044";
const BLAU = "#004d98";
const GOLD = "#edbb00";
const DEEP = "#07102e";
const WHITE = "#ffffff";

/* ---------------- médias ---------------- */
/** Vidéo plein cadre. `punch` = frames (locales) où l'image fait un zoom sec puis revient. */
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; pos?: string; filter?: string; punch?: number[] }> = ({
  src, trim = 0, rate = 1, zoom = [1.06, 1.0], pos = "50% 50%", filter, punch = [],
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let p = 0;
  for (const a of punch) p = Math.max(p, interpolate(frame, [a, a + 2, a + 14], [0, 1, 0], CL));
  const sc = interpolate(frame, [0, durationInFrames], zoom, CL) * (1 + 0.12 * p);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Video src={staticFile(`fcb/c2/${src}.mp4`)} trimBefore={s(trim)} playbackRate={rate} muted objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: pos, transformOrigin: pos, filter, scale: String(sc) }} />
    </AbsoluteFill>
  );
};

/** Rampe de vitesse : rapide puis ralenti (deux plans enchaînés). */
const Ramp: React.FC<{ src: string; trim: number; fastDur: number; fastRate?: number; slowRate?: number; zoom?: [number, number]; pos?: string }> = ({
  src, trim, fastDur, fastRate = 1.6, slowRate = 0.45, zoom = [1.08, 1.2], pos,
}) => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(fastDur)}><Clip src={src} trim={trim} rate={fastRate} zoom={[zoom[0], zoom[0] + 0.04]} pos={pos} /></Sequence>
    <Sequence from={s(fastDur)}><Clip src={src} trim={trim + fastDur * fastRate} rate={slowRate} zoom={[zoom[0] + 0.04, zoom[1]]} pos={pos} punch={[0]} /></Sequence>
  </AbsoluteFill>
);

const Full: React.FC<{ src: string; zoom?: [number, number]; pos?: string; filter?: string }> = ({ src, zoom = [1.04, 1.16], pos = "50% 40%", filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Img src={staticFile(`fcb/img/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transformOrigin: pos, filter,
        scale: String(interpolate(frame, [0, durationInFrames], zoom, { ...CL, easing: Easing.inOut(Easing.sin) })) }} />
    </AbsoluteFill>
  );
};

/** Photo non verticale : fond flouté + image nette (fondu haut/bas) + parallaxe. */
const Framed: React.FC<{ src: string; top?: number; zoom?: [number, number]; width?: number; children?: React.ReactNode }> = ({
  src, top = 260, zoom = [1.0, 1.08], width = 1080, children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const url = staticFile(`fcb/img/${src}.jpg`);
  const sc = interpolate(frame, [0, durationInFrames], zoom, { ...CL, easing: Easing.inOut(Easing.sin) });
  const bgy = interpolate(frame, [0, durationInFrames], [30, -30]);
  const fade = "linear-gradient(to bottom, transparent 0%, #000 8%, #000 86%, transparent 100%)";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(46px) brightness(0.4) saturate(1.3)", scale: "1.4", translate: `0 ${bgy}px` }} />
      <div style={{ position: "absolute", left: (1080 - width) / 2, top, width, transformOrigin: "50% 40%", scale: String(sc) }}>
        <Img src={url} style={{ width: "100%", display: "block", WebkitMaskImage: fade, maskImage: fade }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- transitions ---------------- */
type Enter = "zoom" | "whipL" | "whipR" | "spin" | "drop" | "none";
/** Entrée/sortie de scène avec flou de mouvement. La sortie fait un léger zoom avant + flou (cut sur le temps). */
const Trans: React.FC<{ children: React.ReactNode; enter?: Enter; exit?: boolean }> = ({ children, enter = "zoom", exit = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, 9], [0, 1], { ...CL, easing: OUT });
  const q = exit ? interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) }) : 0;
  let tf = "";
  let blur = 0;
  if (enter === "zoom") { tf = `scale(${1.35 - 0.35 * p})`; blur = (1 - p) * 14; }
  if (enter === "whipL") { tf = `translateX(${(1 - p) * 900}px) skewX(${(1 - p) * -12}deg)`; blur = (1 - p) * 22; }
  if (enter === "whipR") { tf = `translateX(${(p - 1) * 900}px) skewX(${(1 - p) * 12}deg)`; blur = (1 - p) * 22; }
  if (enter === "spin") { tf = `rotate(${(1 - p) * -10}deg) scale(${1.4 - 0.4 * p})`; blur = (1 - p) * 16; }
  if (enter === "drop") { tf = `translateY(${(p - 1) * 700}px) scale(${1.15 - 0.15 * p})`; blur = (1 - p) * 20; }
  tf += ` scale(${1 + q * 0.18})`;
  blur += q * 12;
  return <AbsoluteFill style={{ transform: tf, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

/** Bandes blaugrana qui balaient l'écran. */
const StripeWipe: React.FC<{ at?: number; dur?: number; diag?: boolean }> = ({ at = 0, dur = 16, diag }) => {
  const frame = useCurrentFrame();
  const n = 7;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", transform: diag ? "rotate(-14deg) scale(1.5)" : undefined }}>
      {Array.from({ length: n }).map((_, i) => {
        const d = i * 1.1;
        const p = interpolate(frame, [at + d, at + d + dur], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
        const y = interpolate(p, [0, 1], [110, -110]);
        return <div key={i} style={{ position: "absolute", top: 0, left: `${(i * 100) / n}%`, width: `${100 / n + 0.6}%`, height: "100%",
          background: i % 3 === 2 ? GOLD : i % 2 ? BLAU : GRANA, transform: `translateY(${y}%)` }} />;
      })}
    </AbsoluteFill>
  );
};

/* ---------------- effets ---------------- */
const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "contrast(1.1) saturate(1.14) brightness(0.96)" }}>{children}</AbsoluteFill>
);
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
);
const Shade: React.FC<{ h?: number }> = ({ h = 900 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h,
    background: "linear-gradient(to top, rgba(7,16,46,0.97) 0%, rgba(7,16,46,0.7) 45%, transparent 100%)" }} />
);

/** Décalage RVB (grenat/bleu) bref, déclenché aux frames données. */
const RGBSplit: React.FC<{ children: React.ReactNode; at: number[]; amt?: number }> = ({ children, at, amt = 26 }) => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const a of at) if (frame >= a) k = Math.max(k, interpolate(frame, [a, a + 8], [1, 0], CL));
  if (k < 0.02) return <AbsoluteFill>{children}</AbsoluteFill>;
  const d = amt * k;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${d}px)`, mixBlendMode: "screen", opacity: 0.55, filter: "url(#fcbRed)" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-d}px)`, mixBlendMode: "screen", opacity: 0.55, filter: "url(#fcbBlue)" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ at: number[]; color?: string; strength?: number; len?: number }> = ({ at, color = WHITE, strength = 0.8, len = 7 }) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) o = Math.max(o, interpolate(frame, [a, a + 1, a + len], [0, strength, 0], CL));
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

const LightSweep: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 26 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [-0.4, 1.4], CL);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen",
      background: `linear-gradient(105deg, transparent ${p * 100 - 12}%, rgba(255,230,160,0.5) ${p * 100}%, transparent ${p * 100 + 12}%)` }} />
  );
};

/** Fuite de lumière chaude qui traverse l'image. */
const Leak: React.FC<{ at?: number; dur?: number; color?: string }> = ({ at = 0, dur = 30, color = "rgba(255,120,40,0.9)" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], CL);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: Math.sin(p * Math.PI) * 0.7,
      background: `radial-gradient(circle at ${-10 + p * 120}% ${20 + p * 40}%, ${color} 0%, rgba(165,0,68,0.45) 22%, transparent 50%)` }} />
  );
};

const Particles: React.FC<{ count?: number; color?: string }> = ({ count = 40, color = GOLD }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`px${i}`) * 1080 + Math.sin(frame / 20 + i) * 14;
        const sp = 1 + random(`ps${i}`) * 3;
        const y = 1920 - ((frame * sp * 3 + random(`py${i}`) * 1920) % 2100);
        const r = 2 + random(`pr${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: color, opacity: 0.35 + random(`po${i}`) * 0.5, boxShadow: `0 0 ${r * 3}px ${color}` }} />;
      })}
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ count?: number }> = ({ count = 70 }) => {
  const frame = useCurrentFrame();
  const cols = [GRANA, BLAU, GOLD, WHITE];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x0 = random(`cx${i}`) * 1080;
        const v = 6 + random(`cv${i}`) * 9;
        const y = -60 + frame * v - random(`cy${i}`) * 600;
        const x = x0 + Math.sin(frame / 8 + i) * 30;
        const rot = frame * (4 + random(`cr${i}`) * 10);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14, height: 24, background: cols[i % 4], transform: `rotate(${rot}deg) rotateX(${rot * 1.3}deg)`, opacity: 0.9 }} />;
      })}
    </AbsoluteFill>
  );
};

const Shockwave: React.FC<{ at?: number; color?: string }> = ({ at = 0, color = GOLD }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 18], [0, 1], { ...CL, easing: OUT });
  if (frame < at || p >= 1) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: 200 + p * 1800, height: 200 + p * 1800, borderRadius: "50%", border: `${(1 - p) * 28}px solid ${color}`, opacity: 1 - p }} />
    </AbsoluteFill>
  );
};

/** Lignes de vitesse radiales (drops). */
const SpeedLines: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 14 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + dur], [0, 0.8, 0], CL);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <svg width="1080" height="1920">
        {Array.from({ length: 46 }).map((_, i) => {
          const a = (i / 46) * Math.PI * 2 + random(`sl${i}`) * 0.1;
          const r0 = 420 + random(`sr${i}`) * 200;
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * 1400} y2={960 + Math.sin(a) * 1400}
            stroke="white" strokeWidth={2 + random(`sw${i}`) * 5} strokeOpacity={0.6} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- typographie & pop-ups ---------------- */
const useSpring = (at: number, damping = 11, mass = 0.7) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass, stiffness: 170 } });
};

const Rise: React.FC<{ children: React.ReactNode; at?: number; dur?: number; dy?: number; style?: React.CSSProperties }> = ({ children, at = 0, dur = 12, dy = 60, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dy}px)`, filter: `blur(${(1 - p) * 8}px)`, ...style }}>{children}</div>;
};

/** Pop-up avec ressort (dépasse puis se stabilise). */
const Pop: React.FC<{ children: React.ReactNode; at?: number; style?: React.CSSProperties; from?: number }> = ({ children, at = 0, style, from = 0.2 }) => {
  const k = useSpring(at);
  const frame = useCurrentFrame();
  return <div style={{ transform: `scale(${from + (1 - from) * k})`, opacity: frame < at ? 0 : Math.min(1, k * 1.5), ...style }}>{children}</div>;
};

/** Texte révélé derrière un masque. */
const Mask: React.FC<{ children: React.ReactNode; at?: number; style?: React.CSSProperties }> = ({ children, at = 0, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], { ...CL, easing: OUT });
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%) skewY(${(1 - p) * 6}deg)` }}>{children}</div>
    </div>
  );
};

/** Lettres qui tombent une par une avec ressort. */
const Letters: React.FC<{ text: string; at?: number; size: number; color?: string; stagger?: number; shadow?: string }> = ({ text, at = 0, size, color = WHITE, stagger = 2, shadow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: size, lineHeight: 1.04, color, textShadow: shadow, paddingTop: 8 }}>
      {text.split("").map((ch, i) => {
        const k = spring({ frame: frame - at - i * stagger, fps, config: { damping: 10, mass: 0.6, stiffness: 180 } });
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * -120}px) rotate(${(1 - k) * -14}deg) scale(${0.6 + 0.4 * k})` }}>{ch}</span>;
      })}
    </div>
  );
};

/** Pastille dorée « badge » pop-up. */
const Chip: React.FC<{ children: React.ReactNode; at: number; color?: string; text?: string }> = ({ children, at, color = GOLD, text = DEEP }) => (
  <Pop at={at}>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 40, background: color, color: text,
      fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.06em", boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>{children}</div>
  </Pop>
);

/** Habillage permanent en haut. */
const Bug: React.FC<{ label?: string }> = ({ label = "LE PARCOURS" }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 8], [0, 1], CL);
  return (
    <div style={{ position: "absolute", top: 110, left: 70, opacity: op, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", height: 44 }}>
        {[GRANA, BLAU, GRANA, BLAU].map((c, i) => <div key={i} style={{ width: 9, background: c }} />)}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 44, color: WHITE, letterSpacing: "0.06em" }}>BARÇA</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: GOLD, letterSpacing: "0.3em" }}>{label}</div>
    </div>
  );
};

/** Score : deux chiffres qui « tombent » séparément. */
const Score: React.FC<{ a: string; b: string; left: string; right: string; at: number }> = ({ a, b, left, right, at }) => {
  const ka = useSpring(at, 9);
  const kb = useSpring(at + 5, 9);
  const kl = useSpring(at - 3, 14);
  return (
    <div style={{ display: "inline-flex", alignItems: "stretch", marginTop: 22, borderRadius: 8, overflow: "hidden", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", transform: `scaleX(${kl})`, transformOrigin: "left" }}>
      <div style={{ padding: "10px 22px", background: GRANA, fontFamily: DISPLAY, fontSize: 52, color: WHITE, display: "flex", alignItems: "center" }}>{left}</div>
      <div style={{ padding: "4px 26px", background: WHITE, fontFamily: DISPLAY, fontSize: 84, color: DEEP, display: "flex", gap: 18, alignItems: "center" }}>
        <span style={{ display: "inline-block", transform: `translateY(${(1 - ka) * -90}px)`, opacity: Math.min(1, ka * 2) }}>{a}</span>
        <span style={{ opacity: 0.5 }}>-</span>
        <span style={{ display: "inline-block", transform: `translateY(${(1 - kb) * -90}px)`, opacity: Math.min(1, kb * 2) }}>{b}</span>
      </div>
      <div style={{ padding: "10px 22px", background: BLAU, fontFamily: DISPLAY, fontSize: 52, color: WHITE, display: "flex", alignItems: "center" }}>{right}</div>
    </div>
  );
};

const Count: React.FC<{ to: number; at: number; dur?: number }> = ({ to, at, dur = 22 }) => {
  const frame = useCurrentFrame();
  return <>{Math.round(interpolate(frame, [at, at + dur], [0, to], { ...CL, easing: OUT }))}</>;
};

const Kicker: React.FC<{ children: React.ReactNode; at: number }> = ({ children, at }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [at, at + 12], [0, 1], { ...CL, easing: OUT });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 70 * w, height: 5, background: GOLD }} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.32em", color: GOLD, opacity: w }}>{children}</div>
    </div>
  );
};

/* ---------------- scènes ---------------- */

// 0 – 6.09 : ouverture
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [4, 26], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill>
      <Grade><Full src="crest_flag" zoom={[1.35, 1.06]} pos="50% 45%" filter="brightness(0.4) saturate(1.15) blur(1.5px)" /></Grade>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(7,16,46,0.6) 0%, transparent 72%)" }} />
      <Particles count={40} />
      <LightSweep at={14} dur={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: `${0.15 + split * 0.4}em`, color: GOLD, opacity: split }}>MÉS QUE UN CLUB</div>
        <Letters text="BARÇA" at={12} size={250} stagger={3} shadow="0 12px 50px rgba(0,0,0,0.6)" />
        <Rise at={30} dy={20}>
          <div style={{ display: "flex", marginTop: 18, height: 12, width: 520 }}>
            {[GRANA, BLAU, GRANA, BLAU, GRANA, BLAU].map((c, i) => <div key={i} style={{ flex: 1, background: c, transform: `scaleY(${interpolate(frame, [30 + i * 2, 40 + i * 2], [0, 1], CL)})` }} />)}
          </div>
        </Rise>
        <Rise at={40} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: WHITE, letterSpacing: "0.3em", marginTop: 26 }}>LE PARCOURS</div></Rise>
      </AbsoluteFill>
      <StripeWipe at={-8} dur={16} />
      <Shockwave at={12} />
    </AbsoluteFill>
  );
};

// 6.09 – 12.09 : l'ère Flick
const Flick: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(3)}><Trans enter="zoom"><Grade><Clip src="yamal_edit" trim={3.2} zoom={[1.0, 1.12]} /></Grade></Trans></Sequence>
    <Sequence from={s(3)}><Trans enter="whipL" exit={false}><Grade><Ramp src="goal" trim={0.2} fastDur={1.2} fastRate={1.7} slowRate={0.6} zoom={[1.15, 1.32]} /></Grade></Trans></Sequence>
    <Vignette />
    <Bug />
    <Shade />
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
      <Kicker at={4}>DEPUIS 2024</Kicker>
      <Mask at={7}><div style={{ fontFamily: DISPLAY, fontSize: 140, lineHeight: 1.04, color: WHITE }}>L'ÈRE</div></Mask>
      <Mask at={11}><div style={{ fontFamily: DISPLAY, fontSize: 140, lineHeight: 1.04, color: GOLD }}>HANSI FLICK</div></Mask>
      <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
        <Chip at={18} color={GRANA} text={WHITE}>DU JEU</Chip>
        <Chip at={24} color={BLAU} text={WHITE}>DE L'AUDACE</Chip>
        <Chip at={30}>DES TROPHÉES</Chip>
      </div>
    </div>
    <Flash at={[0, s(3)]} strength={0.55} />
  </AbsoluteFill>
);

// 12.09 – 18.09 : le triplé 2025
const TROPHIES = ["LIGA", "COPA DEL REY", "SUPERCOPA"];
const Treble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(2)}><Trans enter="whipR"><Grade><Clip src="celebration" trim={0.5} rate={1.1} punch={[s(1)]} /></Grade></Trans></Sequence>
      <Sequence from={s(2)}><Trans enter="zoom" exit={false}><Grade><Clip src="celebration" trim={44} rate={0.9} zoom={[1.0, 1.14]} punch={[s(1), s(2), s(3)]} /></Grade></Trans></Sequence>
      <Vignette />
      <Shade h={1150} />
      <Bug />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Kicker at={2}>SAISON 2024-25</Kicker>
        <Letters text="LE TRIPLÉ" at={5} size={150} stagger={2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
          {TROPHIES.map((t, i) => {
            const at = s(1 + i * 1.0);
            const k = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.6, stiffness: 170 } });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, opacity: frame < at ? 0 : 1, transform: `translateX(${(1 - k) * -120}px)` }}>
                <div style={{ width: 58, height: 58, borderRadius: 29, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SANS, fontWeight: 800, fontSize: 32, color: DEEP, transform: `scale(${k})`, boxShadow: `0 0 ${24 * k}px ${GOLD}` }}>✓</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 72, color: WHITE, letterSpacing: "0.03em" }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Flash at={[0, s(2), s(3), s(4)]} strength={0.45} len={5} />
    </AbsoluteFill>
  );
};

// 18.09 – 24.09 : DROP — Supercoupe 2026
const Supercopa: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = interpolate(frame, [0, 14], [30, 0], CL);
  return (
    <AbsoluteFill style={{ transform: `translate(${(random(`a${frame}`) - 0.5) * shake}px, ${(random(`b${frame}`) - 0.5) * shake}px)` }}>
      <RGBSplit at={[0, s(2)]}>
        <Sequence durationInFrames={s(2)}><Grade><Ramp src="goal" trim={2.2} fastDur={0.7} fastRate={1.4} slowRate={0.5} zoom={[1.3, 1.45]} /></Grade></Sequence>
        <Sequence from={s(2)}><Trans enter="spin" exit={false}><Grade><Clip src="trophy_pitch" trim={1.0} zoom={[1.0, 1.12]} punch={[s(1.5), s(2.5)]} /></Grade></Trans></Sequence>
      </RGBSplit>
      <Vignette />
      <Bug />
      <Particles count={30} />
      <Shade h={1000} />
      <Sequence from={s(1.6)} layout="none">
        <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
          <Kicker at={0}>11 JANVIER 2026 · DJEDDAH</Kicker>
          <Letters text="SUPERCOUPE" at={3} size={128} stagger={1.5} />
          <Score at={10} left="BARÇA" right="REAL" a="3" b="2" />
          <div style={{ marginTop: 18 }}><Chip at={22}>⚽ ⚽ DOUBLÉ DE RAPHINHA</Chip></div>
        </div>
      </Sequence>
      <SpeedLines at={0} dur={16} />
      <Shockwave at={0} />
      <Flash at={[0]} strength={1} len={10} />
    </AbsoluteFill>
  );
};

// 24.09 – 30.09 : le Clásico du titre
const Titre: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(4)}>
      <Trans enter="drop"><Grade><Framed src="champions" top={150} width={1150} zoom={[1.0, 1.1]} /></Grade></Trans>
      <LightSweep at={8} dur={30} />
      <Confetti count={60} />
    </Sequence>
    <Sequence from={s(4)}><Trans enter="zoom" exit={false}><Grade><Clip src="celebration" trim={36} zoom={[1.05, 1.18]} /></Grade></Trans></Sequence>
    <Leak at={s(3.6)} dur={30} />
    <Vignette />
    <Bug />
    <Shade h={950} />
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
      <Kicker at={3}>10 MAI 2026 · CAMP NOU</Kicker>
      <Mask at={6}><div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 1.04, color: WHITE }}>LE CLÁSICO</div></Mask>
      <Mask at={10}><div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 1.04, color: GOLD }}>DU TITRE</div></Mask>
      <Score at={16} left="BARÇA" right="REAL" a="2" b="0" />
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <Chip at={28} color={GRANA} text={WHITE}>⚽ RASHFORD</Chip>
        <Chip at={33} color={BLAU} text={WHITE}>⚽ FERRAN TORRES</Chip>
      </div>
    </div>
    <Flash at={[0, s(4)]} strength={0.55} />
  </AbsoluteFill>
);

// 30.09 – 34.09 : 29 titres, deux de suite
const Vingtneuf: React.FC = () => {
  const k = useSpring(0, 8, 0.8);
  return (
    <AbsoluteFill>
      <Trans enter="zoom"><Grade><Clip src="celebration" trim={45} rate={0.85} zoom={[1.1, 1.24]} filter="brightness(0.7)" /></Grade></Trans>
      <Vignette />
      <Particles count={50} />
      <Confetti count={50} />
      <Shade h={1250} />
      <Bug />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 70px 290px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 400, color: GOLD, lineHeight: 0.95, textShadow: "0 0 60px rgba(237,187,0,0.55)", transform: `scale(${0.5 + 0.5 * k})`, transformOrigin: "left bottom" }}>
          <Count to={29} at={0} />
        </div>
        <Rise at={6} dy={20}><div style={{ fontFamily: DISPLAY, fontSize: 94, color: WHITE, lineHeight: 1.05 }}>TITRES DE CHAMPION</div></Rise>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Chip at={14}>🏆 2025</Chip>
          <Chip at={19}>🏆 2026</Chip>
          <Chip at={25} color={GRANA} text={WHITE}>DEUX DE SUITE</Chip>
        </div>
      </AbsoluteFill>
      <Flash at={[0]} color={GOLD} strength={0.5} />
    </AbsoluteFill>
  );
};

// 34.09 – 36.09 : respiration
const Breath: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Grade><Clip src="yamal_edit" trim={0.2} rate={0.45} zoom={[1.2, 1.32]} filter={`brightness(${interpolate(frame, [0, 60], [0.45, 0.8], CL)}) saturate(0.55)`} /></Grade>
      <Vignette />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Rise at={4} dy={20}><div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 58, color: WHITE, letterSpacing: "0.2em", textAlign: "center" }}>ET AU CŒUR</div></Rise>
        <Rise at={14} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: GOLD, letterSpacing: "0.2em", textAlign: "center" }}>DE TOUT ÇA…</div></Rise>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: WHITE, opacity: interpolate(frame, [52, 60], [0, 0.9], CL) }} />
    </AbsoluteFill>
  );
};

// 36.09 – 42.09 : Lamine Yamal
const Yamal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RGBSplit at={[0, s(2), s(4)]} amt={18}>
        <Sequence durationInFrames={s(2)}><Trans enter="zoom"><Grade><Clip src="yamal_kopa" trim={0.6} zoom={[1.18, 1.05]} /></Grade></Trans></Sequence>
        <Sequence from={s(2)} durationInFrames={s(2)}><Trans enter="whipL"><Grade><Ramp src="yamal_kopa" trim={5.0} fastDur={0.6} fastRate={1.5} slowRate={0.55} zoom={[1.0, 1.12]} /></Grade></Trans></Sequence>
        <Sequence from={s(4)}><Trans enter="whipR" exit={false}><Grade><Clip src="yamal_edit" trim={12.0} rate={0.9} zoom={[1.05, 1.18]} punch={[s(0.8)]} /></Grade></Trans></Sequence>
      </RGBSplit>
      <Vignette />
      <Shade h={1050} />
      <Bug label="LE NUMÉRO 10" />
      <div style={{ position: "absolute", right: -40, top: 380, fontFamily: DISPLAY, fontSize: 900, lineHeight: 1, color: "transparent",
        WebkitTextStroke: `4px rgba(237,187,0,${interpolate(frame, [0, 20], [0, 0.55], CL)})`, transform: `translateY(${interpolate(frame, [0, 180], [40, -40])}px)` }}>10</div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Kicker at={4}>UN ENFANT DE LA MASIA</Kicker>
        <Letters text="LAMINE" at={8} size={150} stagger={2} />
        <Letters text="YAMAL" at={14} size={150} stagger={2} color={GOLD} />
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <Chip at={28}>N°10</Chip>
          <Chip at={33} color={GRANA} text={WHITE}>KOPA TROPHY 2024 · 2025</Chip>
        </div>
      </div>
      <Flash at={[0, s(2), s(4)]} strength={0.5} />
    </AbsoluteFill>
  );
};

// 42.09 – 48.09 : l'attaque (illustration avec étiquettes)
const PLAYERS: { name: string; n: string; x: number; y: number }[] = [
  { name: "GORDON", n: "17", x: 140, y: 580 },
  { name: "RAPHINHA", n: "11", x: 355, y: 440 },
  { name: "FERMÍN", n: "7", x: 552, y: 590 },
  { name: "LAMINE YAMAL", n: "10", x: 730, y: 430 },
  { name: "ADEYEMI", n: "14", x: 930, y: 590 },
];
const Attaque: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Trans enter="drop"><Grade><Framed src="attack" top={330} width={1080} zoom={[1.0, 1.07]} /></Grade></Trans>
      <Vignette />
      <Bug label="L'ATTAQUE" />
      {PLAYERS.map((p, i) => {
        const at = s(0.5 + i * 0.5);
        const k = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.6, stiffness: 180 } });
        const line = interpolate(frame, [at, at + 10], [0, 1], { ...CL, easing: OUT });
        return (
          <div key={p.name} style={{ position: "absolute", left: p.x, top: 330 + p.y - 170, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: frame < at ? 0 : 1 }}>
            <div style={{ padding: "7px 16px", background: i % 2 ? BLAU : GRANA, fontFamily: SANS, fontWeight: 800, fontSize: 25, color: WHITE, letterSpacing: "0.06em",
              whiteSpace: "nowrap", transform: `scale(${k}) translateY(${(1 - k) * 30}px)`, boxShadow: "0 8px 22px rgba(0,0,0,0.55)", borderRadius: 4 }}>
              <span style={{ color: GOLD }}>{p.n}</span> {p.name}
            </div>
            <div style={{ width: 3, height: 90 * line, background: GOLD }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: GOLD, boxShadow: `0 0 ${10 + 10 * Math.sin(frame / 4)}px ${GOLD}` }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Letters text="UNE ATTAQUE" at={s(3)} size={112} stagger={1.5} />
        <Letters text="DE FEU" at={s(3.5)} size={112} stagger={2} color={GOLD} shadow="0 0 40px rgba(255,120,0,0.6)" />
      </div>
      <Leak at={s(3)} dur={50} />
      <Flash at={[0]} strength={0.6} />
    </AbsoluteFill>
  );
};

// 48.09 – 54.09 : ce soir
const CeSoir: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.35;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(3)}><Trans enter="zoom"><Grade><Clip src="yamal_edit2" trim={4.3} zoom={[1.05, 1.18]} /></Grade></Trans></Sequence>
      <Sequence from={s(3)}><Trans enter="whipL" exit={false}><Grade><Clip src="trophy_pitch" trim={6.0} rate={0.9} zoom={[1.0, 1.14]} /></Grade></Trans></Sequence>
      <Vignette />
      <Shade h={1200} />
      <Bug label="LIGA · J12" />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 290 }}>
        <Pop at={2} style={{ transformOrigin: "left center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "10px 22px", background: GRANA, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: WHITE, letterSpacing: "0.2em" }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: WHITE, opacity: blink }} /> CE SOIR · 21H
          </div>
        </Pop>
        <Letters text="LE LEADER" at={6} size={150} stagger={2} />
        <Letters text="EN MISSION" at={12} size={150} stagger={2} color={GOLD} />
        <Rise at={20} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.88)", marginTop: 14 }}>Atlético – Barça · Metropolitano, Madrid</div></Rise>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          {[["1er", "DE LIGA"], ["+2", "PTS D'AVANCE"]].map(([a, b], i) => (
            <Pop key={b} at={28 + i * 6}>
              <div style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", borderTop: `5px solid ${GOLD}`, backdropFilter: "blur(6px)" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 66, color: WHITE, lineHeight: 1 }}>{a}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: GOLD, letterSpacing: "0.2em", marginTop: 6 }}>{b}</div>
              </div>
            </Pop>
          ))}
        </div>
      </div>
      <StripeWipe at={-8} dur={14} diag />
    </AbsoluteFill>
  );
};

// 54.09 – 58.3 : fin
const Fin: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [s(3.4), s(4.2)], [0, 1], CL);
  return (
    <AbsoluteFill>
      <Trans enter="spin" exit={false}><Grade><Full src="visca" zoom={[1.14, 1.0]} pos="50% 40%" /></Grade></Trans>
      <Particles count={34} />
      <Confetti count={40} />
      <LightSweep at={6} dur={30} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230 }}>
        <Shade h={600} />
        <Pop at={12} style={{ position: "relative" }}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: WHITE }}>@viber.flow4</div></Pop>
        <Rise at={18} dy={14}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: "rgba(255,255,255,0.8)", marginTop: 12, position: "relative" }}>#FCBarcelona #ViscaBarça #LaLiga #AtletiBarça</div></Rise>
      </AbsoluteFill>
      <SpeedLines at={0} dur={12} />
      <Shockwave at={0} />
      <Flash at={[0]} color={GOLD} strength={0.7} len={10} />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

/* ---------------- timeline ---------------- */
const SCENES: { from: number; to: number; el: React.ReactNode; enter?: Enter }[] = [
  { from: 0, to: B(12), el: <Opening />, enter: "none" },
  { from: B(12), to: B(24), el: <Flick />, enter: "none" },
  { from: B(24), to: B(36), el: <Treble />, enter: "none" },
  { from: B(36), to: B(48), el: <Supercopa />, enter: "zoom" },
  { from: B(48), to: B(60), el: <Titre />, enter: "none" },
  { from: B(60), to: B(68), el: <Vingtneuf />, enter: "none" },
  { from: B(68), to: B(72), el: <Breath />, enter: "zoom" },
  { from: B(72), to: B(84), el: <Yamal />, enter: "none" },
  { from: B(84), to: B(96), el: <Attaque />, enter: "none" },
  { from: B(96), to: B(108), el: <CeSoir />, enter: "none" },
  { from: B(108), to: 58.3, el: <Fin />, enter: "none" },
];

/** Pulsation globale sur les temps forts (sections énergiques). */
const BeatPulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const active = (t >= 18.09 && t < 34) || (t >= 36.09 && t < 56);
  let k = 0;
  if (active) {
    const since = (t - 0.09) % 1.0; // un coup par seconde (2 temps)
    k = Math.exp(-since * 9);
  }
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.022 * k})` }}>{children}</AbsoluteFill>;
};

/** Plages prévues pour la voix off — à remplir avec les fichiers fcb/vo/l*.wav. */
export const FCB_VO: { at: number; file?: string }[] = [];

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.09, mixBlendMode: "overlay" }}>
      <svg width="1080" height="1920">
        <filter id="fcbn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#fcbn)" />
      </svg>
    </AbsoluteFill>
  );
};

const SvgDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="fcbRed"><feColorMatrix type="matrix" values="0.65 0 0 0 0.05  0 0 0 0 0  0 0 0.27 0 0  0 0 0 1 0" /></filter>
    <filter id="fcbBlue"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0.3 0 0 0  0 0 0.6 0 0.05  0 0 0 1 0" /></filter>
  </svg>
);

const Sound: React.FC = () => {
  const hits = [B(36), B(108)];
  const whooshes = [B(12), B(18), B(24), B(28), B(48), B(56), B(60), B(72), B(76), B(80), B(84), B(96), B(102)];
  return (
    <>
      <Audio src={staticFile("fcb/music.wav")} volume={(f) => interpolate(f, [s(56.8), s(58.3)], [1, 0], CL)} />
      {hits.map((h) => <Sequence key={`i${h}`} from={s(h) - 1}><Audio src={staticFile("jb/impact.wav")} volume={0.7} /></Sequence>)}
      {whooshes.map((w) => <Sequence key={`w${w}`} from={Math.max(0, s(w) - 4)}><Audio src={staticFile("jb/whoosh.wav")} volume={0.35} /></Sequence>)}
      <Sequence from={s(B(30))} durationInFrames={s(3)}><Audio src={staticFile("jb/riser.wav")} volume={0.45} /></Sequence>
      <Sequence from={s(B(48))} durationInFrames={s(6)}><Audio src={staticFile("jb/crowd_amb.wav")} volume={(f) => interpolate(f, [0, 15, 150, 180], [0, 0.4, 0.4, 0], CL)} /></Sequence>
    </>
  );
};

export const BarcaParcours: React.FC = () => (
  <AbsoluteFill style={{ background: DEEP }}>
    <SvgDefs />
    <BeatPulse>
      {SCENES.map((sc) => (
        <Sequence key={sc.from} from={s(sc.from)} durationInFrames={s(sc.to) - s(sc.from)}>
          <Trans enter={sc.enter ?? "none"} exit={sc.to < 58}>{sc.el}</Trans>
        </Sequence>
      ))}
    </BeatPulse>
    <Grain />
    <Sound />
  </AbsoluteFill>
);

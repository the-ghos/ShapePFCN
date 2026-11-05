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
   ATLÉTICO DE MADRID – FC BARCELONE · teaser d'avant-match (9:16)
   Liga · dimanche 8 novembre 2026 · 20h00 GMT
   Musique : intro 0-10 s, montée 10-24.5 s, silence, BRAAM 27.54 s,
   puis un coup toutes les ~2.99 s, apogée 48-57 s.
   ============================================================ */

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-300-normal.woff2"), weight: "300" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Playfair", url: staticFile("fonts/playfair-italic.woff2"), weight: "400", style: "italic" });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const AB_TOTAL = s(60);

const DISPLAY = "Anton, Impact, sans-serif";
const SANS = "Montserrat, Arial, sans-serif";
const SERIF = "Playfair, Georgia, serif";
const ATL = "#d81e2a"; // rouge Atlético
const BAR = "#a50044"; // grenat Barça
const BAR2 = "#004d98"; // bleu Barça
const GOLD = "#f2c94c";
const SILVER = "linear-gradient(100deg,#8c8f96 0%,#ffffff 25%,#c9ccd2 40%,#ffffff 55%,#9a9da4 75%,#f4f4f6 100%)";

const BRAAM = 27.54;
const P = 2.988;
const HIT = (k: number) => BRAAM + k * P;
const END_HIT = 56.52;

/* ---------------- media helpers ---------------- */
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; style?: React.CSSProperties; pos?: string }> = ({
  src, trim = 0, rate = 1, zoom = [1.06, 1.0], style, pos = "50% 50%",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Video src={staticFile(`ab/c/${src}.mp4`)} trimBefore={s(trim)} playbackRate={rate} muted objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: pos, scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)), ...style }} />
    </AbsoluteFill>
  );
};

/* photo shown from the top, bottom faded to black (hides score graphics baked into the source images) */
const PhotoTop: React.FC<{ n: number; cut?: number; zoom?: [number, number]; x?: string; style?: React.CSSProperties }> = ({
  n, cut = 0.58, zoom = [1.05, 1.15], x = "50%", style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(`ab/img/${n}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.3)", scale: "1.3" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" }}>
        <Img src={staticFile(`ab/img/${n}.jpg`)}
          style={{
            position: "absolute", top: 0, left: "50%", width: 1300, translate: `-${x} 0px`,
            transformOrigin: `${x} 20%`, scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)),
            maskImage: `linear-gradient(180deg, black ${cut * 100 - 14}%, transparent ${cut * 100}%)`,
            WebkitMaskImage: `linear-gradient(180deg, black ${cut * 100 - 14}%, transparent ${cut * 100}%)`,
            ...style,
          }} />
      </div>
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ n: number; zoom?: [number, number]; pos?: string; style?: React.CSSProperties }> = ({ n, zoom = [1.04, 1.16], pos = "50% 35%", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(`ab/img/${n}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.4)", scale: "1.3" }} />
      <Img src={staticFile(`ab/img/${n}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)), ...style }} />
    </AbsoluteFill>
  );
};

/* ---------------- scene wrapper with transitions ---------------- */
type Tr = "none" | "fade" | "zoom" | "whipL" | "whipR" | "black" | "glitch" | "punch" | "spin";
type Grade = "bw" | "cool" | "warm" | "bw2color" | "red" | "blue" | "none";
const Scene: React.FC<{ children: React.ReactNode; enter?: Tr; exit?: Tr; grade?: Grade }> = ({ children, enter = "none", exit = "none", grade = "warm" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const pi = interpolate(frame, [0, 9], [0, 1], { ...CL, easing: OUT });
  const po = interpolate(frame, [d - 7, d], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  let tx = 0, sc = 1, blur = 0, op = 1, rot = 0;
  if (enter === "fade") op *= pi;
  if (enter === "black") op *= interpolate(frame, [0, 6], [0, 1], CL);
  if (enter === "zoom") { sc *= interpolate(pi, [0, 1], [1.4, 1]); blur += (1 - pi) * 16; }
  if (enter === "punch") sc *= interpolate(pi, [0, 1], [1.2, 1]);
  if (enter === "whipL") { tx += (1 - pi) * 1080; blur += (1 - pi) * 30; }
  if (enter === "whipR") { tx -= (1 - pi) * 1080; blur += (1 - pi) * 30; }
  if (enter === "spin") { rot += (1 - pi) * -12; sc *= interpolate(pi, [0, 1], [1.5, 1]); blur += (1 - pi) * 20; }
  if (exit === "fade") op *= 1 - po;
  if (exit === "black") op *= 1 - interpolate(frame, [d - 5, d], [0, 1], CL);
  if (exit === "zoom") { sc *= interpolate(po, [0, 1], [1, 1.35]); blur += po * 14; }
  if (exit === "whipL") { tx -= po * 1080; blur += po * 30; }
  if (exit === "whipR") { tx += po * 1080; blur += po * 30; }
  if (exit === "spin") { rot += po * 12; sc *= interpolate(po, [0, 1], [1, 1.5]); blur += po * 20; }
  const filters: Record<Grade, string> = {
    bw: "grayscale(1) contrast(1.3) brightness(0.9)",
    bw2color: `grayscale(${interpolate(frame, [0, d * 0.75], [1, 0], CL)}) contrast(1.15)`,
    cool: "saturate(0.8) contrast(1.12) brightness(0.95)",
    warm: "saturate(1.1) contrast(1.1)",
    red: "saturate(1.15) contrast(1.12)",
    blue: "saturate(1.1) contrast(1.12)",
    none: "",
  };
  const tint = grade === "red" ? "rgba(216,30,42,0.35)" : grade === "blue" ? "rgba(0,77,152,0.38)" : null;
  const glitchOn = (enter === "glitch" && frame < 6) || (exit === "glitch" && frame > d - 6);
  return (
    <AbsoluteFill style={{ opacity: op, translate: `${tx}px 0px`, scale: String(sc), rotate: `${rot}deg`, filter: `${filters[grade]} blur(${blur}px)`, background: "#000" }}>
      {children}
      {tint && <AbsoluteFill style={{ mixBlendMode: "soft-light", background: `linear-gradient(180deg, ${tint}, transparent 50%, ${tint})` }} />}
      {grade !== "bw" && !tint && (
        <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "linear-gradient(180deg, rgba(0,90,110,0.5) 0%, transparent 45%, rgba(255,140,40,0.3) 100%)" }} />
      )}
      {glitchOn && <GlitchSlices />}
    </AbsoluteFill>
  );
};

const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(10).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (random(`gx${i}${frame}`) - 0.5) * 180, top: random(`gy${i}${frame}`) * 1920, width: 1080, height: 20 + random(`gh${i}${frame}`) * 90, background: i % 2 ? "rgba(216,30,42,0.45)" : "rgba(0,77,152,0.45)", mixBlendMode: "screen" }} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- typography ---------------- */
const Rise: React.FC<{ children: React.ReactNode; at: number; dur?: number; style?: React.CSSProperties; out?: number }> = ({ children, at, dur = 14, style, out }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  const o = out ? interpolate(frame, [out, out + 8], [1, 0], CL) : 1;
  return (
    <div style={{ overflow: "hidden", paddingBottom: 10 }}>
      <div style={{ translate: `0px ${(1 - p) * 105}%`, opacity: p * o, ...style }}>{children}</div>
    </div>
  );
};

const Track: React.FC<{ text: string; at: number; size: number; from?: number; to?: number; style?: React.CSSProperties; font?: string; weight?: number }> = ({
  text, at, size, from = 0.05, to = 0.45, style, font = SANS, weight = 300,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 45], [0, 1], { ...CL, easing: OUT });
  return (
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: `${interpolate(p, [0, 1], [from, to])}em`, opacity: interpolate(frame, [at, at + 12], [0, 1], CL), filter: `blur(${(1 - Math.min(1, p * 3)) * 8}px)`, color: "#fff", textAlign: "center", whiteSpace: "nowrap", marginRight: `-${to}em`, textShadow: "0 4px 30px rgba(0,0,0,0.8)", ...style }}>
      {text}
    </div>
  );
};

const Metal: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1.08, paddingTop: size * 0.1, textTransform: "uppercase", backgroundImage: SILVER, backgroundSize: "260% 100%", backgroundPosition: `${(frame * 1.6) % 260}% 50%`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.8))", textAlign: "center", ...style }}>
      {children}
    </div>
  );
};

/* team-coloured pill */
const TeamTag: React.FC<{ team: "atl" | "bar"; at?: number; label?: string }> = ({ team, at = 4, label }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...CL, easing: OUT });
  const bg = team === "atl" ? `repeating-linear-gradient(90deg, ${ATL} 0 28px, #fff 28px 56px)` : `repeating-linear-gradient(90deg, ${BAR2} 0 28px, ${BAR} 28px 56px)`;
  return (
    <div style={{ position: "absolute", left: 60, top: 300, display: "flex", alignItems: "stretch", translate: `${(1 - p) * -700}px 0px` }}>
      <div style={{ width: 22, background: bg }} />
      <div style={{ background: "rgba(0,0,0,0.75)", padding: "12px 26px", fontFamily: DISPLAY, fontSize: 54, color: "#fff", letterSpacing: "0.04em" }}>
        {label ?? (team === "atl" ? "ATLÉTICO DE MADRID" : "FC BARCELONE")}
      </div>
    </div>
  );
};

/* broadcast score card */
const ScoreCard: React.FC<{ comp: string; date: string; home: string; away: string; hs: number; as: number; note?: string; win: "home" | "away"; at?: number }> = ({
  comp, date, home, away, hs, as, note, win, at = 4,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...CL, easing: OUT });
  const n1 = Math.round(interpolate(frame, [at + 6, at + 22], [0, hs], CL));
  const n2 = Math.round(interpolate(frame, [at + 6, at + 22], [0, as], CL));
  const col = (team: string) => (team.startsWith("ATL") ? ATL : BAR2);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
      <div style={{ opacity: p, translate: `0px ${(1 - p) * 80}px`, width: 940, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.3em", color: "#000", background: GOLD, padding: "8px 22px", marginRight: "-0.3em" }}>{comp}</div>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 26, letterSpacing: "0.3em", color: "#fff", margin: "12px 0 6px" }}>{date}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, background: "rgba(0,0,0,0.72)", padding: "14px 30px", borderTop: `4px solid ${GOLD}`, backdropFilter: "blur(6px)" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 56, color: "#fff", borderLeft: `10px solid ${col(home)}`, paddingLeft: 16, opacity: win === "home" ? 1 : 0.65 }}>{home}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 130, color: "#fff", lineHeight: 1 }}>{n1}<span style={{ color: GOLD, margin: "0 14px" }}>–</span>{n2}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 56, color: "#fff", borderRight: `10px solid ${col(away)}`, paddingRight: 16, opacity: win === "away" ? 1 : 0.65 }}>{away}</div>
        </div>
        {note && (
          <Rise at={at + 20}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.15em", color: GOLD, marginTop: 14, textAlign: "center" }}>{note}</div>
          </Rise>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- FX ---------------- */
const Shock: React.FC<{ at: number; color?: string }> = ({ at, color = "255,255,255" }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 22) return null;
  const p = interpolate(frame, [at, at + 22], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const r = 2600 * p;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - r / 2, top: 960 - r / 2, width: r, height: r, borderRadius: "50%", border: `${26 * (1 - p) + 2}px solid rgba(${color},${1 - p})`, boxShadow: `0 0 90px rgba(${color},${(1 - p) * 0.8})` }} />
    </AbsoluteFill>
  );
};

const Flare: React.FC<{ x?: number; y?: number }> = ({ x = 75, y = 18 }) => {
  const frame = useCurrentFrame();
  const fl = 0.75 + 0.25 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${0.75 * fl}) 0%, rgba(180,210,255,${0.25 * fl}) 6%, transparent 22%)` }} />
      <div style={{ position: "absolute", left: 0, top: `${y}%`, width: "100%", height: 3, background: `linear-gradient(90deg, transparent, rgba(160,200,255,${0.6 * fl}) ${x}%, transparent)`, filter: "blur(2px)" }} />
    </AbsoluteFill>
  );
};

const Sparks: React.FC<{ color?: string; seed?: string; count?: number }> = ({ color = "255,200,120", seed = "sp", count = 50 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = (random(`${seed}x${i}`) * 1080 + Math.sin(frame / 12 + i) * 30) % 1080;
        const y = (random(`${seed}y${i}`) * 1920 - frame * (2 + random(`${seed}v${i}`) * 5) + 1920 * 4) % 1920;
        const sz = 2 + random(`${seed}s${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz * 3, borderRadius: 4, background: `rgba(${color},0.9)`, boxShadow: `0 0 10px rgba(${color},0.9)`, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 8 + i)) }} />;
      })}
    </AbsoluteFill>
  );
};

/* diagonal team-colour split with names */
const ColorSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 12], [0, 1], { ...CL, easing: OUT });
  const b = interpolate(frame, [8, 20], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ clipPath: "polygon(0 0, 100% 0, 100% 42%, 0 58%)", translate: `${(1 - a) * -1100}px 0px`, background: `repeating-linear-gradient(90deg, ${ATL} 0 90px, #f4f4f4 90px 180px)` }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.65))" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 520 }}>
          <Metal size={130}>ATLÉTICO</Metal>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.5em", color: "#fff", marginRight: "-0.5em" }}>DE MADRID</div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "polygon(0 60%, 100% 44%, 100% 100%, 0 100%)", translate: `${(1 - b) * 1100}px 0px`, background: `repeating-linear-gradient(90deg, ${BAR2} 0 90px, ${BAR} 90px 180px)` }}>
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.6))" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 560 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.5em", color: "#fff", marginRight: "-0.5em" }}>FC</div>
          <Metal size={130}>BARCELONE</Metal>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 120, color: GOLD, rotate: "-8deg", scale: String(interpolate(frame, [14, 22], [3, 1], { ...CL, easing: Easing.out(Easing.back(2)) })), opacity: interpolate(frame, [14, 18], [0, 1], CL), textShadow: "0 0 40px rgba(0,0,0,0.9)" }}>VS</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= SCENES ================= */
const Open: React.FC = () => (
  <>
    <Clip src="stairs" rate={0.9} zoom={[1.15, 1.02]} />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
      <Track text="LE CHOC" at={20} size={120} font={DISPLAY} weight={400} from={0.6} to={0.25} />
      <Track text="DE LA LIGA" at={34} size={34} weight={600} from={0.2} to={0.6} style={{ color: GOLD }} />
    </AbsoluteFill>
  </>
);

const Brawl: React.FC = () => (
  <>
    <Photo n={14} zoom={[1.2, 1.05]} pos="45% 40%" />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 400 }}>
      <Track text="RIEN N'EST JAMAIS SIMPLE" at={6} size={40} weight={600} from={0.05} to={0.3} />
    </AbsoluteFill>
  </>
);


const HeartFlash: React.FC = () => {
  const items: React.ReactNode[] = [
    <Photo key="a" n={9} zoom={[1.1, 1.0]} pos="50% 40%" />,
    <PhotoTop key="b" n={7} cut={0.95} zoom={[1.1, 1.2]} />,
    <Clip key="c" src="facecover" rate={0.8} />,
    <Photo key="d" n={1} zoom={[1.0, 1.08]} pos="50% 75%" />,
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {items.map((el, i) => (
        <Sequence key={i} from={i * 19} durationInFrames={19} layout="none">
          <HeartWrap>{el}</HeartWrap>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
const HeartWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: frame >= 15 ? 0 : 1, scale: String(1.1 - frame * 0.005) }}>{children}</AbsoluteFill>;
};

const Silence: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [s(0.4), s(2.6)], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(216,30,42,${0.18 * glow}) 0%, transparent 45%)` }} />
      <Track text="DIMANCHE" at={s(0.3)} size={56} weight={300} from={1} to={0.5} />
      <Track text="METROPOLITANO" at={s(1.0)} size={92} font={DISPLAY} weight={400} from={0.6} to={0.12} />
    </AbsoluteFill>
  );
};

/* BRAAM — footage only inside the letters */
const TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [s(1.7), s(2.6)], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const pop = interpolate(frame, [0, 8], [1.6, 1], { ...CL, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ isolation: "isolate", background: "#000" }}>
      <Clip src="dribble10" trim={1} rate={1.2} zoom={[1.1, 1.0]} />
      <AbsoluteFill style={{ background: "#000", mixBlendMode: "multiply", justifyContent: "center", alignItems: "center", opacity: 1 - open }}>
        <div style={{ scale: String(pop * interpolate(open, [0, 1], [1, 3])), display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.92 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 250, color: "#fff" }}>ATLÉTICO</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 110, color: "#fff" }}>×</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 290, color: "#fff" }}>BARÇA</div>
        </div>
      </AbsoluteFill>
      <Shock at={0} />
    </AbsoluteFill>
  );
};

const VsFaceOff: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 12], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden", translate: `${(1 - a) * -1080}px 0px` }}>
        <PhotoTop n={10} cut={0.62} zoom={[1.05, 1.15]} />
        <AbsoluteFill style={{ background: `linear-gradient(0deg, ${ATL}cc, transparent 45%)` }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden", translate: `${(1 - a) * 1080}px 0px` }}>
        <Clip src="b_smile" rate={0.6} zoom={[1.0, 1.08]} pos="50% 20%" />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BAR2}cc, transparent 45%)` }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 952, width: 1080, height: 16, background: GOLD, boxShadow: `0 0 30px ${GOLD}` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#000", padding: "6px 40px", border: `3px solid ${GOLD}`, scale: String(interpolate(frame, [10, 18], [2.5, 1], { ...CL, easing: Easing.out(Easing.back(2)) })), opacity: interpolate(frame, [10, 14], [0, 1], CL) }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 64, color: "#fff", letterSpacing: "0.04em" }}>QUI FRAPPERA EN PREMIER ?</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DateCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Photo n={1} zoom={[1.02, 1.14]} pos="50% 75%" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.85))" }} />
      <Sparks color="255,210,130" seed="dc" count={40} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 280 }}>
        <Track text="LIGA" at={2} size={34} weight={600} from={0.2} to={0.7} style={{ color: GOLD }} />
        <div style={{ height: 14 }} />
        <Rise at={6}><Metal size={150}>DIMANCHE</Metal></Rise>
        <Rise at={12}><div style={{ fontFamily: DISPLAY, fontSize: 230, color: "#fff", lineHeight: 0.95, textShadow: "0 10px 40px #000" }}>08 NOV.</div></Rise>
        <Rise at={20}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: "0.2em", color: "#000", background: GOLD, padding: "6px 30px", marginTop: 10, scale: String(1 + 0.03 * Math.sin(frame / 4)) }}>20H00 GMT</div>
        </Rise>
      </AbsoluteFill>
    </>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [s(3.0), s(3.45)], [1, 0], CL);
  const p = interpolate(frame, [0, 10], [1.5, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fade }}>
      <AbsoluteFill style={{ clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 60%)", background: `repeating-linear-gradient(90deg, ${ATL} 0 90px, #f4f4f4 90px 180px)`, opacity: 0.35 }} />
      <AbsoluteFill style={{ clipPath: "polygon(0 60%, 100% 40%, 100% 100%, 0 100%)", background: `repeating-linear-gradient(90deg, ${BAR2} 0 90px, ${BAR} 90px 180px)`, opacity: 0.35 }} />
      <Sparks seed="end" count={60} />
      <Shock at={0} color="242,201,76" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 220 }}>
        <div style={{ scale: String(p), display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.95 }}>
          <Metal size={170}>ATLÉTICO</Metal>
          <div style={{ fontFamily: DISPLAY, fontSize: 80, color: GOLD }}>×</div>
          <Metal size={190}>BARÇA</Metal>
        </div>
        <Rise at={12}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: "0.25em", color: "#fff", marginTop: 20, textAlign: "center" }}>DIMANCHE 08.11 · 20H00 GMT</div>
        </Rise>
        <Rise at={20}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 46, color: GOLD, marginTop: 10, textAlign: "center" }}>Ça va être énorme.</div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= GLOBAL LAYERS ================= */
const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  let h = interpolate(frame, [0, 40], [960, 140], { ...CL, easing: OUT });
  const b = s(BRAAM);
  h += interpolate(frame, [b - 4, b, b + 18], [0, 70, 0], CL);
  h = Math.max(h, interpolate(frame, [s(59.2), s(60)], [140, 960], CL));
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: 1080, height: h, background: "#000" }} />
    </>
  );
};

const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [s(1), s(1.8)], [0, 1], CL) * interpolate(frame, [s(56.3), s(56.6)], [1, 0], CL);
  const dot = 0.4 + 0.6 * Math.abs(Math.sin(frame / 12));
  return (
    <div style={{ position: "absolute", top: 160, left: 50, right: 50, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff2b3a", opacity: dot, boxShadow: "0 0 12px #ff2b3a" }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.3em", color: "#fff" }}>AVANT-MATCH</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, fontFamily: SANS, fontWeight: 800, fontSize: 22, color: "#fff" }}>
        <div style={{ background: ATL, padding: "4px 10px" }}>ATM</div>
        <div style={{ background: "rgba(0,0,0,0.7)", padding: "4px 10px", color: GOLD }}>08.11 · 20H</div>
        <div style={{ background: BAR2, padding: "4px 10px" }}>FCB</div>
      </div>
    </div>
  );
};

const CUTS = [4.06, 6.06, 8.0, 10.08, 13.05, 16.0, 19.0, 21.5, 24.5, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(HIT), END_HIT];
const BIG = [BRAAM, HIT(1), HIT(3), HIT(4), HIT(6), HIT(8), END_HIT];

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  let w = 0;
  for (const c of BIG) if (frame >= s(c)) w = Math.max(w, Math.exp(-(frame - s(c)) / 3));
  for (const c of CUTS) if (frame >= s(c)) w = Math.max(w, (c > BRAAM ? 0.45 : 0.22) * Math.exp(-(frame - s(c)) / 2));
  return <AbsoluteFill style={{ background: "#fff", opacity: w }} />;
};

const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  let a = 0;
  for (const c of BIG) if (frame >= s(c)) a = Math.max(a, 26 * Math.exp(-(frame - s(c)) / 5));
  for (const c of [HIT(2), HIT(5), HIT(7), HIT(9)]) if (frame >= s(c)) a = Math.max(a, 12 * Math.exp(-(frame - s(c)) / 4));
  return <AbsoluteFill style={{ translate: `${(random(`sx${frame}`) - 0.5) * 2 * a}px ${(random(`sy${frame}`) - 0.5) * 2 * a}px`, scale: String(1 + a / 500) }}>{children}</AbsoluteFill>;
};

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 48%, transparent 50%, rgba(0,0,0,0.8) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.1, mixBlendMode: "overlay" }}>
        <svg width={1080} height={1920}>
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 10} /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

const Handle: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], { ...CL, easing: OUT });
  const big = interpolate(frame, [s(END_HIT - HIT(7)), s(END_HIT - HIT(7)) + 12], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: interpolate(big, [0, 1], [166, 290]) }}>
      <div style={{ opacity: p, translate: `0px ${(1 - p) * 60}px`, scale: String(interpolate(big, [0, 1], [1, 1.3])), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", padding: "10px 30px", border: `1.5px solid ${GOLD}`, background: "rgba(0,0,0,0.55)", borderRadius: 999 }}>@viber.flow4</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: GOLD }}>#atletico #barça #laliga #viberflow4</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================= AUDIO ================= */
/* voice lines: [start s, duration s] — filled once the voice-over exists */
export const AB_VO: [number, number][] = [];

const musicVol = (fr: number) => {
  let duck = 0;
  for (const [a, d] of AB_VO) duck = Math.max(duck, interpolate(fr, [s(a) - 6, s(a), s(a + d), s(a + d) + 8], [0, 1, 1, 0], CL));
  return (1 - 0.42 * duck) * interpolate(fr, [s(59.2), s(60)], [1, 0], CL);
};
const crowdVol = (fr: number) => {
  const t = fr / FPS;
  if (t < 24.5) return interpolate(t, [0, 3, 24, 24.5], [0, 0.25, 0.45, 0], CL);
  if (t < BRAAM) return 0;
  return interpolate(t, [BRAAM, BRAAM + 0.3, 58.5, 60], [0, 0.4, 0.35, 0], CL);
};

const Sound: React.FC = () => (
  <>
    <Audio src={staticFile("jb/music.wav")} volume={musicVol} />
    <Audio src={staticFile("jb/crowd_amb.wav")} volume={crowdVol} loop />
    {AB_VO.map(([a, d], i) => (
      <Sequence key={`vo${i}`} from={s(a)} durationInFrames={s(d) + 6}>
        <Audio src={staticFile(`ab/vo/l${i}.wav`)} volume={1.1} />
      </Sequence>
    ))}
    {[21.5, 22.13, 22.76, 23.4, 24.9, 25.8, 26.7].map((t, i) => (
      <Sequence key={`hb${i}`} from={s(t)} durationInFrames={30}>
        <Audio src={staticFile("jb/heartbeat.wav")} volume={t > 24 ? 0.9 : 0.55} />
      </Sequence>
    ))}
    <Sequence from={s(21.4)} durationInFrames={s(3.1)}><Audio src={staticFile("jb/riser.wav")} volume={0.35} /></Sequence>
    {[BRAAM, END_HIT, HIT(4)].map((t, i) => (
      <Sequence key={`im${i}`} from={s(t)} durationInFrames={48}><Audio src={staticFile("jb/impact.wav")} volume={0.6} /></Sequence>
    ))}
    {[4.06, 8.0, 10.08, 13.05, 16.0, 19.0, HIT(1), HIT(2), HIT(3), HIT(5), HIT(6), HIT(7), HIT(8), HIT(9)].map((t, i) => (
      <Sequence key={`wh${i}`} from={Math.max(0, s(t) - 9)} durationInFrames={24}><Audio src={staticFile("jb/whoosh.wav")} volume={0.35} /></Sequence>
    ))}
  </>
);

/* ================= TIMELINE ================= */
type Shot = { from: number; to: number; el: React.ReactNode; enter?: Tr; exit?: Tr; grade?: Grade; name: string };
const SHOTS: Shot[] = [
  { name: "Ouverture tunnel", from: 0, to: 4.06, el: <Open />, grade: "bw", enter: "fade", exit: "black" },
  { name: "Atlético vs Barça", from: 4.06, to: 8.0, el: <ColorSplit />, grade: "none", exit: "zoom" },
  { name: "Tension", from: 8.0, to: 10.08, el: <><Brawl /></>, grade: "bw2color", enter: "zoom", exit: "whipL" },
  { name: "Copa aller 4-0", from: 10.08, to: 13.05, el: <><PhotoTop n={16} cut={0.6} /><ScoreCard comp="COUPE DU ROI · DEMI ALLER" date="12 FÉVRIER 2026" home="ATLÉTICO" away="BARÇA" hs={4} as={0} win="home" /></>, grade: "red", enter: "whipL", exit: "glitch" },
  { name: "Copa retour 3-0", from: 13.05, to: 16.0, el: <><PhotoTop n={17} cut={0.62} /><ScoreCard comp="COUPE DU ROI · DEMI RETOUR" date="3 MARS 2026" home="BARÇA" away="ATLÉTICO" hs={3} as={0} win="home" note="ATLÉTICO QUALIFIÉ (4-3)" /></>, grade: "blue", enter: "glitch", exit: "whipR" },
  { name: "LDC aller 0-2", from: 16.0, to: 19.0, el: <><PhotoTop n={10} cut={0.62} /><ScoreCard comp="LIGUE DES CHAMPIONS · QUART ALLER" date="AVRIL 2026" home="BARÇA" away="ATLÉTICO" hs={0} as={2} win="away" /></>, grade: "red", enter: "whipR", exit: "glitch" },
  { name: "LDC retour 1-2", from: 19.0, to: 21.5, el: <><PhotoTop n={15} cut={0.68} /><ScoreCard comp="LIGUE DES CHAMPIONS · QUART RETOUR" date="14 AVRIL 2026" home="ATLÉTICO" away="BARÇA" hs={1} as={2} win="away" note="ATLÉTICO QUALIFIÉ (3-2)" /></>, grade: "warm", enter: "glitch" },
  { name: "Pulsations", from: 21.5, to: 24.5, el: <HeartFlash />, grade: "bw", exit: "black" },
  { name: "Silence", from: 24.5, to: BRAAM, el: <Silence />, grade: "none" },
  { name: "BRAAM titre", from: BRAAM, to: HIT(1), el: <TitleReveal />, grade: "warm" },
  { name: "Atlético but", from: HIT(1), to: HIT(2), el: <><Clip src="atl_goal" rate={1.8} zoom={[1.0, 1.1]} /><TeamTag team="atl" /></>, grade: "red", enter: "punch", exit: "whipL" },
  { name: "Atlético rage", from: HIT(2), to: HIT(3), el: <><Clip src="atl_celeb" rate={0.65} zoom={[1.05, 1.2]} pos="50% 30%" /><AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}><Track text="LA RAGE" at={6} size={140} font={DISPLAY} weight={400} from={0.4} to={0.12} /><Track text="DU CHOLO" at={16} size={40} weight={600} from={0.2} to={0.55} style={{ color: GOLD }} /></AbsoluteFill></>, grade: "red", enter: "whipL", exit: "spin" },
  { name: "Barça dribble", from: HIT(3), to: HIT(4), el: <><Clip src="dribble10" rate={2.2} zoom={[1.0, 1.1]} /><TeamTag team="bar" /></>, grade: "blue", enter: "spin", exit: "whipR" },
  { name: "Barça but", from: HIT(4), to: HIT(5), el: <><Clip src="goal10" trim={2.2} rate={1.35} zoom={[1.0, 1.12]} /><Shock at={s(1.6)} /></>, grade: "blue", enter: "whipR", exit: "glitch" },
  { name: "Insolence", from: HIT(5), to: HIT(6), el: <BarcaMontage />, grade: "blue", enter: "glitch", exit: "zoom" },
  { name: "Face-à-face", from: HIT(6), to: HIT(7), el: <VsFaceOff />, grade: "warm", enter: "zoom" },
  { name: "Banc", from: HIT(7), to: HIT(8), el: <><Clip src="coach_celeb" rate={1.0} zoom={[1.15, 1.05]} pos="50% 40%" /><Flare x={70} y={12} /></>, grade: "warm", enter: "punch", exit: "whipL" },
  { name: "Date", from: HIT(8), to: HIT(9), el: <DateCard />, grade: "warm", enter: "whipL", exit: "zoom" },
  { name: "Tunnel final", from: HIT(9), to: END_HIT, el: <><Clip src="stairs" trim={4} rate={1.2} zoom={[1.0, 1.15]} /><AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}><Track text="ÇA VA ÊTRE ÉNORME" at={4} size={64} font={DISPLAY} weight={400} from={0.4} to={0.08} /></AbsoluteFill></>, grade: "cool", enter: "zoom" },
  { name: "Carton final", from: END_HIT, to: 60, el: <EndCard />, grade: "none" },
];

function BarcaMontage() {
  const items = ["b_shot", "b_flag", "b_smile", "b_face"];
  const seg = Math.floor(s(P) / items.length);
  return (
    <AbsoluteFill>
      {items.map((it, i) => (
        <Sequence key={it} from={i * seg} durationInFrames={i === items.length - 1 ? s(P) - seg * 3 : seg} layout="none">
          <Clip src={it} rate={0.8} zoom={[1.12, 1.0]} pos="50% 30%" />
        </Sequence>
      ))}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
        <Track text="L'INSOLENCE" at={4} size={120} font={DISPLAY} weight={400} from={0.4} to={0.1} />
        <Track text="DE LA JEUNESSE" at={14} size={36} weight={600} from={0.2} to={0.55} style={{ color: GOLD }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const AtletiBarca: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Shake>
      {SHOTS.map((sh) => (
        <Sequence key={sh.name} name={sh.name} from={s(sh.from)} durationInFrames={s(sh.to) - s(sh.from)}>
          <Scene enter={sh.enter} exit={sh.exit} grade={sh.grade}>{sh.el}</Scene>
        </Sequence>
      ))}
    </Shake>
    <Flash />
    <Finish />
    <Letterbox />
    <Bug />
    <Sequence from={s(HIT(7))} name="Handle"><Handle /></Sequence>
    <Sound />
  </AbsoluteFill>
);

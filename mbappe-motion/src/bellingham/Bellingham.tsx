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
   JUDE BELLINGHAM — teaser d'avant-match cinématique (9:16)
   Musique orchestrale : intro 0-10 s, montée 10-24.5 s,
   silence 24.5-27.5 s, BRAAM 27.54 s, coups toutes les ~2.99 s.
   ============================================================ */

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-300-normal.woff2"), weight: "300" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Playfair", url: staticFile("fonts/playfair-italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: "Playfair", url: staticFile("fonts/playfair-700.woff2"), weight: "700" });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const JB_TOTAL = s(60);

const DISPLAY = "Anton, Impact, sans-serif";
const SANS = "Montserrat, Arial, sans-serif";
const SERIF = "Playfair, Georgia, serif";
const GOLD = "#e7c77a";
const SILVER =
  "linear-gradient(100deg,#8c8f96 0%,#ffffff 25%,#c9ccd2 40%,#ffffff 55%,#9a9da4 75%,#f4f4f6 100%)";
const GOLDGRAD =
  "linear-gradient(100deg,#8a6420 0%,#f6e3a8 25%,#c9a24e 45%,#fff2c8 58%,#a87b2c 80%,#e9cf86 100%)";

/* ---------- music grid ---------- */
const BRAAM = 27.54;
const P = 2.988;
const HIT = (k: number) => BRAAM + k * P; // k=0 braam, 1=30.53, 2=33.52 ...
const END_HIT = 56.52;

/* ---------- helpers ---------- */
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; style?: React.CSSProperties; pos?: string }> = ({
  src,
  trim = 0,
  rate = 1,
  zoom = [1.06, 1.0],
  style,
  pos = "50% 50%",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Video
        src={staticFile(`jb/c/${src}.mp4`)}
        trimBefore={s(trim)}
        playbackRate={rate}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          objectPosition: pos,
          scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)),
          ...style,
        }}
      />
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ n: number; zoom?: [number, number]; pan?: [number, number]; pos?: string; style?: React.CSSProperties }> = ({
  n,
  zoom = [1.04, 1.16],
  pan = [0, 0],
  pos = "50% 35%",
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {/* blurred fill so non-9:16 photos never show bars */}
      <Img
        src={staticFile(`jb/img/${n}.jpg`)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.45)", scale: "1.3" }}
      />
      <Img
        src={staticFile(`jb/img/${n}.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)),
          translate: `${interpolate(frame, [0, durationInFrames], pan, CL)}px 0px`,
          ...style,
        }}
      />
    </AbsoluteFill>
  );
};

/* Scene wrapper: colour grade + entry/exit transitions */
type Tr = "none" | "fade" | "zoom" | "whipL" | "whipR" | "black" | "glitch" | "punch";
const Scene: React.FC<{ children: React.ReactNode; enter?: Tr; exit?: Tr; grade?: "bw" | "cool" | "warm" | "bw2color" | "none" }> = ({
  children,
  enter = "none",
  exit = "none",
  grade = "warm",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const pi = interpolate(frame, [0, 9], [0, 1], { ...CL, easing: OUT });
  const po = interpolate(frame, [d - 7, d], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  let tx = 0, sc = 1, blur = 0, op = 1;
  if (enter === "fade") op *= pi;
  if (enter === "black") op *= interpolate(frame, [0, 6], [0, 1], CL);
  if (enter === "zoom") { sc *= interpolate(pi, [0, 1], [1.35, 1]); blur += (1 - pi) * 16; }
  if (enter === "punch") { sc *= interpolate(pi, [0, 1], [1.18, 1]); }
  if (enter === "whipL") { tx += (1 - pi) * 1080; blur += (1 - pi) * 30; }
  if (enter === "whipR") { tx -= (1 - pi) * 1080; blur += (1 - pi) * 30; }
  if (exit === "fade") op *= 1 - po;
  if (exit === "black") op *= 1 - interpolate(frame, [d - 5, d], [0, 1], CL);
  if (exit === "zoom") { sc *= interpolate(po, [0, 1], [1, 1.3]); blur += po * 14; }
  if (exit === "whipL") { tx -= po * 1080; blur += po * 30; }
  if (exit === "whipR") { tx += po * 1080; blur += po * 30; }
  let filter = "";
  if (grade === "bw") filter = "grayscale(1) contrast(1.25) brightness(0.92)";
  if (grade === "bw2color")
    filter = `grayscale(${interpolate(frame, [0, d * 0.75], [1, 0], CL)}) contrast(1.15)`;
  if (grade === "cool") filter = "saturate(0.75) contrast(1.12) brightness(0.95) hue-rotate(-6deg)";
  if (grade === "warm") filter = "saturate(1.08) contrast(1.1)";
  const glitchOn = (enter === "glitch" && frame < 6) || (exit === "glitch" && frame > d - 6);
  return (
    <AbsoluteFill style={{ opacity: op, translate: `${tx}px 0px`, scale: String(sc), filter: `${filter} blur(${blur}px)`, background: "#000" }}>
      {children}
      {glitchOn && <GlitchSlices />}
      {grade !== "bw" && (
        <AbsoluteFill
          style={{
            mixBlendMode: "soft-light",
            background: "linear-gradient(180deg, rgba(0,90,110,0.55) 0%, rgba(0,0,0,0) 45%, rgba(255,140,40,0.35) 100%)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(9).fill(0).map((_, i) => {
        const y = random(`gy${i}${frame}`) * 1920;
        const h = 20 + random(`gh${i}${frame}`) * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (random(`gx${i}${frame}`) - 0.5) * 160,
              top: y,
              width: 1080,
              height: h,
              background: i % 2 ? "rgba(255,40,80,0.35)" : "rgba(40,220,255,0.35)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- typography ---------- */
const Rise: React.FC<{ children: React.ReactNode; at: number; dur?: number; style?: React.CSSProperties; out?: number }> = ({
  children,
  at,
  dur = 14,
  style,
  out,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  const o = out ? interpolate(frame, [out, out + 8], [1, 0], CL) : 1;
  return (
    <div style={{ overflow: "hidden", paddingBottom: 10 }}>
      <div style={{ translate: `0px ${(1 - p) * 105}%`, opacity: p * o, ...style }}>{children}</div>
    </div>
  );
};

/* letters spread from tight to wide tracking */
const Track: React.FC<{ text: string; at: number; size: number; from?: number; to?: number; style?: React.CSSProperties; font?: string; weight?: number }> = ({
  text,
  at,
  size,
  from = 0.05,
  to = 0.45,
  style,
  font = SANS,
  weight = 300,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 45], [0, 1], { ...CL, easing: OUT });
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: `${interpolate(p, [0, 1], [from, to])}em`,
        opacity: interpolate(frame, [at, at + 12], [0, 1], CL),
        filter: `blur(${(1 - Math.min(1, p * 3)) * 8}px)`,
        color: "#fff",
        textAlign: "center",
        whiteSpace: "nowrap",
        marginRight: `-${to}em`,
        textShadow: "0 4px 30px rgba(0,0,0,0.7)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const Metal: React.FC<{ children: React.ReactNode; size: number; gold?: boolean; style?: React.CSSProperties }> = ({ children, size, gold, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 1.08,
        paddingTop: size * 0.1,
        textTransform: "uppercase",
        backgroundImage: gold ? GOLDGRAD : SILVER,
        backgroundSize: "260% 100%",
        backgroundPosition: `${(frame * 1.6) % 260}% 50%`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.75))",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* broadcast-style lower third */
const LowerThird: React.FC<{ kicker: string; title: string; sub?: string; at?: number; bottom?: number }> = ({ kicker, title, sub, at = 4, bottom = 330 }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [at, at + 14], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 70px ${bottom}px` }}>
      <div style={{ width: 120 * line, height: 4, background: GOLD, marginBottom: 14, boxShadow: `0 0 18px ${GOLD}` }} />
      <Rise at={at + 3}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: "0.35em", color: GOLD }}>{kicker}</div>
      </Rise>
      <Rise at={at + 7}>
        <div style={{ fontFamily: DISPLAY, fontSize: 92, color: "#fff", lineHeight: 1.05, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{title}</div>
      </Rise>
      {sub && (
        <Rise at={at + 12}>
          <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: "0.18em", color: "#fff", opacity: 0.9 }}>{sub}</div>
        </Rise>
      )}
    </AbsoluteFill>
  );
};

const Poem: React.FC<{ text: string; at: number; out?: number; size?: number; y?: string }> = ({ text, at, out, size = 54, y = "flex-end" }) => (
  <AbsoluteFill style={{ justifyContent: y, alignItems: "center", padding: y === "flex-start" ? "300px 80px 0" : "0 80px 430px" }}>
    <Rise at={at} dur={20} out={out}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: size, color: "#fff", textAlign: "center", lineHeight: 1.25, textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
        {text}
      </div>
    </Rise>
  </AbsoluteFill>
);

/* ---------- FX layers ---------- */
const LightSweep: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 40 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = interpolate(frame, [at, at + dur], [0, 1], CL);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: Math.sin(p * Math.PI) * 0.9,
        background: `radial-gradient(ellipse 60% 35% at ${-10 + p * 120}% ${20 + p * 25}%, rgba(255,200,120,0.95), rgba(255,120,30,0.35) 45%, transparent 70%)`,
      }}
    />
  );
};

const Flare: React.FC<{ x?: number; y?: number }> = ({ x = 75, y = 18 }) => {
  const frame = useCurrentFrame();
  const fl = 0.75 + 0.25 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${0.75 * fl}) 0%, rgba(180,210,255,${0.25 * fl}) 6%, transparent 22%)` }} />
      <div style={{ position: "absolute", left: 0, top: `${y}%`, width: "100%", height: 3, background: `linear-gradient(90deg, transparent, rgba(160,200,255,${0.6 * fl}) ${x}%, transparent)`, filter: "blur(2px)" }} />
    </AbsoluteFill>
  );
};

const Dust: React.FC<{ count?: number; seed?: string }> = ({ count = 40, seed = "d" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = (random(`${seed}x${i}`) * 1080 + frame * (0.3 + random(`${seed}v${i}`))) % 1080;
        const y = (random(`${seed}y${i}`) * 1920 - frame * (0.4 + random(`${seed}w${i}`) * 0.8) + 1920 * 3) % 1920;
        const sz = 2 + random(`${seed}s${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: "rgba(255,235,200,0.8)", filter: "blur(1px)", opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 15 + i)) }} />;
      })}
    </AbsoluteFill>
  );
};

const Shock: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 22) return null;
  const p = interpolate(frame, [at, at + 22], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const r = 2600 * p;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 540 - r / 2, top: 960 - r / 2, width: r, height: r, borderRadius: "50%", border: `${26 * (1 - p) + 2}px solid rgba(255,255,255,${1 - p})`, boxShadow: `0 0 90px rgba(231,199,122,${(1 - p) * 0.9})` }} />
    </AbsoluteFill>
  );
};

/* ============================ SCENES ============================ */

const ColdOpen: React.FC = () => (
  <>
    <Clip src="boots" rate={0.85} zoom={[1.15, 1.02]} />
    <Poem text="Il y a des soirs…" at={12} out={100} size={64} />
  </>
);

const Back5: React.FC = () => (
  <>
    <Clip src="back5" rate={0.8} zoom={[1.2, 1.05]} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 70 }}>
      <Track text="N° 5" at={8} size={80} font={DISPLAY} weight={400} from={0} to={0.3} />
    </AbsoluteFill>
  </>
);

const LookUp: React.FC = () => <Clip src="lookup" rate={0.85} zoom={[1.0, 1.12]} pos="50% 30%" />;

const Tunnel: React.FC = () => (
  <>
    <Clip src="tunnel" trim={1.4} rate={1.0} zoom={[1.12, 1.0]} />
    <Flare x={50} y={40} />
  </>
);

const SuitID: React.FC = () => (
  <>
    <Clip src="suit" rate={0.9} zoom={[1.0, 1.14]} pos="50% 30%" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.85) 85%)" }} />
    <LowerThird kicker="JOUEUR À SUIVRE" title="JUDE BELLINGHAM" sub="MILIEU · REAL MADRID · N°5" at={6} />
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 70px 270px" }}>
      <Rise at={30}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", color: GOLD }}>NÉ LE 29.06.2003 · STOURBRIDGE (ENG)</div>
      </Rise>
    </AbsoluteFill>
  </>
);

const Arrival: React.FC = () => (
  <>
    <Photo n={1} zoom={[1.18, 1.04]} pan={[30, -30]} pos="50% 30%" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6), transparent 35%)" }} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
      <Track text="MADRID" at={6} size={120} font={DISPLAY} weight={400} from={0.6} to={0.25} />
      <Rise at={22}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: "0.3em", color: GOLD, marginTop: 6 }}>DEPUIS 2023</div>
      </Rise>
    </AbsoluteFill>
  </>
);

/* 3 vertical panels sliding in */
const Triptych: React.FC<{ items: { src: string; trim?: number; rate?: number }[]; horizontal?: boolean }> = ({ items, horizontal }) => {
  const frame = useCurrentFrame();
  const n = items.length;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {items.map((it, i) => {
        const p = interpolate(frame, [i * 5, i * 5 + 14], [0, 1], { ...CL, easing: OUT });
        const style: React.CSSProperties = horizontal
          ? { position: "absolute", left: 0, top: (1920 / n) * i + 4, width: 1080, height: 1920 / n - 8, translate: `${(i % 2 ? 1 : -1) * (1 - p) * 1100}px 0px` }
          : { position: "absolute", top: 0, left: (1080 / n) * i + 4, width: 1080 / n - 8, height: 1920, translate: `0px ${(i % 2 ? 1 : -1) * (1 - p) * 2000}px` };
        return (
          <div key={i} style={{ ...style, overflow: "hidden", boxShadow: "0 0 0 2px rgba(231,199,122,0.6)" }}>
            <Video src={staticFile(`jb/c/${it.src}.mp4`)} trimBefore={s(it.trim ?? 0)} playbackRate={it.rate ?? 1} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* heartbeat flash cuts */
const FLASH = [
  { t: "v3face", trim: 0.3 },
  { t: "englook", trim: 0.2 },
  { i: 11 },
  { t: "face2", trim: 0.8 },
  { i: 8 },
];
const HeartFrame: React.FC<{ it: (typeof FLASH)[number] }> = ({ it }) => {
  const frame = useCurrentFrame();
  const blackout = frame >= 12;
  return (
    <AbsoluteFill style={{ opacity: blackout ? 0 : 1, scale: String(1.12 - frame * 0.006) }}>
      {"t" in it && it.t ? (
        <Video src={staticFile(`jb/c/${it.t}.mp4`)} trimBefore={s(it.trim ?? 0)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
      ) : (
        <Img src={staticFile(`jb/img/${(it as { i: number }).i}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%" }} />
      )}
    </AbsoluteFill>
  );
};
const HeartCuts: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {FLASH.map((it, i) => (
      <Sequence key={i} from={i * 15} durationInFrames={15} layout="none">
        <HeartFrame it={it} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const Calm: React.FC = () => (
  <>
    <Clip src="portrait" rate={0.8} zoom={[1.05, 1.28]} pos="50% 35%" />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.75) 85%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <Track text="LE CALME" at={4} size={96} font={DISPLAY} weight={400} from={0.02} to={0.2} />
      <div style={{ height: 6 }} />
      <Track text="AVANT LA TEMPÊTE" at={26} size={44} from={0.1} to={0.4} />
    </AbsoluteFill>
  </>
);

const Silence: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [s(0.7), s(2.6)], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(231,199,122,${0.12 * glow}) 0%, transparent 45%)` }} />
      <Track text="JUDE" at={s(0.6)} size={150} font={DISPLAY} weight={400} from={0.9} to={0.35} style={{ opacity: 0.95 }} />
    </AbsoluteFill>
  );
};

/* BRAAM — video visible only inside the letters, then the mask opens */
const TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [s(1.6), s(2.5)], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const pop = interpolate(frame, [0, 8], [1.6, 1], { ...CL, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ isolation: "isolate", background: "#000" }}>
      <Clip src="skill1" rate={1.0} zoom={[1.1, 1.0]} />
      <AbsoluteFill style={{ background: "#000", mixBlendMode: "multiply", justifyContent: "center", alignItems: "center", opacity: 1 - open }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 196, color: "#fff", scale: String(pop * interpolate(open, [0, 1], [1, 3])), letterSpacing: "0.01em" }}>BELLINGHAM</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300, opacity: 1 - open }}>
        <Track text="LE N°5 DE MADRID" at={10} size={34} weight={600} from={0.2} to={0.5} style={{ color: GOLD }} />
      </AbsoluteFill>
      <Shock at={0} />
    </AbsoluteFill>
  );
};

const UclGoal: React.FC = () => (
  <>
    <Clip src="ucl" rate={1.55} zoom={[1.0, 1.08]} />
    <LowerThird kicker="LIGUE DES CHAMPIONS" title="SANG-FROID" sub="LES GRANDS SOIRS SONT LES SIENS" at={8} bottom={300} />
  </>
);

const Skills: React.FC = () => (
  <>
    <Triptych horizontal items={[{ src: "skill1", trim: 0.4 }, { src: "skill2" }, { src: "skill3", trim: 0.3 }]} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "rgba(0,0,0,0.55)", padding: "10px 28px" }}>
        <Track text="ÉLÉGANCE" at={16} size={70} font={DISPLAY} weight={400} from={0.05} to={0.35} />
      </div>
    </AbsoluteFill>
  </>
);

const Rise2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Sequence durationInFrames={s(1.85)} layout="none">
        <AbsoluteFill>
          <Photo n={12} zoom={[1.25, 1.05]} pos="50% 30%" />
          <AbsoluteFill style={{ mixBlendMode: "screen", background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% 22%, rgba(255,230,180,0.18) 0deg 5deg, transparent 5deg 16deg)`, maskImage: "radial-gradient(circle at 50% 22%, black, transparent 65%)", WebkitMaskImage: "radial-gradient(circle at 50% 22%, black, transparent 65%)" }} />
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 340 }}>
            <Metal size={120}>LE BERNABÉU</Metal>
            <Metal size={150} gold>SE LÈVE</Metal>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={s(1.85)} layout="none">
        <Scene enter="punch" grade="warm">
          <Clip src="kiss" trim={1.2} rate={0.9} zoom={[1.08, 1.2]} pos="50% 30%" />
        </Scene>
      </Sequence>
    </>
  );
};

/* trophy card: photo inside a framed card + caption */
const Trophy: React.FC<{ n: number; title: string; year: string; pos?: string; clip?: string }> = ({ n, title, year, pos = "50% 35%", clip }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const p = interpolate(frame, [0, 10], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      {clip ? <Clip src={clip} rate={1} zoom={[1.3, 1.4]} style={{ filter: "blur(28px) brightness(0.35)" }} /> : <Photo n={n} zoom={[1.4, 1.5]} style={{ filter: "blur(28px) brightness(0.35)" }} />}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200, perspective: 1600 }}>
        <div
          style={{
            width: 800,
            height: 1040,
            overflow: "hidden",
            position: "relative",
            rotate: `0 1 0 ${interpolate(p, [0, 1], [35, 0]) + interpolate(frame, [0, d], [0, -6])}deg`,
            scale: String(interpolate(p, [0, 1], [0.85, 1]) * interpolate(frame, [0, d], [1, 1.04])),
            boxShadow: `0 0 0 3px ${GOLD}, 0 40px 120px rgba(0,0,0,0.9)`,
            opacity: p,
          }}
        >
          {clip ? (
            <Video src={staticFile(`jb/c/${clip}.mp4`)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
          ) : (
            <Img src={staticFile(`jb/img/${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, scale: String(interpolate(frame, [0, d], [1.03, 1.12])) }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.5) 50%, transparent 62%)", translate: `${interpolate(frame, [3, 22], [-130, 130], CL)}% 0%`, mixBlendMode: "screen" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
        <Rise at={4}>
          <Metal size={title.length > 18 ? 74 : 92}>{title}</Metal>
        </Rise>
        <Rise at={8}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, letterSpacing: "0.45em", color: GOLD, marginRight: "-0.45em" }}>{year}</div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Awards: React.FC = () => (
  <>
    <Photo n={5} zoom={[1.05, 1.2]} pos="50% 45%" />
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
    <Dust count={50} seed="aw" />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Rise at={4}>
        <Metal size={140} gold>GOLDEN BOY</Metal>
      </Rise>
      <Rise at={10}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 34, letterSpacing: "0.5em", color: "#fff", marginRight: "-0.5em", textAlign: "center" }}>2023</div>
      </Rise>
      <div style={{ height: 30 }} />
      <Rise at={18}>
        <Metal size={120}>TROPHÉE KOPA</Metal>
      </Rise>
      <Rise at={24}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 34, letterSpacing: "0.5em", color: "#fff", marginRight: "-0.5em", textAlign: "center" }}>2023</div>
      </Rise>
    </AbsoluteFill>
  </>
);

const Team: React.FC = () => (
  <>
    <Clip src="team" rate={1.0} zoom={[1.15, 1.0]} />
    <Flare x={30} y={10} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
      <Track text="HALA MADRID" at={6} size={84} font={DISPLAY} weight={400} from={0.6} to={0.18} />
    </AbsoluteFill>
  </>
);

const Legacy: React.FC = () => (
  <>
    <Photo n={4} zoom={[1.0, 1.14]} pos="18% 55%" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 40%)" }} />
    <Poem text="Les grands joueurs gagnent des matchs." at={8} size={50} y="flex-start" />
  </>
);

const Legend: React.FC = () => (
  <>
    <Photo n={2} zoom={[1.02, 1.2]} pos="50% 25%" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))" }} />
    <Poem text="Les légendes gagnent des soirs comme celui-ci." at={6} size={50} />
  </>
);

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [s(2.9), s(3.45)], [1, 0], CL);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fade }}>
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <Clip src="portrait" rate={0.6} zoom={[1.3, 1.4]} style={{ filter: "grayscale(1) blur(6px)" }} />
      </AbsoluteFill>
      <Dust count={60} seed="end" />
      <Shock at={0} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Track text="JUDE" at={2} size={70} weight={300} from={1.2} to={0.6} />
        <div style={{ scale: String(interpolate(frame, [0, 10], [1.4, 1], { ...CL, easing: OUT })), opacity: interpolate(frame, [0, 5], [0, 1], CL) }}>
          <Metal size={176}>BELLINGHAM</Metal>
        </div>
        <Rise at={14}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: GOLD, textAlign: "center" }}>Ce soir, la légende entre en scène.</div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== GLOBAL LAYERS ===================== */
const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  let h = interpolate(frame, [0, 40], [960, 150], { ...CL, easing: OUT });
  const b = s(BRAAM);
  h += interpolate(frame, [b - 4, b, b + 18], [0, 70, 0], CL);
  h = Math.max(h, interpolate(frame, [s(59.2), s(60)], [150, 960], CL));
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: 1080, height: h, background: "#000" }} />
    </>
  );
};

const BroadcastTag: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [s(1.2), s(2)], [0, 1], CL) * interpolate(frame, [s(56.3), s(56.6)], [1, 0], CL);
  const dot = 0.4 + 0.6 * Math.abs(Math.sin(frame / 12));
  return (
    <div style={{ position: "absolute", top: 172, left: 50, display: "flex", alignItems: "center", gap: 12, opacity: o }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff2b3a", opacity: dot, boxShadow: "0 0 12px #ff2b3a" }} />
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.3em", color: "#fff" }}>AVANT-MATCH</div>
      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, letterSpacing: "0.25em", color: GOLD }}>CE SOIR</div>
    </div>
  );
};

const CUTS = [4.06, 6.06, 8.0, 10.08, 13.05, 16.0, 19.0, 21.5, 24.5, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(HIT), END_HIT, 38.35, 41.0, 43.5, 44.5];
const BIG = [BRAAM, HIT(1), HIT(3), HIT(4), HIT(7), END_HIT];

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  let w = 0;
  for (const c of BIG) if (frame >= s(c)) w = Math.max(w, Math.exp(-(frame - s(c)) / 3));
  for (const c of CUTS) if (frame >= s(c) && s(c) > s(BRAAM)) w = Math.max(w, 0.45 * Math.exp(-(frame - s(c)) / 2));
  return <AbsoluteFill style={{ background: "#fff", opacity: w, pointerEvents: "none" }} />;
};

const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  let a = 0;
  for (const c of BIG) if (frame >= s(c)) a = Math.max(a, 26 * Math.exp(-(frame - s(c)) / 5));
  for (const c of [...[2, 5, 6, 8, 9].map(HIT)]) if (frame >= s(c)) a = Math.max(a, 12 * Math.exp(-(frame - s(c)) / 4));
  return (
    <AbsoluteFill style={{ translate: `${(random(`sx${frame}`) - 0.5) * 2 * a}px ${(random(`sy${frame}`) - 0.5) * 2 * a}px`, scale: String(1 + a / 500) }}>
      {children}
    </AbsoluteFill>
  );
};

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = 0.97 + 0.03 * random(`fl${frame}`);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 48%, transparent 50%, rgba(0,0,0,0.8) 100%)", opacity: flicker }} />
      <AbsoluteFill style={{ opacity: 0.11, mixBlendMode: "overlay" }}>
        <svg width={1080} height={1920}>
          <filter id="g">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 10} />
          </filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
      {random(`scr${Math.floor(frame / 3)}`) > 0.8 && (
        <div style={{ position: "absolute", top: 0, left: random(`scx${Math.floor(frame / 3)}`) * 1080, width: 2, height: 1920, background: "rgba(255,255,255,0.18)" }} />
      )}
    </>
  );
};

const Handle: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], { ...CL, easing: OUT });
  const big = interpolate(frame, [s(END_HIT - 48.46), s(END_HIT - 48.46) + 12], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: interpolate(big, [0, 1], [176, 300]) }}>
      <div style={{ opacity: p, translate: `0px ${(1 - p) * 60}px`, scale: String(interpolate(big, [0, 1], [1, 1.3])), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", letterSpacing: "0.04em", padding: "10px 30px", border: `1.5px solid ${GOLD}`, background: "rgba(0,0,0,0.5)", borderRadius: 999 }}>@viber.flow4</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: GOLD, letterSpacing: "0.06em" }}>#bellingham #realmadrid #football #viberflow4</div>
      </div>
    </AbsoluteFill>
  );
};

/* ===================== AUDIO ===================== */
const VO: [number, number][] = [
  [0.55, 2.81], // Il y a des soirs… où tout un stade retient son souffle.
  [4.3, 2.96], // Ce soir, tous les regards…
  [10.45, 1.76], // Né en 2003, à Stourbridge.
  [13.2, 2.60], // Arrivé à Madrid à vingt ans… il a tout conquis.
  [21.7, 1.97], // Le calme… avant la tempête.
  [25.15, 1.12], // Jude Bellingham.
  [30.95, 1.49], // Le sang-froid des grands soirs.
  [33.85, 2.41], // Et quand il marque… le Bernabéu se lève.
  [39.85, 1.92], // Champion d'Europe. Champion d'Espagne.
  [45.85, 1.68], // Golden Boy. Trophée Kopa.
  [51.75, 1.65], // Les grands joueurs gagnent des matchs.
  [54.1, 2.30], // Les légendes… gagnent des soirs comme celui-ci.
];

const musicVol = (fr: number) => {
  let duck = 0;
  for (const [a, d] of VO) duck = Math.max(duck, interpolate(fr, [s(a) - 6, s(a), s(a + d), s(a + d) + 8], [0, 1, 1, 0], CL));
  return (1 - 0.42 * duck) * interpolate(fr, [s(59.2), s(60)], [1, 0], CL);
};
const crowdVol = (fr: number) => {
  const t = fr / FPS;
  if (t < 24.5) return interpolate(t, [0, 3, 24, 24.5], [0, 0.22, 0.4, 0], CL);
  if (t < BRAAM) return 0;
  return interpolate(t, [BRAAM, BRAAM + 0.3, 36.3, 36.7, 39, 58.5, 60], [0, 0.35, 0.35, 0.7, 0.35, 0.3, 0], CL);
};

const Sound: React.FC = () => (
  <>
    <Audio src={staticFile("jb/music.wav")} volume={musicVol} />
    <Audio src={staticFile("jb/crowd_amb.wav")} volume={crowdVol} loop />
    {VO.map(([a, d], i) => (
      <Sequence key={`vo${i}`} from={s(a)} durationInFrames={s(d) + 6}>
        <Audio src={staticFile(`jb/vo/l${i}.wav`)} volume={1.05} />
      </Sequence>
    ))}
    {[24.8, 25.75, 26.6, 19.0, 19.5, 20.0, 20.5, 21.0].map((t, i) => (
      <Sequence key={`hb${i}`} from={s(t)} durationInFrames={30}>
        <Audio src={staticFile("jb/heartbeat.wav")} volume={t > 24 ? 0.9 : 0.5} />
      </Sequence>
    ))}
    <Sequence from={s(21.4)} durationInFrames={s(3.1)}>
      <Audio src={staticFile("jb/riser.wav")} volume={0.35} />
    </Sequence>
    {[BRAAM, END_HIT].map((t, i) => (
      <Sequence key={`im${i}`} from={s(t)} durationInFrames={48}>
        <Audio src={staticFile("jb/impact.wav")} volume={0.6} />
      </Sequence>
    ))}
    {[8.0, 10.08, 13.05, HIT(1), HIT(2), HIT(4), HIT(5), HIT(6), HIT(7), 41.0, 43.5, 44.5].map((t, i) => (
      <Sequence key={`wh${i}`} from={Math.max(0, s(t) - 9)} durationInFrames={24}>
        <Audio src={staticFile("jb/whoosh.wav")} volume={0.35} />
      </Sequence>
    ))}
  </>
);

/* ===================== TIMELINE ===================== */
type Shot = { from: number; to: number; el: React.ReactNode; enter?: Tr; exit?: Tr; grade?: "bw" | "cool" | "warm" | "bw2color" | "none"; name: string };
const SHOTS: Shot[] = [
  { name: "Ouverture", from: 0, to: 4.06, el: <ColdOpen />, grade: "bw", enter: "fade", exit: "black" },
  { name: "N°5", from: 4.06, to: 6.06, el: <Back5 />, grade: "bw2color", enter: "black" },
  { name: "Regard", from: 6.06, to: 8.0, el: <LookUp />, grade: "cool", enter: "fade", exit: "whipL" },
  { name: "Tunnel", from: 8.0, to: 10.08, el: <Tunnel />, grade: "cool", enter: "whipL", exit: "zoom" },
  { name: "Identité", from: 10.08, to: 13.05, el: <SuitID />, grade: "cool", enter: "zoom" },
  { name: "Madrid", from: 13.05, to: 16.0, el: <Arrival />, grade: "warm", enter: "glitch", exit: "whipR" },
  { name: "Triptyque", from: 16.0, to: 19.0, el: <Triptych items={[{ src: "run" }, { src: "smile", trim: 0.2 }, { src: "juggle", trim: 1 }]} />, grade: "cool" },
  { name: "Pulsations", from: 19.0, to: 21.5, el: <HeartCuts />, grade: "bw" },
  { name: "Le calme", from: 21.5, to: 24.5, el: <Calm />, grade: "cool", enter: "fade", exit: "black" },
  { name: "Silence", from: 24.5, to: BRAAM, el: <Silence />, grade: "none" },
  { name: "BRAAM titre", from: BRAAM, to: HIT(1), el: <TitleReveal />, grade: "warm" },
  { name: "But LDC", from: HIT(1), to: HIT(2), el: <UclGoal />, grade: "warm", enter: "punch", exit: "whipL" },
  { name: "Gestes", from: HIT(2), to: HIT(3), el: <Skills />, grade: "warm", enter: "whipL" },
  { name: "Bernabéu", from: HIT(3), to: HIT(4), el: <Rise2 />, grade: "warm", enter: "zoom", exit: "glitch" },
  { name: "LDC 2024", from: HIT(4), to: 41.0, el: <Trophy n={10} title="CHAMPION D'EUROPE" year="2024" pos="50% 30%" />, grade: "warm", enter: "glitch" },
  { name: "Liga 2024", from: 41.0, to: HIT(5), el: <Trophy n={6} title="CHAMPION D'ESPAGNE" year="2024" pos="40% 40%" />, grade: "warm", enter: "whipR" },
  { name: "Supercoupe UEFA", from: HIT(5), to: 43.5, el: <Trophy n={3} title="SUPERCOUPE D'EUROPE" year="2024" pos="40% 40%" />, grade: "warm", enter: "whipL" },
  { name: "Supercoupe ESP", from: 43.5, to: 44.5, el: <Trophy n={0} clip="supercopa" title="SUPERCOUPE D'ESPAGNE" year="2024" />, grade: "warm", enter: "whipR" },
  { name: "Intercontinentale", from: 44.5, to: HIT(6), el: <Trophy n={9} title="COUPE INTERCONTINENTALE" year="FIFA · 2024" pos="50% 30%" />, grade: "warm", enter: "whipL" },
  { name: "Distinctions", from: HIT(6), to: HIT(7), el: <Awards />, grade: "warm", enter: "zoom", exit: "fade" },
  { name: "Équipe", from: HIT(7), to: HIT(8), el: <Team />, grade: "warm", enter: "punch", exit: "whipR" },
  { name: "Héritage", from: HIT(8), to: HIT(9), el: <Legacy />, grade: "cool", enter: "whipR", exit: "fade" },
  { name: "Légende", from: HIT(9), to: END_HIT, el: <Legend />, grade: "warm", enter: "fade" },
  { name: "Carton final", from: END_HIT, to: 60, el: <EndCard />, grade: "none" },
];

export const Bellingham: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Shake>
      {SHOTS.map((sh) => (
        <Sequence key={sh.name} name={sh.name} from={s(sh.from)} durationInFrames={s(sh.to) - s(sh.from)}>
          <Scene enter={sh.enter} exit={sh.exit} grade={sh.grade}>
            {sh.el}
          </Scene>
        </Sequence>
      ))}
      <Sequence from={s(6.06) - 8} durationInFrames={30} layout="none">
        <LightSweep at={0} dur={30} />
      </Sequence>
      <Sequence from={s(HIT(4)) - 6} durationInFrames={34} layout="none">
        <LightSweep at={0} dur={34} />
      </Sequence>
      <Sequence from={s(HIT(7)) - 6} durationInFrames={34} layout="none">
        <LightSweep at={0} dur={34} />
      </Sequence>
    </Shake>
    <Flash />
    <Finish />
    <Letterbox />
    <BroadcastTag />
    <Sequence from={s(HIT(7))} name="Handle">
      <Handle />
    </Sequence>
    <Sound />
  </AbsoluteFill>
);

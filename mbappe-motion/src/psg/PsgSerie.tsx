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
   PARIS · LA DYNASTIE — bande-annonce façon série documentaire (9:16)
   Pas de voix off. Musique vidIQ ~150 BPM (temps = 0.4 s),
   montée 14 s, drop 27.27 s, coup final 46.5 s.
   Ouverture directement sur l'action (pas d'écran noir).
   ============================================================ */

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-300-normal.woff2"), weight: "300" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const PSG_TOTAL = s(51.6);

const DISPLAY = "Anton, Impact, sans-serif";
const SANS = "Montserrat, Arial, sans-serif";
const RED = "#e2231a";
const NAVY = "#071434";
const WHITE = "#ffffff";

/* ---------------- media ---------------- */
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; pos?: string; filter?: string }> = ({
  src, trim = 0, rate = 1, zoom = [1.06, 1.0], pos = "50% 50%", filter,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NAVY }}>
      <Video src={staticFile(`psg/c/${src}.mp4`)} trimBefore={s(trim)} playbackRate={rate} muted objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: pos, transformOrigin: pos, filter,
          scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)) }} />
    </AbsoluteFill>
  );
};

/** Photo plein cadre (9:16) avec poussée lente. */
const Full: React.FC<{ src: string; zoom?: [number, number]; pos?: string; filter?: string }> = ({ src, zoom = [1.04, 1.16], pos = "50% 40%", filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NAVY }}>
      <Img src={staticFile(`psg/img/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transformOrigin: pos, filter,
        scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)) }} />
    </AbsoluteFill>
  );
};

/** Photo non verticale : fond flouté + image nette fondue en haut/bas. */
const Framed: React.FC<{ src: string; top?: number; zoom?: [number, number]; filter?: string; width?: number }> = ({
  src, top = 260, zoom = [1.0, 1.1], filter, width = 1080,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const url = staticFile(`psg/img/${src}.jpg`);
  const sc = interpolate(frame, [0, durationInFrames], zoom, CL);
  const fade = "linear-gradient(to bottom, transparent 0%, #000 12%, #000 80%, transparent 100%)";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NAVY }}>
      <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `blur(46px) brightness(0.42) saturate(1.2) ${filter ?? ""}`, scale: "1.35" }} />
      <Img src={url} style={{ position: "absolute", left: (1080 - width) / 2, top, width, transformOrigin: "50% 30%", scale: String(sc), filter,
        WebkitMaskImage: fade, maskImage: fade }} />
    </AbsoluteFill>
  );
};

/* ---------------- habillage série ---------------- */
const Grade: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => (
  <AbsoluteFill style={{ filter: mono ? "grayscale(1) contrast(1.25) brightness(0.8)" : "contrast(1.12) saturate(1.08) brightness(0.92)" }}>
    {children}
  </AbsoluteFill>
);

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
);

const BottomShade: React.FC<{ h?: number }> = ({ h = 900 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: `linear-gradient(to top, rgba(3,8,24,0.96) 0%, rgba(3,8,24,0.7) 45%, transparent 100%)` }} />
);

const Rise: React.FC<{ children: React.ReactNode; at?: number; dur?: number; style?: React.CSSProperties; dy?: number }> = ({ children, at = 0, dur = 12, style, dy = 60 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dy}px)`, filter: `blur(${(1 - p) * 10}px)`, ...style }}>{children}</div>;
};

/** Mot qui s'ouvre (lettres qui se resserrent) + halo rouge. */
const Spread: React.FC<{ text: string; size: number; at?: number; color?: string; glow?: boolean; from?: number; to?: number }> = ({
  text, size, at = 0, color = WHITE, glow = false, from = 0.6, to = 0.06,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 40], [0, 1], { ...CL, easing: OUT });
  const op = interpolate(frame, [at, at + 8], [0, 1], CL);
  return (
    <div style={{ fontFamily: DISPLAY, fontSize: size, color, lineHeight: 1, letterSpacing: `${interpolate(p, [0, 1], [from, to])}em`, opacity: op,
      textShadow: glow ? `0 0 30px ${RED}, 0 0 80px rgba(226,35,26,0.7)` : "0 8px 40px rgba(0,0,0,0.6)", transform: `scale(${interpolate(p, [0, 1], [1.12, 1])})`, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

/** Carte d'épisode façon plateforme : numéro rouge, titre, date, barre de progression rouge. */
const Episode: React.FC<{ n: number; title: string; date: string; score?: string; note?: string }> = ({ n, title, date, score, note }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const prog = interpolate(frame, [4, durationInFrames], [0, 1], CL);
  return (
    <AbsoluteFill>
      <BottomShade />
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 300 }}>
        <Rise at={2} dy={30}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.42em", color: RED }}>ÉPISODE {n}</div>
        </Rise>
        <Rise at={5}>
          <div style={{ fontFamily: DISPLAY, fontSize: 150, color: WHITE, lineHeight: 1.05, paddingTop: 8, textShadow: "0 10px 40px rgba(0,0,0,0.7)" }}>{title}</div>
        </Rise>
        <Rise at={9} dy={30}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.82)", letterSpacing: "0.12em", marginTop: 10 }}>{date}</div>
        </Rise>
        {score && (
          <Rise at={12} dy={30}>
            <div style={{ display: "inline-block", marginTop: 26, padding: "10px 26px", background: "rgba(255,255,255,0.08)", borderLeft: `8px solid ${RED}`,
              fontFamily: DISPLAY, fontSize: 70, color: WHITE, letterSpacing: "0.04em" }}>{score}</div>
          </Rise>
        )}
        {note && (
          <Rise at={16} dy={20}>
            <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 34, color: "rgba(255,255,255,0.85)", marginTop: 20, fontStyle: "italic" }}>{note}</div>
          </Rise>
        )}
        <div style={{ marginTop: 40, height: 7, background: "rgba(255,255,255,0.22)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: RED }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Petit libellé en haut à gauche (la « série »). */
const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 10], [0, 1], CL);
  return (
    <div style={{ position: "absolute", top: 110, left: 80, opacity: op, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 52, color: RED, letterSpacing: "0.1em", textShadow: "0 0 20px rgba(226,35,26,0.6)" }}>PARIS</div>
      <div style={{ width: 2, height: 40, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: WHITE, letterSpacing: "0.3em" }}>LA DYNASTIE</div>
    </div>
  );
};

/** Flash blanc ou rouge sur des frames précises (relatives à la scène). */
const Flash: React.FC<{ at: number[]; color?: string; strength?: number; len?: number }> = ({ at, color = WHITE, strength = 0.85, len = 7 }) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) o = Math.max(o, interpolate(frame, [a, a + 1, a + len], [0, strength, 0], CL));
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: color === WHITE ? "normal" : "screen", pointerEvents: "none" }} />;
};

/** Fuite de lumière rouge qui balaie l'image. */
const RedLeak: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 24 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], CL);
  const o = Math.sin(p * Math.PI) * 0.65;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o,
      background: `radial-gradient(circle at ${-20 + p * 140}% ${30 + p * 30}%, rgba(255,40,20,0.95) 0%, rgba(160,10,30,0.5) 25%, transparent 55%)` }} />
  );
};

/** Décalage RVB pour les coupes nerveuses. */
const Glitch: React.FC<{ children: React.ReactNode; at: number[] }> = ({ children, at }) => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const a of at) k = Math.max(k, interpolate(frame, [a, a + 6], [1, 0], CL) * (frame >= a ? 1 : 0));
  const dx = k * 24 * (random(`g${frame}`) - 0.3);
  return (
    <AbsoluteFill>
      {k > 0.02 && <AbsoluteFill style={{ transform: `translateX(${dx}px)`, mixBlendMode: "screen", opacity: 0.7, filter: "url(#redOnly)" }}>{children}</AbsoluteFill>}
      <AbsoluteFill style={{ transform: `translateX(${-dx * 0.5}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Shockwave: React.FC<{ at?: number; color?: string }> = ({ at = 0, color = WHITE }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 18], [0, 1], { ...CL, easing: OUT });
  if (frame < at || p >= 1) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: 200 + p * 1800, height: 200 + p * 1800, borderRadius: "50%", border: `${(1 - p) * 30}px solid ${color}`, opacity: 1 - p }} />
    </AbsoluteFill>
  );
};

/* ---------------- scènes ---------------- */
const ColdOpen: React.FC = () => (
  <AbsoluteFill>
    <Grade><Clip src="bayern" trim={0.2} rate={0.92} zoom={[1.12, 1.0]} /></Grade>
    <Vignette />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300 }}>
      <Rise at={6} dy={20}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.5em", color: WHITE, textShadow: "0 2px 20px #000" }}>UNE HISTOIRE VRAIE</div>
      </Rise>
      <Rise at={14} dy={10}><div style={{ width: 120, height: 5, background: RED, marginTop: 22 }} /></Rise>
    </AbsoluteFill>
  </AbsoluteFill>
);

const HeaderGoal: React.FC = () => (
  <AbsoluteFill>
    <Grade><Clip src="ucl" trim={2.0} zoom={[1.0, 1.1]} /></Grade>
    <Vignette />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <Rise at={4} dy={20}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 44, color: WHITE, letterSpacing: "0.08em", textAlign: "center", textShadow: "0 4px 30px #000" }}>
          Une ville. Un club. <span style={{ fontWeight: 800, color: RED }}>Une obsession.</span>
        </div>
      </Rise>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 90], [0.55, 0.38], CL);
  return (
    <AbsoluteFill>
      <Grade><Clip src="ucl" trim={7.7} rate={0.8} zoom={[1.15, 1.05]} filter={`brightness(${bg}) saturate(0.8)`} /></Grade>
      <RedLeak at={0} dur={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Spread text="PARIS" size={330} at={0} color={RED} glow from={0.9} to={0.04} />
        <Rise at={16} dy={20}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: WHITE, letterSpacing: "0.62em", marginTop: 20, marginLeft: "0.62em" }}>LA DYNASTIE</div>
        </Rise>
        <Rise at={26} dy={10}>
          <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 26, color: "rgba(255,255,255,0.75)", letterSpacing: "0.3em", marginTop: 26 }}>2025 — 2026 — AUJOURD'HUI</div>
        </Rise>
      </AbsoluteFill>
      <Shockwave at={0} color={RED} />
      <Flash at={[0]} color={RED} strength={0.9} len={10} />
    </AbsoluteFill>
  );
};

const Sacre: React.FC = () => (
  <AbsoluteFill>
    <Grade><Framed src="winners2025" top={300} width={1600} zoom={[1.0, 1.08]} /></Grade>
    <Vignette />
    <Hud />
    <Episode n={1} title="LE SACRE" date="31 MAI 2025 · MUNICH" score="PSG 5-0 INTER" />
    <Flash at={[0]} />
  </AbsoluteFill>
);

const SacreDoue: React.FC = () => (
  <AbsoluteFill>
    <Grade><Full src="doue_final" zoom={[1.08, 1.18]} pos="50% 30%" /></Grade>
    <Vignette />
    <BottomShade h={700} />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 80px 340px" }}>
      <Rise at={2} dy={30}><div style={{ fontFamily: DISPLAY, fontSize: 96, color: WHITE, lineHeight: 1.05, paddingTop: 6 }}>LA PREMIÈRE</div></Rise>
      <Rise at={6} dy={30}><div style={{ fontFamily: DISPLAY, fontSize: 96, color: RED, lineHeight: 1.05, paddingTop: 6 }}>LIGUE DES CHAMPIONS</div></Rise>
      <Rise at={10} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.8)", letterSpacing: "0.14em", marginTop: 10 }}>DE L'HISTOIRE DU CLUB</div></Rise>
    </AbsoluteFill>
    <Hud />
  </AbsoluteFill>
);

const Classique: React.FC = () => (
  <AbsoluteFill>
    <Grade><Framed src="dembele_om_c" top={150} width={1240} zoom={[1.0, 1.1]} /></Grade>
    <Vignette />
    <Hud />
    <Episode n={2} title="LE CLASSIQUE" date="8 FÉV. 2026 · PARC DES PRINCES" score="PSG 5-0 OM" note="Doublé de Dembélé" />
    <Flash at={[0]} />
  </AbsoluteFill>
);

const Chute: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Glitch at={[0, 34, 70]}>
        <Grade mono><Framed src="dembele_rennes_c" top={140} width={1220} zoom={[1.12, 1.0]} /></Grade>
      </Glitch>
      <AbsoluteFill style={{ background: "rgba(80,0,10,0.25)", mixBlendMode: "multiply" }} />
      <Vignette />
      <Hud />
      <Episode n={3} title="LA CHUTE" date="13 FÉV. 2026 · ROAZHON PARK" score="RENNES 3-1 PSG" note="Le champion vacille." />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(frame, [0, 3], [0.6, 0], CL) }} />
    </AbsoluteFill>
  );
};

const Reponse: React.FC = () => (
  <AbsoluteFill>
    <Grade><Framed src="kvara_chelsea_c" top={130} width={1240} zoom={[1.0, 1.1]} /></Grade>
    <Vignette />
    <RedLeak at={0} dur={30} />
    <Hud />
    <Episode n={4} title="LA RÉPONSE" date="11 MARS 2026 · 8es DE FINALE" score="PSG 5-2 CHELSEA" note="Kvaratskhelia, doublé en fin de match" />
    <Flash at={[0]} />
  </AbsoluteFill>
);

const Legende: React.FC = () => {
  const frame = useCurrentFrame();
  // la dernière seconde : coupes nerveuses sur le dribble de Dembélé (montée vers le drop)
  const rush = frame >= 66;
  return (
    <AbsoluteFill>
      {!rush && (
        <>
          <Grade><Framed src="dembele_bayern_c" top={140} width={1250} zoom={[1.0, 1.12]} /></Grade>
          <Vignette />
          <Hud />
          <Episode n={5} title="LA LÉGENDE" date="28 AVRIL 2026 · DEMI-FINALE" score="PSG 5-4 BAYERN" note="9 buts. Une nuit pour l'histoire." />
        </>
      )}
      {rush && (
        <Sequence from={66} layout="none">
          <Glitch at={[0, 6, 12, 18]}>
            <Grade><Clip src="dembele" trim={0.6} rate={1.6} zoom={[1.0, 1.3]} /></Grade>
          </Glitch>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 200, color: WHITE, opacity: 0.92, textShadow: `0 0 40px ${RED}` }}>
              {frame < 78 ? "ET" : frame < 86 ? "PUIS…" : ""}
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
      <Flash at={[0, 66]} strength={0.7} />
      <AbsoluteFill style={{ background: WHITE, opacity: interpolate(frame, [88, 96], [0, 1], CL) }} />
    </AbsoluteFill>
  );
};

const BackToBack: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = interpolate(frame, [0, 14], [26, 0], CL);
  return (
    <AbsoluteFill style={{ transform: `translate(${(random(`x${frame}`) - 0.5) * shake}px, ${(random(`y${frame}`) - 0.5) * shake}px)` }}>
      <Grade><Full src="b2b" zoom={[1.25, 1.05]} pos="50% 60%" /></Grade>
      <Vignette />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(3,8,24,0.92) 0%, rgba(3,8,24,0.4) 30%, transparent 50%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 230 }}>
        <Rise at={3} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: "0.4em", color: RED }}>BUDAPEST · 30 MAI 2026</div></Rise>
        <Rise at={6}><div style={{ fontFamily: DISPLAY, fontSize: 132, color: WHITE, lineHeight: 1.05, paddingTop: 8, textAlign: "center" }}>CHAMPIONS<br />D'EUROPE.</div></Rise>
        <Rise at={14}><div style={{ fontFamily: DISPLAY, fontSize: 132, color: RED, lineHeight: 1.05, paddingTop: 6, textShadow: `0 0 40px rgba(226,35,26,0.7)` }}>ENCORE.</div></Rise>
        <Rise at={22} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,0.85)", letterSpacing: "0.12em", marginTop: 14 }}>PSG 1-1 ARSENAL · 4-3 AUX TIRS AU BUT</div></Rise>
      </AbsoluteFill>
      <Shockwave at={0} />
      <Flash at={[0]} strength={1} len={12} />
    </AbsoluteFill>
  );
};

/** Montage action calé sur les temps (0.4 s). */
const WORDS: { at: number; w: string; c?: string }[] = [
  { at: 0, w: "LA VITESSE." },
  { at: 1.6, w: "LA FOLIE." },
  { at: 3.2, w: "LE TALENT." },
  { at: 4.8, w: "PARIS.", c: RED },
];
const Action: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [0, 1.6, 3.2, 4.8].map(s);
  const word = [...WORDS].reverse().find((w) => frame >= s(w.at))!;
  const local = frame - s(word.at);
  const pop = interpolate(local, [0, 6], [1.35, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(1.6)}><Grade><Clip src="bayern" trim={9.3} rate={1.15} zoom={[1.2, 1.05]} /></Grade></Sequence>
      <Sequence from={s(1.6)} durationInFrames={s(1.6)}><Grade><Clip src="ucl" trim={8.2} rate={1.1} zoom={[1.0, 1.15]} /></Grade></Sequence>
      <Sequence from={s(3.2)} durationInFrames={s(1.6)}><Grade><Clip src="ferran" trim={0.6} rate={1.1} zoom={[1.1, 1.25]} /></Grade></Sequence>
      <Sequence from={s(4.8)}><Grade><Clip src="bayern" trim={12.6} rate={0.9} zoom={[1.05, 1.18]} /></Grade></Sequence>
      <Vignette />
      <BottomShade h={600} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 360 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 150, color: word.c ?? WHITE, transform: `scale(${pop})`, letterSpacing: "0.03em",
          textShadow: word.c ? `0 0 40px rgba(226,35,26,0.8)` : "0 8px 40px rgba(0,0,0,0.8)" }}>{word.w}</div>
      </AbsoluteFill>
      <Hud />
      <Flash at={cuts} strength={0.55} len={5} />
    </AbsoluteFill>
  );
};

/** Palmarès récent : compteurs. */
const Count: React.FC<{ to: number; at: number; suffix?: string }> = ({ to, at, suffix = "" }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [at, at + 18], [0, to], { ...CL, easing: OUT }));
  return <>{v}{suffix}</>;
};
const Palmares: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= s(1.6);
  return (
    <AbsoluteFill>
      <Grade>{second ? <Clip src="marqui" trim={0} rate={0.6} zoom={[1.1, 1.2]} filter="brightness(0.75)" /> : <Framed src="doue_trophy" top={120} width={1300} zoom={[1.0, 1.08]} />}</Grade>
      <Vignette />
      <BottomShade h={1000} />
      <Hud />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 80px 330px" }}>
        {!second ? (
          <>
            <div style={{ fontFamily: DISPLAY, fontSize: 280, color: RED, lineHeight: 1, textShadow: "0 0 50px rgba(226,35,26,0.6)" }}><Count to={2} at={0} /></div>
            <Rise at={4} dy={20}><div style={{ fontFamily: DISPLAY, fontSize: 92, color: WHITE, lineHeight: 1.05, paddingTop: 6 }}>LIGUES DES CHAMPIONS</div></Rise>
            <Rise at={8} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.8)", letterSpacing: "0.16em", marginTop: 8 }}>2025 · 2026 — DE SUITE</div></Rise>
          </>
        ) : (
          <Sequence from={s(1.6)} layout="none">
            <div style={{ fontFamily: DISPLAY, fontSize: 280, color: RED, lineHeight: 1, textShadow: "0 0 50px rgba(226,35,26,0.6)" }}><Count to={14} at={0} /></div>
            <Rise at={4} dy={20}><div style={{ fontFamily: DISPLAY, fontSize: 92, color: WHITE, lineHeight: 1.05, paddingTop: 6 }}>TITRES DE CHAMPION</div></Rise>
            <Rise at={8} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.8)", letterSpacing: "0.16em", marginTop: 8 }}>DE FRANCE · LE 5e DE SUITE EN 2026</div></Rise>
          </Sequence>
        )}
      </AbsoluteFill>
      <Flash at={[0, s(1.6)]} strength={0.7} />
    </AbsoluteFill>
  );
};

const Saison: React.FC = () => (
  <AbsoluteFill>
    <Grade><Clip src="bayern" trim={18.2} rate={0.85} zoom={[1.05, 1.2]} pos="50% 70%" /></Grade>
    <Vignette />
    <Hud />
    <Episode n={10} title="LA SUITE" date="LIGUE 1 · SAISON 2026-27" score="1er · 20 PTS" note="Dernier match : Le Havre 1-5 PSG" />
    <Flash at={[0]} strength={0.6} />
  </AbsoluteFill>
);

const CeSoir: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.35;
  return (
    <AbsoluteFill>
      <Grade><Full src="doue_smile" zoom={[1.05, 1.15]} pos="50% 25%" /></Grade>
      <Vignette />
      <BottomShade h={1000} />
      <Hud />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 80px 320px" }}>
        <Rise at={2} dy={20}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 22px", background: RED, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: WHITE, letterSpacing: "0.22em" }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: WHITE, opacity: blink }} /> NOUVEL ÉPISODE
          </div>
        </Rise>
        <Rise at={6}><div style={{ fontFamily: DISPLAY, fontSize: 210, color: WHITE, lineHeight: 1, paddingTop: 16 }}>CE SOIR</div></Rise>
        <Rise at={11}><div style={{ fontFamily: DISPLAY, fontSize: 150, color: RED, lineHeight: 1, textShadow: "0 0 40px rgba(226,35,26,0.6)" }}>21H05</div></Rise>
        <Rise at={16} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 31, color: "rgba(255,255,255,0.88)", letterSpacing: "0.06em", marginTop: 16, whiteSpace: "nowrap" }}>PARC DES PRINCES · LIGUE 1 · 10e JOURNÉE</div></Rise>
      </AbsoluteFill>
      <Flash at={[0]} strength={0.8} />
    </AbsoluteFill>
  );
};

const Fin: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [s(4.3), s(5.1)], [0, 1], CL);
  return (
    <AbsoluteFill>
      <Grade><Clip src="ucl" trim={15.2} rate={0.6} zoom={[1.2, 1.1]} filter="brightness(0.32) blur(4px) saturate(0.7)" /></Grade>
      <RedLeak at={0} dur={60} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
        <Spread text="PARIS" size={300} at={0} color={RED} glow from={0.5} to={0.05} />
        <Rise at={14} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: WHITE, letterSpacing: "0.5em", marginTop: 26, marginLeft: "0.5em" }}>LA DYNASTIE CONTINUE</div></Rise>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230 }}>
        <Rise at={24} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: WHITE }}>@viber.flow4</div></Rise>
        <Rise at={30} dy={14}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.75)", marginTop: 14 }}>#PSG #IciCestParis #Ligue1 #ParisSaintGermain</div></Rise>
      </AbsoluteFill>
      <Flash at={[0]} color={RED} strength={0.8} len={12} />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

/* ---------------- timeline ---------------- */
const SCENES: { from: number; to: number; el: React.ReactNode }[] = [
  { from: 0, to: 3.27, el: <ColdOpen /> },
  { from: 3.27, to: 6.27, el: <HeaderGoal /> },
  { from: 6.27, to: 9.47, el: <Title /> },
  { from: 9.47, to: 12.67, el: <Sacre /> },
  { from: 12.67, to: 14.88, el: <SacreDoue /> },
  { from: 14.88, to: 17.68, el: <Classique /> },
  { from: 17.68, to: 20.98, el: <Chute /> },
  { from: 20.98, to: 24.07, el: <Reponse /> },
  { from: 24.07, to: 27.27, el: <Legende /> },
  { from: 27.27, to: 30.47, el: <BackToBack /> },
  { from: 30.47, to: 36.87, el: <Action /> },
  { from: 36.87, to: 40.07, el: <Palmares /> },
  { from: 40.07, to: 43.27, el: <Saison /> },
  { from: 43.27, to: 46.5, el: <CeSoir /> },
  { from: 46.5, to: 51.6, el: <Fin /> },
];

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.12, mixBlendMode: "overlay" }}>
      <svg width="1080" height="1920">
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>
    </AbsoluteFill>
  );
};

const SvgDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="redOnly"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
  </svg>
);

const Sound: React.FC = () => {
  const hits = [6.27, 14.88, 27.27, 46.5];
  const whooshes = [3.2, 9.4, 12.6, 17.6, 20.9, 24.0, 30.4, 32.0, 33.6, 35.2, 36.8, 40.0, 43.2];
  return (
    <>
      <Audio src={staticFile("psg/music.wav")} volume={(f) => interpolate(f, [s(49.5), s(51.6)], [1, 0], CL)} />
      {hits.map((h) => (
        <Sequence key={`i${h}`} from={s(h) - 1}><Audio src={staticFile("jb/impact.wav")} volume={0.75} /></Sequence>
      ))}
      {whooshes.map((w) => (
        <Sequence key={`w${w}`} from={s(w) - 4}><Audio src={staticFile("jb/whoosh.wav")} volume={0.4} /></Sequence>
      ))}
      <Sequence from={s(17.68)} durationInFrames={s(3.3)}><Audio src={staticFile("jb/heartbeat.wav")} volume={0.7} /></Sequence>
      <Sequence from={s(24.2)} durationInFrames={s(3.1)}><Audio src={staticFile("jb/riser.wav")} volume={0.55} /></Sequence>
      <Sequence from={s(27.2)} durationInFrames={s(4)}><Audio src={staticFile("jb/crowd_amb.wav")} volume={(f) => interpolate(f, [0, 10, 100, 120], [0, 0.5, 0.5, 0], CL)} /></Sequence>
    </>
  );
};

export const PsgSerie: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <SvgDefs />
    {SCENES.map((sc) => (
      <Sequence key={sc.from} from={s(sc.from)} durationInFrames={s(sc.to) - s(sc.from)}>
        {sc.el}
      </Sequence>
    ))}
    <Grain />
    <Sound />
  </AbsoluteFill>
);

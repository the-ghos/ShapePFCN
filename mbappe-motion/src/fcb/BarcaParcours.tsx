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
   FC BARCELONE · LE PARCOURS — avant Atlético–Barça (8 nov. 2026)
   Musique vidIQ 120 BPM (temps = 0.5 s, mesures à x.09),
   drop 18.09 s, respiration 34–36 s, coup final 56 s.
   Les plages de la future voix off sont dans VO (vide pour l'instant).
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
const Clip: React.FC<{ src: string; trim?: number; rate?: number; zoom?: [number, number]; pos?: string; filter?: string }> = ({
  src, trim = 0, rate = 1, zoom = [1.06, 1.0], pos = "50% 50%", filter,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Video src={staticFile(`fcb/c/${src}.mp4`)} trimBefore={s(trim)} playbackRate={rate} muted objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: pos, transformOrigin: pos, filter,
          scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)) }} />
    </AbsoluteFill>
  );
};

const Full: React.FC<{ src: string; zoom?: [number, number]; pos?: string; filter?: string }> = ({ src, zoom = [1.04, 1.16], pos = "50% 40%", filter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Img src={staticFile(`fcb/img/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transformOrigin: pos, filter,
        scale: String(interpolate(frame, [0, durationInFrames], zoom, CL)) }} />
    </AbsoluteFill>
  );
};

const Framed: React.FC<{ src: string; top?: number; zoom?: [number, number]; width?: number; children?: React.ReactNode }> = ({
  src, top = 260, zoom = [1.0, 1.08], width = 1080, children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const url = staticFile(`fcb/img/${src}.jpg`);
  const sc = interpolate(frame, [0, durationInFrames], zoom, CL);
  const fade = "linear-gradient(to bottom, transparent 0%, #000 8%, #000 86%, transparent 100%)";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DEEP }}>
      <Img src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(46px) brightness(0.4) saturate(1.3)", scale: "1.35" }} />
      <div style={{ position: "absolute", left: (1080 - width) / 2, top, width, transformOrigin: "50% 40%", scale: String(sc) }}>
        <Img src={url} style={{ width: "100%", display: "block", WebkitMaskImage: fade, maskImage: fade }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- habillage ---------------- */
const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "contrast(1.1) saturate(1.12) brightness(0.95)" }}>{children}</AbsoluteFill>
);
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
);
const Shade: React.FC<{ h?: number; top?: boolean }> = ({ h = 900, top }) => (
  <div style={{ position: "absolute", left: 0, right: 0, [top ? "top" : "bottom"]: 0, height: h,
    background: `linear-gradient(to ${top ? "bottom" : "top"}, rgba(7,16,46,0.96) 0%, rgba(7,16,46,0.65) 45%, transparent 100%)` }} />
);

const Rise: React.FC<{ children: React.ReactNode; at?: number; dur?: number; dy?: number; style?: React.CSSProperties }> = ({ children, at = 0, dur = 12, dy = 60, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...CL, easing: OUT });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dy}px)`, filter: `blur(${(1 - p) * 8}px)`, ...style }}>{children}</div>;
};

/** Texte qui se révèle derrière un masque (glisse depuis le bas). */
const Mask: React.FC<{ children: React.ReactNode; at?: number; style?: React.CSSProperties }> = ({ children, at = 0, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], { ...CL, easing: OUT });
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Bandes blaugrana qui balaient l'écran (transition signature). */
const StripeWipe: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 16 }) => {
  const frame = useCurrentFrame();
  const n = 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: n }).map((_, i) => {
        const d = i * 1.2;
        const p = interpolate(frame, [at + d, at + d + dur], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
        const y = interpolate(p, [0, 1], [110, -110]);
        return <div key={i} style={{ position: "absolute", top: 0, left: `${(i * 100) / n}%`, width: `${100 / n + 0.5}%`, height: "100%",
          background: i % 2 ? BLAU : GRANA, transform: `translateY(${y}%)` }} />;
      })}
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
      background: `linear-gradient(105deg, transparent ${p * 100 - 12}%, rgba(255,230,160,0.55) ${p * 100}%, transparent ${p * 100 + 12}%)` }} />
  );
};

const Particles: React.FC<{ count?: number; color?: string }> = ({ count = 40, color = GOLD }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`px${i}`) * 1080;
        const sp = 1 + random(`ps${i}`) * 3;
        const y = 1920 - ((frame * sp * 3 + random(`py${i}`) * 1920) % 2100);
        const r = 2 + random(`pr${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: color, opacity: 0.35 + random(`po${i}`) * 0.5, boxShadow: `0 0 ${r * 3}px ${color}` }} />;
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

/** Petit habillage permanent en haut. */
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

/** Carte « chapitre » : kicker doré, titre, ligne de détail, score en bandeau. */
const Card: React.FC<{ kicker: string; title: string; title2?: string; detail?: string; score?: string; at?: number; bottom?: number }> = ({
  kicker, title, title2, detail, score, at = 2, bottom = 300,
}) => (
  <AbsoluteFill>
    <Shade />
    <div style={{ position: "absolute", left: 70, right: 70, bottom }}>
      <Rise at={at} dy={30}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.35em", color: GOLD }}>{kicker}</div></Rise>
      <Mask at={at + 3}><div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 1.04, color: WHITE }}>{title}</div></Mask>
      {title2 && <Mask at={at + 6}><div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 1.04, color: GOLD }}>{title2}</div></Mask>}
      {detail && <Rise at={at + 9} dy={24}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.86)", marginTop: 12, letterSpacing: "0.04em" }}>{detail}</div></Rise>}
      {score && (
        <Rise at={at + 12} dy={24}>
          <div style={{ display: "inline-flex", marginTop: 24, overflow: "hidden", borderRadius: 6 }}>
            <div style={{ width: 14, background: `linear-gradient(${GRANA} 50%, ${BLAU} 50%)` }} />
            <div style={{ padding: "8px 28px", background: "rgba(7,16,46,0.85)", fontFamily: DISPLAY, fontSize: 66, color: WHITE, letterSpacing: "0.03em" }}>{score}</div>
          </div>
        </Rise>
      )}
    </div>
  </AbsoluteFill>
);

const Count: React.FC<{ to: number; at: number; dur?: number }> = ({ to, at, dur = 22 }) => {
  const frame = useCurrentFrame();
  return <>{Math.round(interpolate(frame, [at, at + dur], [0, to], { ...CL, easing: OUT }))}</>;
};

/* ---------------- scènes ---------------- */

// 0 – 6.09 : ouverture en couleur, drapeau blaugrana, titre
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [0, 22], [0, 1], { ...CL, easing: OUT });
  return (
    <AbsoluteFill>
      <Grade><Full src="crest_flag" zoom={[1.3, 1.08]} pos="50% 45%" filter="brightness(0.38) saturate(1.15) blur(2px)" /></Grade>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(7,16,46,0.55) 0%, transparent 70%)" }} />
      <Particles count={36} />
      <LightSweep at={8} dur={40} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: `${0.2 + split * 0.4}em`, color: GOLD, opacity: split }}>MÉS QUE UN CLUB</div>
        <Mask at={10}><div style={{ fontFamily: DISPLAY, fontSize: 250, color: WHITE, lineHeight: 1, textShadow: "0 12px 50px rgba(0,0,0,0.6)" }}>BARÇA</div></Mask>
        <Rise at={24} dy={20}>
          <div style={{ display: "flex", gap: 0, marginTop: 18, height: 12, width: 520 }}>
            {[GRANA, BLAU, GRANA, BLAU, GRANA, BLAU].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>
        </Rise>
        <Rise at={34} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: WHITE, letterSpacing: "0.3em", marginTop: 26 }}>LE PARCOURS</div></Rise>
      </AbsoluteFill>
      <StripeWipe at={-8} dur={16} />
    </AbsoluteFill>
  );
};

// 6.09 – 12.09 : l'ère Flick
const Flick: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(3)}><Grade><Clip src="yamal_edit" trim={3.2} zoom={[1.0, 1.1]} /></Grade></Sequence>
    <Sequence from={s(3)}><Grade><Clip src="goal" trim={0.2} rate={1.0} zoom={[1.15, 1.25]} /></Grade></Sequence>
    <Vignette />
    <Bug />
    <Card kicker="DEPUIS 2024" title="L'ÈRE" title2="HANSI FLICK" detail="Du jeu. De l'audace. Des trophées." />
    <Flash at={[0, s(3)]} strength={0.6} />
  </AbsoluteFill>
);

// 12.09 – 18.09 : le triplé 2025
const TROPHIES = ["LIGA", "COPA DEL REY", "SUPERCOPA"];
const Treble: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(2)}><Grade><Clip src="celebration" trim={0.5} rate={1.1} /></Grade></Sequence>
      <Sequence from={s(2)}><Grade><Clip src="celebration" trim={44} rate={0.9} zoom={[1.0, 1.12]} /></Grade></Sequence>
      <Vignette />
      <Shade h={1100} />
      <Bug />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Rise at={2} dy={30}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.35em", color: GOLD }}>SAISON 2024-25</div></Rise>
        <Mask at={4}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.04, color: WHITE }}>LE TRIPLÉ</div></Mask>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
          {TROPHIES.map((t, i) => {
            const at = s(1 + i * 1.0);
            const p = interpolate(frame, [at, at + 10], [0, 1], { ...CL, easing: OUT });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, opacity: p, transform: `translateX(${(1 - p) * -80}px)` }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: DISPLAY, fontSize: 32, color: DEEP, boxShadow: `0 0 ${20 * p}px ${GOLD}` }}>✓</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 70, color: WHITE, letterSpacing: "0.03em" }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Flash at={[0, s(2)]} strength={0.6} />
    </AbsoluteFill>
  );
};

// 18.09 – 24.09 : DROP — Supercoupe 2026
const Supercopa: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = interpolate(frame, [0, 12], [24, 0], CL);
  return (
    <AbsoluteFill style={{ transform: `translate(${(random(`a${frame}`) - 0.5) * shake}px, ${(random(`b${frame}`) - 0.5) * shake}px)` }}>
      <Sequence durationInFrames={s(2)}><Grade><Clip src="goal" trim={2.6} rate={0.9} zoom={[1.3, 1.15]} /></Grade></Sequence>
      <Sequence from={s(2)}><Grade><Clip src="trophy_pitch" trim={1.0} rate={1.0} zoom={[1.0, 1.1]} /></Grade></Sequence>
      <Vignette />
      <Bug />
      <Particles count={30} />
      <Sequence from={s(1.5)} layout="none">
        <Card kicker="11 JANVIER 2026 · DJEDDAH" title="SUPERCOUPE" detail="Doublé de Raphinha en finale" score="BARÇA 3-2 REAL MADRID" at={0} />
      </Sequence>
      <Shockwave at={0} />
      <Flash at={[0]} strength={1} len={10} />
    </AbsoluteFill>
  );
};

// 24.09 – 30.09 : le Clásico du titre
const Titre: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(4)}>
      <Grade><Framed src="champions" top={150} width={1150} zoom={[1.0, 1.08]} /></Grade>
      <LightSweep at={6} dur={30} />
    </Sequence>
    <Sequence from={s(4)}><Grade><Clip src="celebration" trim={36} rate={1.0} zoom={[1.05, 1.15]} /></Grade></Sequence>
    <Vignette />
    <Bug />
    <Card kicker="10 MAI 2026 · CAMP NOU" title="LE CLÁSICO" title2="DU TITRE" detail="Rashford et Ferran Torres en 20 minutes" score="BARÇA 2-0 REAL MADRID" />
    <Flash at={[0, s(4)]} strength={0.6} />
  </AbsoluteFill>
);

// 30.09 – 34.09 : 29 titres, 2 de suite
const Vingtneuf: React.FC = () => (
  <AbsoluteFill>
    <Grade><Clip src="celebration" trim={45} rate={0.85} zoom={[1.1, 1.2]} filter="brightness(0.7)" /></Grade>
    <Vignette />
    <Particles count={50} />
    <Shade h={1200} />
    <Bug />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 70px 290px" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 380, color: GOLD, lineHeight: 0.95, textShadow: `0 0 60px rgba(237,187,0,0.55)` }}><Count to={29} at={0} /></div>
      <Rise at={6} dy={20}><div style={{ fontFamily: DISPLAY, fontSize: 92, color: WHITE, lineHeight: 1.05 }}>TITRES DE CHAMPION</div></Rise>
      <Rise at={12} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.86)", letterSpacing: "0.12em", marginTop: 10 }}>2025 · 2026 — DEUX DE SUITE</div></Rise>
    </AbsoluteFill>
    <Flash at={[0]} color={GOLD} strength={0.5} />
  </AbsoluteFill>
);

// 34.09 – 36.09 : respiration
const Breath: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Grade><Clip src="yamal_edit" trim={0.2} rate={0.5} zoom={[1.2, 1.28]} filter={`brightness(${interpolate(frame, [0, 60], [0.5, 0.8], CL)}) saturate(0.6)`} /></Grade>
      <Vignette />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Rise at={4} dy={20}><div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 56, color: WHITE, letterSpacing: "0.2em", textAlign: "center" }}>ET AU CŒUR</div></Rise>
        <Rise at={14} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: GOLD, letterSpacing: "0.2em", textAlign: "center" }}>DE TOUT ÇA…</div></Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 36.09 – 42.09 : Lamine Yamal
const Yamal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s(2)}><Grade><Clip src="yamal_kopa" trim={0.6} zoom={[1.15, 1.05]} /></Grade></Sequence>
      <Sequence from={s(2)} durationInFrames={s(2)}><Grade><Clip src="yamal_kopa" trim={5.2} rate={0.9} zoom={[1.0, 1.1]} /></Grade></Sequence>
      <Sequence from={s(4)}><Grade><Clip src="yamal_edit" trim={12.0} rate={0.9} zoom={[1.05, 1.15]} /></Grade></Sequence>
      <Vignette />
      <Shade h={1000} />
      <Bug label="LE NUMÉRO 10" />
      {/* grand 10 en filigrane */}
      <div style={{ position: "absolute", right: -40, top: 380, fontFamily: DISPLAY, fontSize: 900, lineHeight: 1, color: "transparent",
        WebkitTextStroke: `4px rgba(237,187,0,${interpolate(frame, [0, 20], [0, 0.55], CL)})`, transform: `translateY(${interpolate(frame, [0, 180], [40, -40])}px)` }}>10</div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Rise at={4} dy={30}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.35em", color: GOLD }}>UN ENFANT DE LA MASIA</div></Rise>
        <Mask at={8}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.03, color: WHITE }}>LAMINE</div></Mask>
        <Mask at={12}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.03, color: WHITE }}>YAMAL</div></Mask>
        <Rise at={20} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.86)", marginTop: 12 }}>La magie à chaque ballon.</div></Rise>
      </div>
      <Flash at={[0, s(2), s(4)]} strength={0.55} />
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
  return (
    <AbsoluteFill>
      <Grade><Framed src="attack" top={330} width={1080} zoom={[1.0, 1.06]} /></Grade>
      <Vignette />
      <Bug label="L'ATTAQUE" />
      {PLAYERS.map((p, i) => {
        const at = s(0.5 + i * 0.5);
        const k = interpolate(frame, [at, at + 10], [0, 1], { ...CL, easing: OUT });
        const ly = 330 + p.y * 1.0;
        return (
          <div key={p.name} style={{ position: "absolute", left: p.x, top: ly - 170, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: k }}>
            <div style={{ padding: "6px 14px", background: i % 2 ? BLAU : GRANA, fontFamily: SANS, fontWeight: 800, fontSize: 24, color: WHITE, letterSpacing: "0.06em",
              whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * k})`, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
              <span style={{ color: GOLD }}>{p.n}</span> {p.name}
            </div>
            <div style={{ width: 3, height: 90 * k, background: GOLD }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 16px ${GOLD}` }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 300 }}>
        <Rise at={s(3)} dy={30}><div style={{ fontFamily: DISPLAY, fontSize: 110, color: WHITE, lineHeight: 1.05 }}>UNE ATTAQUE</div></Rise>
        <Rise at={s(3.4)} dy={30}><div style={{ fontFamily: DISPLAY, fontSize: 110, color: GOLD, lineHeight: 1.05 }}>DE FEU</div></Rise>
      </div>
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
      <Sequence durationInFrames={s(3)}><Grade><Clip src="yamal_edit2" trim={4.3} zoom={[1.05, 1.15]} /></Grade></Sequence>
      <Sequence from={s(3)}><Grade><Clip src="trophy_pitch" trim={6.0} rate={0.9} zoom={[1.0, 1.12]} /></Grade></Sequence>
      <Vignette />
      <Shade h={1150} />
      <Bug label="LIGA · J12" />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 290 }}>
        <Rise at={2} dy={20}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "10px 22px", background: GRANA, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: WHITE, letterSpacing: "0.2em" }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: WHITE, opacity: blink }} /> CE SOIR · 21H
          </div>
        </Rise>
        <Mask at={6}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.03, color: WHITE }}>LE LEADER</div></Mask>
        <Mask at={10}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.03, color: GOLD }}>EN MISSION</div></Mask>
        <Rise at={16} dy={20}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.88)", marginTop: 14 }}>Atlético – Barça · Metropolitano, Madrid</div></Rise>
        <Rise at={22} dy={20}>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {[["1er", "DE LIGA"], ["+2", "PTS D'AVANCE"]].map(([a, b]) => (
              <div key={b} style={{ padding: "12px 22px", background: "rgba(255,255,255,0.08)", borderTop: `5px solid ${GOLD}` }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 64, color: WHITE, lineHeight: 1 }}>{a}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: GOLD, letterSpacing: "0.2em", marginTop: 6 }}>{b}</div>
              </div>
            ))}
          </div>
        </Rise>
      </div>
      <StripeWipe at={-8} dur={14} />
    </AbsoluteFill>
  );
};

// 54.09 – 58.3 : fin
const Fin: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [s(3.4), s(4.2)], [0, 1], CL);
  return (
    <AbsoluteFill>
      <Grade><Full src="visca" zoom={[1.12, 1.0]} pos="50% 40%" /></Grade>
      <Particles count={30} />
      <LightSweep at={4} dur={30} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230 }}>
        <Shade h={600} />
        <Rise at={10} dy={20}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: WHITE, position: "relative" }}>@viber.flow4</div></Rise>
        <Rise at={16} dy={14}><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: "rgba(255,255,255,0.8)", marginTop: 12, position: "relative" }}>#FCBarcelona #ViscaBarça #LaLiga #AtletiBarça</div></Rise>
      </AbsoluteFill>
      <Shockwave at={0} />
      <Flash at={[0]} color={GOLD} strength={0.7} len={10} />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

/* ---------------- timeline ---------------- */
const SCENES: { from: number; to: number; el: React.ReactNode }[] = [
  { from: 0, to: B(12), el: <Opening /> },
  { from: B(12), to: B(24), el: <Flick /> },
  { from: B(24), to: B(36), el: <Treble /> },
  { from: B(36), to: B(48), el: <Supercopa /> },
  { from: B(48), to: B(60), el: <Titre /> },
  { from: B(60), to: B(68), el: <Vingtneuf /> },
  { from: B(68), to: B(72), el: <Breath /> },
  { from: B(72), to: B(84), el: <Yamal /> },
  { from: B(84), to: B(96), el: <Attaque /> },
  { from: B(96), to: B(108), el: <CeSoir /> },
  { from: B(108), to: 58.3, el: <Fin /> },
];

/** Plages prévues pour la voix off (début, fin en secondes) — à remplir avec les fichiers vo/l*.wav. */
export const FCB_VO: { at: number; file?: string }[] = [];

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.1, mixBlendMode: "overlay" }}>
      <svg width="1080" height="1920">
        <filter id="fcbn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#fcbn)" />
      </svg>
    </AbsoluteFill>
  );
};

const Sound: React.FC = () => {
  const hits = [B(36), B(108)];
  const whooshes = [B(12), B(24), B(30), B(48), B(56), B(60), B(72), B(76), B(80), B(84), B(96), B(102)];
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
    {SCENES.map((sc) => (
      <Sequence key={sc.from} from={s(sc.from)} durationInFrames={s(sc.to) - s(sc.from)}>{sc.el}</Sequence>
    ))}
    <Grain />
    <Sound />
  </AbsoluteFill>
);

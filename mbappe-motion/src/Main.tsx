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
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  BODY,
  Clip,
  clamp,
  Confetti,
  DISPLAY,
  f,
  FPS,
  Finish,
  GlitchWord,
  GoldText,
  LightLeak,
  Particles,
  Photo,
  Rays,
  RiseText,
  Shockwave,
  SpeedLines,
  ZoomCut,
} from "./fx";

loadFont({ family: "Anton", url: staticFile("fonts/anton.woff2"), weight: "400" });
loadFont({
  family: "Montserrat",
  url: staticFile("fonts/montserrat-latin-600-normal.woff2"),
  weight: "600",
});
loadFont({
  family: "Montserrat",
  url: staticFile("fonts/montserrat-latin-800-normal.woff2"),
  weight: "800",
});

/* Music pulse: 70 BPM -> one beat = 0.857 s */
const BEAT = 60 / 70;
const T = (n: number) => f(n * BEAT);
export const TOTAL = f(58.27);
const HANDLE = "@viber.flow4";

/* Cut points that get a white flash + shake */
const CUTS = [8, 12, 16, 20, 23, 25, 27, 29, 31, 33, 35, 36, 38, 40, 42, 44, 46, 48, 50, 52, 56, 58, 64].map(T);
const BIG_HITS = [T(4), T(16), T(20), T(36), T(50), T(52), T(58)];

/* Goals: the ball hits the net EXACTLY on a beat.
   hit = moment (s) in the clip where the ball goes in / is struck.
   pre = playback speed before the hit, post = slow-motion after the hit. */
const GOALS: { src: string; hit: number; pre: number; post: number }[] = [
  { src: "g_b", hit: 2.1, pre: 1.3, post: 0.55 },
  { src: "fra_goal1", hit: 0.85, pre: 0.72, post: 0.5 },
  { src: "g_e", hit: 1.4, pre: 1.3, post: 0.55 },
  { src: "g_f", hit: 0.8, pre: 0.9, post: 0.55 },
  { src: "fra_goal2", hit: 2.0, pre: 1.3, post: 0.6 },
  { src: "g_a", hit: 0.85, pre: 0.95, post: 0.55 },
];
const GOAL_SLOT = (i: number) => T(23 + i * 2);
const GOAL_HIT = (i: number) => T(24 + i * 2); // 2nd beat of each 2-beat slot
const WC_HIT = T(19);
const GOAL_HITS = [WC_HIT, ...GOALS.map((_, i) => GOAL_HIT(i))];

/* ===================== GLOBAL CAMERA SHAKE ===================== */
const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  let amp = 0;
  for (const c of CUTS) if (frame >= c) amp = Math.max(amp, 12 * Math.exp(-(frame - c) / 3));
  for (const c of BIG_HITS) if (frame >= c) amp = Math.max(amp, 34 * Math.exp(-(frame - c) / 5));
  for (const c of GOAL_HITS) if (frame >= c) amp = Math.max(amp, 28 * Math.exp(-(frame - c) / 4));
  const x = (random(`shx${frame}`) - 0.5) * 2 * amp;
  const y = (random(`shy${frame}`) - 0.5) * 2 * amp;
  const r = (random(`shr${frame}`) - 0.5) * amp * 0.06;
  return (
    <AbsoluteFill style={{ translate: `${x}px ${y}px`, rotate: `${r}deg`, scale: String(1 + amp / 600) }}>
      {children}
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const c of CUTS) if (frame >= c) o = Math.max(o, 0.75 * Math.exp(-(frame - c) / 2.2));
  for (const c of BIG_HITS) if (frame >= c) o = Math.max(o, 1 * Math.exp(-(frame - c) / 3.5));
  for (const c of GOAL_HITS) if (frame >= c) o = Math.max(o, 0.7 * Math.exp(-(frame - c) / 2.6));
  return <AbsoluteFill style={{ backgroundColor: "#fff8e6", opacity: o, pointerEvents: "none" }} />;
};

/* ===================== SCENE 1 — INTRO ===================== */
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = T(4);
  const beat = (frame % T(1)) / T(1);
  const heart = frame < hit ? Math.exp(-beat * 6) : 0;
  const tenIn = interpolate(frame, [T(2), hit - 2], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {frame < hit && (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,180,60,${0.1 + heart * 0.35}) 0%, transparent ${30 + heart * 25}%)`,
            }}
          />
          <Particles count={110} converge={[0, T(2.3)]} seed="intro" rise={false} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ opacity: tenIn, scale: String(interpolate(tenIn, [0, 1], [0.4, 1]) * (1 + heart * 0.05)) }}>
              <GoldText size={560} style={{ letterSpacing: -10 }}>
                10
              </GoldText>
            </div>
          </AbsoluteFill>
        </>
      )}
      {frame >= hit && (
        <>
          <ZoomCut inFrames={10} outFrames={4}>
            <Photo src="7" zoom={[1.25, 1.05]} originY="25%" />
          </ZoomCut>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 85%)" }} />
          <Shards at={hit} />
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
            <GlitchWord text="KYLIAN" start={hit + 8} size={150} stagger={2} />
            <GlitchWord text="MBAPPÉ" start={hit + 16} size={230} gold stagger={2} />
            <div style={{ height: 24 }} />
            <RiseText start={hit + 38}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 46, color: "#fff", letterSpacing: 10, textAlign: "center" }}>
                IL N'Y A QU'UN SEUL ROI.
              </div>
            </RiseText>
          </AbsoluteFill>
          <Particles count={40} seed="intro2" opacity={0.7} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* gold shards exploding from the "10" */
const Shards: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 30) return null;
  return (
    <AbsoluteFill>
      {new Array(26).fill(0).map((_, i) => {
        const a = random(`sh-a${i}`) * Math.PI * 2;
        const sp = 40 + random(`sh-s${i}`) * 70;
        const x = 540 + Math.cos(a) * sp * t;
        const y = 960 + Math.sin(a) * sp * t + t * t * 1.2;
        const s = 40 + random(`sh-z${i}`) * 110;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              width: s,
              height: s,
              background: "linear-gradient(135deg,#fff3b8,#e2a83a 50%,#7a4d0c)",
              clipPath: `polygon(${random(`p1${i}`) * 50}% 0%, 100% ${random(`p2${i}`) * 60}%, ${40 + random(`p3${i}`) * 60}% 100%, 0% ${30 + random(`p4${i}`) * 50}%)`,
              rotate: `${t * (random(`sh-r${i}`) - 0.5) * 40}deg`,
              opacity: interpolate(t, [18, 30], [1, 0], clamp),
              boxShadow: "0 0 30px rgba(255,200,80,0.8)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ===================== SCENE 2 — VITESSE ===================== */
const Speed: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ZoomCut>
        <Clip src="dribble" rate={1.25} zoom={[1.15, 1.02]} />
      </ZoomCut>
      <SpeedLines opacity={0.45} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 330,
            color: "transparent",
            WebkitTextStroke: "4px rgba(255,255,255,0.85)",
            translate: `${interpolate(frame, [0, T(4)], [500, -650])}px 0px`,
            whiteSpace: "nowrap",
            opacity: 0.8,
            rotate: "-90deg",
          }}
        >
          VITESSE · VITESSE
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 80px 430px" }}>
        <RiseText start={6}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: "#f5c84c", letterSpacing: 8 }}>
            LA VITESSE.
          </div>
        </RiseText>
        <RiseText start={14}>
          <GoldText size={150}>INARRÊTABLE</GoldText>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Chase: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ZoomCut inScale={0.6}>
        {/* background layer: blurred, slower */}
        <Photo src="1" zoom={[1.35, 1.45]} style={{ filter: "blur(18px) brightness(0.55)" }} />
        {/* foreground layer: sharp, faster parallax */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              width: 1000,
              height: 1228,
              overflow: "hidden",
              borderRadius: 26,
              boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 3px rgba(245,200,76,0.8)",
              rotate: `${interpolate(frame, [0, T(4)], [-3, 2])}deg`,
              scale: String(interpolate(frame, [0, T(4)], [0.92, 1.02])),
              position: "relative",
            }}
          >
            <Img
              src={staticFile("img/1.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                scale: String(interpolate(frame, [0, T(4)], [1.05, 1.22])),
                translate: `${interpolate(frame, [0, T(4)], [-30, 30])}px 0px`,
              }}
            />
          </div>
        </AbsoluteFill>
      </ZoomCut>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
        <RiseText start={5}>
          <div style={{ fontFamily: DISPLAY, fontSize: 120, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>
            PERSONNE
          </div>
        </RiseText>
        <RiseText start={11}>
          <GoldText size={96}>NE LE RATTRAPE</GoldText>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== SCENE 3 — BUTS ===================== */
const Tag: React.FC<{ top: string; main: string; start?: number }> = ({ top, main, start = 4 }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 190 }}>
    <RiseText start={start}>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 8,
          color: "#000",
          background: "linear-gradient(90deg,#f7d774,#fff3c4,#e0a93a)",
          padding: "10px 26px",
          textAlign: "center",
        }}
      >
        {top}
      </div>
    </RiseText>
    <RiseText start={start + 5}>
      <div style={{ fontFamily: DISPLAY, fontSize: 104, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.85)", textAlign: "center" }}>
        {main}
      </div>
    </RiseText>
  </AbsoluteFill>
);

/* Speed ramp: fast into the hit (on the beat), slow-motion after it */
const RampShot: React.FC<{
  src: string;
  hit: number;
  hitFrame: number;
  pre: number;
  post: number;
  dur: number;
}> = ({ src, hit, hitFrame, pre, post, dur }) => {
  const frame = useCurrentFrame();
  const punch = frame >= hitFrame ? 1 + 0.12 * Math.exp(-(frame - hitFrame) / 6) : 1;
  const start = Math.max(0, hit - (hitFrame / FPS) * pre);
  return (
    <AbsoluteFill style={{ scale: String(punch * interpolate(frame, [0, dur], [1.04, 1.16])) }}>
      <Sequence durationInFrames={hitFrame} layout="none">
        <Clip src={src} trim={start} rate={pre} zoom={[1, 1]} />
      </Sequence>
      <Sequence from={hitFrame} durationInFrames={dur - hitFrame} layout="none">
        <AbsoluteFill>
          <Clip src={src} trim={hit} rate={post} zoom={[1, 1]} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const WorldCupFinal: React.FC = () => (
  <AbsoluteFill>
    <ZoomCut outFrames={4}>
      <RampShot src="wc_goal" hit={3.55} hitFrame={WC_HIT - T(16)} pre={1.15} post={0.55} dur={T(20) - T(16)} />
    </ZoomCut>
    <Tag top="FINALE · COUPE DU MONDE 2022" main="LE PLUS GRAND MATCH" />
    <Sequence from={WC_HIT - T(16)} layout="none">
      <Shockwave at={0} y="45%" />
    </Sequence>
  </AbsoluteFill>
);

const Scream: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Clip src="wc_scream" trim={0.5} rate={0.75} zoom={[1.0, 1.15]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8))" }} />
      <Shockwave at={0} y="40%" />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 400 }}>
        <div style={{ scale: String(interpolate(frame, [0, 8], [2.4, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })), opacity: interpolate(frame, [0, 4], [0, 1], clamp) }}>
          <GoldText size={200}>TRIPLÉ</GoldText>
        </div>
        <RiseText start={10}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#fff", textAlign: "center" }}>
            EN FINALE DE COUPE DU MONDE
          </div>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GoalCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(
    interpolate(frame, [0, T(13)], [0, 400], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) }),
  );
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9 }}>
        BUTS EN CARRIÈRE
      </div>
      <GoldText size={190} style={{ fontVariantNumeric: "tabular-nums" }}>
        {String(n).padStart(3, "0")}
      </GoldText>
    </AbsoluteFill>
  );
};

/* "BUT" stamp on each goal */
const Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const at = T(1);
  const p = interpolate(frame, [at, at + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const o = interpolate(frame, [at, at + 2, T(2) - 4, T(2)], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 230,
          color: "#fff",
          opacity: o,
          scale: String(interpolate(p, [0, 1], [3, 1])),
          rotate: "-6deg",
          textShadow: "8px 0 rgba(255,0,60,0.7), -8px 0 rgba(0,220,255,0.7), 0 10px 40px rgba(0,0,0,0.8)",
        }}
      >
        BUT !
      </div>
    </AbsoluteFill>
  );
};

/* ===================== DROP — +400 ===================== */
const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={T(2)}>
        <ZoomCut inScale={1.6}>
          <Clip src="celeb_slide" rate={0.95} zoom={[1.1, 1.0]} />
        </ZoomCut>
      </Sequence>
      <Sequence from={T(2)} durationInFrames={T(2)}>
        <ZoomCut inScale={1.4}>
          <Photo src="2" zoom={[1.15, 1.3]} originY="35%" />
        </ZoomCut>
      </Sequence>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(0,0,0,0.15), rgba(0,0,0,0.7))" }} />
      <Shockwave at={0} />
      <Shockwave at={T(2)} />
      <Particles count={60} seed="drop" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
        <div style={{ scale: String(interpolate(p, [0, 1], [3.5, 1])), opacity: p }}>
          <GoldText size={330} style={{ letterSpacing: -4 }}>
            +400
          </GoldText>
        </div>
        <RiseText start={8}>
          <div style={{ fontFamily: DISPLAY, fontSize: 110, color: "#fff", letterSpacing: 14, textShadow: "0 8px 30px #000" }}>
            BUTS
          </div>
        </RiseText>
        <RiseText start={T(2)}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, color: "#f5c84c", letterSpacing: 8 }}>
            AVANT 27 ANS.
          </div>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== TROPHÉES ===================== */
const TROPHIES = [
  { img: "3", title: "CHAMPION DU MONDE", sub: "RUSSIE 2018", y: "35%" },
  { img: "11", title: "MEILLEUR BUTEUR", sub: "COUPE DU MONDE 2022 · 8 BUTS", y: "30%" },
  { img: "8", title: "LIGUE DES NATIONS", sub: "VAINQUEUR 2021", y: "30%" },
  { img: "5", title: "COUPE INTERCONTINENTALE", sub: "FIFA · 2024", y: "30%" },
  { img: "4", title: "JOUEUR DU MATCH", sub: "LIGUE DES CHAMPIONS", y: "25%" },
];

const TrophyCard: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const t = TROPHIES[i];
  const d = T(2);
  const dir = i % 2 === 0 ? 1 : -1;
  const pin = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pout = interpolate(frame, [d - 6, d], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: "#050403" }}>
      <Photo src={t.img} zoom={[1.4, 1.5]} originY={t.y} style={{ filter: "blur(30px) brightness(0.35) saturate(1.3)" }} />
      <Rays />
      <AbsoluteFill style={{ perspective: 1800, justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}>
        <div
          style={{
            width: 760,
            height: 1000,
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            rotate: `0 1 0 ${interpolate(pin, [0, 1], [-95 * dir, 0]) + interpolate(pout, [0, 1], [0, 95 * dir]) + interpolate(frame, [0, d], [6 * dir, -6 * dir])}deg`,
            scale: String(interpolate(pin, [0, 1], [0.7, 1]) * interpolate(frame, [0, d], [0.98, 1.04])),
            boxShadow: "0 0 0 5px #e9bd55, 0 0 0 9px #6b4510, 0 50px 140px rgba(0,0,0,0.9), 0 0 120px rgba(255,190,70,0.45)",
          }}
        >
          <Img
            src={staticFile(`img/${t.img}.jpg`)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${t.y}`, scale: String(interpolate(frame, [0, d], [1.04, 1.14])) }}
          />
          {/* glossy sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 48%, transparent 60%)",
              translate: `${interpolate(frame, [4, 26], [-120, 120], clamp)}% 0%`,
              mixBlendMode: "screen",
            }}
          />
        </div>
      </AbsoluteFill>
      <Confetti count={45} seed={`cf${i}`} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 56, color: "transparent", WebkitTextStroke: "2px #f5c84c", letterSpacing: 6, opacity: pin }}>
          {`0${i + 1} / 05`}
        </div>
        <RiseText start={3} dur={9}>
          <GoldText size={t.title.length > 18 ? 84 : 104} style={{ textAlign: "center" }}>
            {t.title}
          </GoldText>
        </RiseText>
        <RiseText start={8} dur={9}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, letterSpacing: 6, color: "#fff", textAlign: "center" }}>
            {t.sub}
          </div>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LigueOne: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(7, 1 + Math.floor(frame / 2.4));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <Rays opacity={0.35} />
      <Particles count={50} seed="l1" />
      <div style={{ scale: String(interpolate(frame, [0, T(2)], [1.1, 0.95])) }}>
        <GoldText size={460} style={{ textAlign: "center" }}>{`${n}×`}</GoldText>
      </div>
      <RiseText start={6}>
        <div style={{ fontFamily: DISPLAY, fontSize: 100, color: "#fff", letterSpacing: 6, textAlign: "center" }}>CHAMPION DE FRANCE</div>
      </RiseText>
      <RiseText start={16}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, color: "#f5c84c", letterSpacing: 5, textAlign: "center" }}>
          5× MEILLEUR JOUEUR DE LIGUE 1
        </div>
      </RiseText>
    </AbsoluteFill>
  );
};

const GoldenShoe: React.FC = () => (
  <AbsoluteFill>
    <ZoomCut inScale={1.5}>
      <Clip src="golden_shoe" trim={2.0} rate={1.45} zoom={[1.25, 1.1]} style={{ objectPosition: "50% 40%" }} />
    </ZoomCut>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75), transparent 35%, transparent 60%, rgba(0,0,0,0.8))" }} />
    <Particles count={50} seed="gs" />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 200 }}>
      <RiseText start={4}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 36, letterSpacing: 10, color: "#fff", textAlign: "center" }}>
          MEILLEUR BUTEUR D'EUROPE
        </div>
      </RiseText>
      <RiseText start={9}>
        <GoldText size={150} style={{ textAlign: "center" }}>SOULIER D'OR</GoldText>
      </RiseText>
      <RiseText start={16}>
        <div style={{ fontFamily: DISPLAY, fontSize: 70, color: "#fff", letterSpacing: 4, textAlign: "center" }}>
          2025 · 31 BUTS EN LIGA
        </div>
      </RiseText>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ===================== FINAL — LE ROI ===================== */
const King: React.FC = () => {
  const frame = useCurrentFrame();
  const lines: { text: string; at: number; gold?: boolean; size: number }[] = [
    { text: "PAS DE COMPARAISON.", at: T(0.5), size: 92 },
    { text: "PAS DE DÉBAT.", at: T(2), size: 92 },
  ];
  const fadeLines = interpolate(frame, [T(3.6), T(3.9)], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <ZoomCut inScale={1.4} outFrames={1}>
        <Photo src="6" zoom={[1.02, 1.25]} originY="22%" style={{ filter: `brightness(${interpolate(frame, [T(4), T(6)], [1, 0.45], clamp)})` }} />
      </ZoomCut>
      {/* crown glint */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          background: `radial-gradient(circle at ${interpolate(frame, [10, 40], [20, 70], clamp)}% 13%, rgba(255,240,190,${interpolate(frame, [10, 25, 40], [0, 0.9, 0], clamp)}) 0%, transparent 12%)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.9) 88%)" }} />
      <Particles count={70} seed="king" />
      <LightLeak at={0} dur={30} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 430, opacity: fadeLines }}>
        {lines.map((l) => (
          <RiseText key={l.text} start={l.at}>
            <div style={{ fontFamily: DISPLAY, fontSize: l.size, color: "#fff", letterSpacing: 4, textShadow: "0 8px 30px #000" }}>{l.text}</div>
          </RiseText>
        ))}
      </AbsoluteFill>
      <Sequence from={T(4)}>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 470 }}>
          <Shockwave at={0} y="62%" />
          <GlitchWord text="LE MEILLEUR" start={0} size={150} stagger={1} />
          <GlitchWord text="AU MONDE." start={8} size={190} gold stagger={1} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const end = interpolate(frame, [f(3.0), f(3.4)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: end }}>
      <Rays opacity={0.4} />
      <Particles count={80} seed="outro" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 260 }}>
        <div style={{ scale: String(interpolate(p, [0, 1], [0.5, 1])), opacity: p }}>
          <GoldText size={420} style={{ letterSpacing: -8 }}>10</GoldText>
        </div>
        <GlitchWord text="KYLIAN MBAPPÉ" start={6} size={110} stagger={1} />
        <RiseText start={16}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 12, color: "#f5c84c" }}>LE ROI DU FOOTBALL</div>
        </RiseText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== HANDLE (bottom) ===================== */
const Handle: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const big = interpolate(frame, [T(12) - 6, T(12) + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pulse = 1 + 0.04 * Math.max(0, Math.sin((frame / T(1)) * Math.PI * 2));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: interpolate(big, [0, 1], [215, 330]) }}>
      <div
        style={{
          translate: `0px ${(1 - p) * 160}px`,
          opacity: p,
          scale: String(interpolate(big, [0, 1], [1, 1.35]) * pulse),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 34px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: "2px solid rgba(245,200,76,0.9)",
            boxShadow: "0 0 30px rgba(245,200,76,0.45)",
          }}
        >
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: 1 }}>{HANDLE}</div>
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: "#f5c84c", letterSpacing: 2, textShadow: "0 2px 10px #000" }}>
          #mbappe #kylianmbappe #football #viberflow4
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: 6, opacity: big }}>ABONNE-TOI</div>
      </div>
    </AbsoluteFill>
  );
};

/* ===================== SFX ===================== */
/* ===================== VOIX OFF ===================== */
/* [start (s) in the video, clip duration (s)] — each line lands on its scene/beat */
const VO: [number, number][] = [
  [4.55, 1.41], // Il n'y a qu'un seul roi.
  [T(8) / FPS + 0.3, 0.85], // La vitesse.
  [T(9.5) / FPS, 0.93], // La puissance.
  [T(12) / FPS + 0.2, 1.32], // Personne ne le rattrape.
  [T(16) / FPS + 0.25, 1.54], // Finale de Coupe du monde...
  [T(20) / FPS + 0.12, 0.78], // Triplé !
  [T(36) / FPS + 0.12, 1.30], // Plus de quatre cents buts !
  [T(40) / FPS + 0.2, 1.02], // Champion du monde.
  [T(50) / FPS + 0.1, 1.57], // Sept fois champion de France.
  [T(52) / FPS + 0.3, 1.63], // Soulier d'or européen.
  [T(58.5) / FPS, 0.97], // Pas de comparaison.
  [T(60) / FPS, 0.70], // Pas de débat.
  [T(62) / FPS + 0.08, 1.00], // Le meilleur au monde.
  [T(64) / FPS + 0.25, 1.04], // Kylian Mbappé.
];

/* music ducks under the voice */
const musicVolume = (fr: number) => {
  let duck = 0;
  for (const [s, d] of VO) {
    const a = f(s);
    const b = f(s + d);
    duck = Math.max(duck, interpolate(fr, [a - 6, a, b, b + 8], [0, 1, 1, 0], clamp));
  }
  const fadeOut = interpolate(fr, [TOTAL - 20, TOTAL], [1, 0], clamp);
  return (1 - 0.5 * duck) * fadeOut;
};

const VoiceOver: React.FC = () => (
  <>
    {VO.map(([s, d], i) => (
      <Sequence key={`vo${i}`} from={f(s)} durationInFrames={f(d) + 6} name={`Voix ${i + 1}`}>
        <Audio src={staticFile(`vo/vo${i}.wav`)} volume={1} />
      </Sequence>
    ))}
  </>
);

const Sfx: React.FC = () => {
  const whooshes = [T(8), T(12), T(16), T(20), T(40), T(42), T(44), T(46), T(48), T(52), T(56), T(64)];
  const impacts = [T(4), T(36), T(50), T(58), T(62), ...GOAL_HITS];
  const shines = [T(40), T(42), T(44), T(46), T(48), T(52)];
  return (
    <>
      {whooshes.map((w, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, w - 9)} durationInFrames={24}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}
      {impacts.map((w, i) => (
        <Sequence key={`i${i}`} from={w} durationInFrames={48}>
          <Audio src={staticFile("sfx/impact.wav")} volume={0.55} />
        </Sequence>
      ))}
      {shines.map((w, i) => (
        <Sequence key={`s${i}`} from={w + 3} durationInFrames={36}>
          <Audio src={staticFile("sfx/shine.wav")} volume={0.18} />
        </Sequence>
      ))}
    </>
  );
};

/* ===================== MAIN ===================== */
export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake>
        <Sequence durationInFrames={T(8)} name="Intro">
          <Intro />
        </Sequence>
        <Sequence from={T(8)} durationInFrames={T(12) - T(8)} name="Vitesse">
          <Speed />
        </Sequence>
        <Sequence from={T(12)} durationInFrames={T(16) - T(12)} name="Personne">
          <Chase />
        </Sequence>
        <Sequence from={T(16)} durationInFrames={T(20) - T(16)} name="Finale 2022">
          <WorldCupFinal />
        </Sequence>
        <Sequence from={T(20)} durationInFrames={T(23) - T(20)} name="Triplé">
          <Scream />
        </Sequence>
        {GOALS.map((g, i) => (
          <Sequence key={g.src} from={GOAL_SLOT(i)} durationInFrames={T(25 + i * 2) - GOAL_SLOT(i)} name={`But ${i + 1}`}>
            <ZoomCut inFrames={5} outFrames={4} inScale={1.25}>
              <RampShot
                src={g.src}
                hit={g.hit}
                hitFrame={GOAL_HIT(i) - GOAL_SLOT(i)}
                pre={g.pre}
                post={g.post}
                dur={T(25 + i * 2) - GOAL_SLOT(i)}
              />
            </ZoomCut>
            <Stamp />
          </Sequence>
        ))}
        <Sequence from={T(35)} durationInFrames={T(36) - T(35)} name="Build">
          <Clip src="celeb_close" rate={1} zoom={[1.1, 1.35]} />
        </Sequence>
        <Sequence from={T(23)} durationInFrames={T(36) - T(23)} name="Compteur">
          <GoalCounter />
        </Sequence>
        <Sequence from={T(36)} durationInFrames={T(40) - T(36)} name="+400">
          <Drop />
        </Sequence>
        {TROPHIES.map((t, i) => (
          <Sequence key={t.img} from={T(40 + i * 2)} durationInFrames={T(42 + i * 2) - T(40 + i * 2)} name={`Trophée ${i + 1}`}>
            <TrophyCard i={i} />
          </Sequence>
        ))}
        <Sequence from={T(50)} durationInFrames={T(52) - T(50)} name="7x Ligue 1">
          <LigueOne />
        </Sequence>
        <Sequence from={T(52)} durationInFrames={T(56) - T(52)} name="Soulier d'or">
          <GoldenShoe />
        </Sequence>
        <Sequence from={T(56)} durationInFrames={T(58) - T(56)} name="Célébration">
          <ZoomCut inScale={1.5}>
            <Clip src="celeb_knee" rate={0.72} zoom={[1.05, 1.2]} />
          </ZoomCut>
        </Sequence>
        <Sequence from={T(58)} durationInFrames={T(64) - T(58)} name="Le Roi">
          <King />
        </Sequence>
        <Sequence from={T(64)} name="Outro">
          <Outro />
        </Sequence>
        <LightLeak at={T(8) - 8} dur={22} />
        <LightLeak at={T(16) - 8} dur={22} hue={-15} />
        <LightLeak at={T(40) - 8} dur={22} />
        <LightLeak at={T(52) - 8} dur={22} hue={10} />
      </Shake>
      <Flash />
      <Finish />
      <Sequence from={T(52)} name="Handle">
        <Handle />
      </Sequence>
      <Audio src={staticFile("music.wav")} volume={(fr) => musicVolume(fr)} />
      <Sfx />
      <VoiceOver />
    </AbsoluteFill>
  );
};

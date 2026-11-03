import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { Drop, Ripples, Splash } from "../fx/Water";
import { PrintMark, PrintWord } from "../merch/Garments";
import { PhotoGarment } from "../merch/PhotoGarment";
import { C, displayFont, labelFont } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

type Item = {
  key: string;
  name: string;
  sub: string;
  src: string;
  w: number;
  h: number;
  height: number;
  glow: string;
  target: [number, number];
  dropSize: number;
  dark?: boolean;
  cardHeight: number;
  print: (id: string) => React.ReactNode;
};

const INK = "#15151c";

export const ITEMS: Item[] = [
  {
    key: "polo",
    name: "POLO",
    sub: "Piqué coton · Col contrasté",
    src: "garments/polo.png",
    w: 412,
    h: 516,
    height: 820,
    glow: "rgba(69,140,255,0.5)",
    target: [272, 178],
    dropSize: 14,
    cardHeight: 330,
    print: (id) => (
      <>
        <g transform="translate(272 178)">
          <PrintMark w={74} id={id} />
        </g>
        <g transform="translate(272 232)">
          <PrintWord size={21} color={INK} motion={false} />
        </g>
      </>
    ),
  },
  {
    key: "polo-zip",
    name: "POLO ZIP",
    sub: "Maille texturée · Col zippé",
    src: "garments/polo-black.png",
    w: 704,
    h: 808,
    height: 800,
    glow: "rgba(255,176,58,0.45)",
    target: [492, 232],
    dropSize: 20,
    dark: true,
    cardHeight: 320,
    print: (id) => (
      <>
        <g transform="translate(492 232)">
          <PrintMark w={118} id={id} />
        </g>
        <g transform="translate(492 318)">
          <PrintWord size={33} color="#ffffff" />
        </g>
      </>
    ),
  },
  {
    key: "cap",
    name: "CASQUETTE",
    sub: "Trucker · Filet respirant",
    src: "garments/cap.png",
    w: 566,
    h: 599,
    height: 760,
    glow: "rgba(255,90,31,0.45)",
    target: [300, 170],
    dropSize: 22,
    cardHeight: 250,
    print: (id) => (
      <>
        <g transform="translate(300 160)">
          <PrintMark w={200} id={id} />
        </g>
        <g transform="translate(300 300)">
          <PrintWord size={48} color={INK} motion={false} />
        </g>
      </>
    ),
  },
  {
    key: "hoodie",
    name: "HOODIE",
    sub: "Molleton 400 g · Coupe oversize",
    src: "garments/hoodie.png",
    w: 468,
    h: 587,
    height: 840,
    glow: "rgba(123,92,255,0.5)",
    target: [238, 246],
    dropSize: 18,
    cardHeight: 330,
    print: (id) => (
      <>
        <g transform="translate(238 246)">
          <PrintMark w={120} id={id} />
        </g>
        <g transform="translate(238 326)">
          <PrintWord size={38} color={INK} />
        </g>
      </>
    ),
  },
  {
    key: "pants",
    name: "PANTALON",
    sub: "Molleton gris chiné · Coupe droite",
    src: "garments/pants.png",
    w: 471,
    h: 860,
    height: 860,
    glow: "rgba(240,48,74,0.45)",
    target: [150, 215],
    dropSize: 16,
    cardHeight: 360,
    print: (id) => (
      <>
        <g transform="translate(150 215)">
          <PrintMark w={92} id={id} />
        </g>
        <g transform="translate(150 282)">
          <PrintWord size={27} color={INK} />
        </g>
      </>
    ),
  },
];

export const ITEM_STEP = 55;
const IMPACT = 24;

const ItemShot: React.FC<{ item: Item; index: number }> = ({ item, index }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const gx = 1250;
  const gy = 560;
  const reveal = interpolate(f, [0, 22], [0, 1], { ...cl, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  const radius = reveal * Math.hypot(width, height);
  const enter = interpolate(f, [0, 34], [0, 1], { ...cl, easing: out });
  const rotY = interpolate(enter, [0, 1], [32, 0]) + Math.sin(f / 22) * 4;
  const floatY = Math.sin(f / 16) * 8;
  const fall = interpolate(f, [8, IMPACT], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const printP = interpolate(f, [IMPACT, IMPACT + 14], [0, 1], { ...cl, easing: out });
  const flash = interpolate(f, [IMPACT, IMPACT + 2, IMPACT + 16], [0, 1, 0], cl);
  const [tx, ty] = item.target;
  const textIn = (d: number) => interpolate(f, [8 + d, 30 + d], [0, 1], { ...cl, easing: out });
  const id = `g${index}`;

  return (
    <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${gx}px ${gy}px)` }}>
      <Background warm={index % 2 ? 0.6 : 1.2} cool={index % 2 ? 1.2 : 0.7} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${gx}px ${gy}px, ${item.glow}, transparent 45%)`,
        }}
      />
      {/* giant outlined word scrolling behind */}
      <AbsoluteFill style={{ justifyContent: "center" }}>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 420,
            whiteSpace: "nowrap",
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.07)",
            translate: `${-200 - f * 4}px 0`,
          }}
        >
          {item.name} · {item.name} · {item.name}
        </div>
      </AbsoluteFill>
      <Air count={40} speed={1} seed={`m${index}`} streaks={8} opacity={0.8} />

      {/* platform ring */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <ellipse cx={gx} cy={gy + 410} rx={360 * enter} ry={60 * enter} fill="none" stroke="url(#plat)" strokeWidth={3} opacity={0.7} />
        <ellipse cx={gx} cy={gy + 400} rx={300 * enter} ry={46 * enter} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 10" />
        <defs>
          <linearGradient id="plat" x1="0" x2="1">
            <stop offset="0" stopColor={C.orange} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
        </defs>
      </svg>

      {/* garment */}
      <div
        style={{
          position: "absolute",
          left: gx,
          top: gy,
          translate: `-50% calc(-50% + ${floatY + (1 - enter) * 80}px)`,
          transform: `perspective(1800px) rotateY(${rotY * 0.45}deg)`,
          scale: interpolate(enter, [0, 1], [0.82, 1]),
          opacity: enter,
          filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.55)) drop-shadow(0 0 60px rgba(255,255,255,0.06))",
        }}
      >
        <PhotoGarment
          src={item.src}
          w={item.w}
          h={item.h}
          height={item.height}
          id={id}
          dark={item.dark}
          print={
            <g
              opacity={printP}
              transform={`translate(${tx} ${ty}) scale(${interpolate(printP, [0, 1], [1.35, 1])}) translate(${-tx} ${-ty})`}
            >
              {item.print(`${id}p`)}
            </g>
          }
          overlay={
            <>
              {f < IMPACT ? <Drop cx={tx} cy={interpolate(fall, [0, 1], [-260, ty])} size={item.dropSize} stretch={1 + fall} id={`${id}d`} /> : null}
              <Ripples frame={f} t0={IMPACT} cx={tx} cy={ty} count={4} maxR={item.w * 0.45} squash={0.8} duration={36} gap={4} id={`${id}r`} width={2.5} />
              <Splash frame={f} t0={IMPACT} cx={tx} cy={ty} count={18} power={0.35} id={`${id}s`} />
              <circle cx={tx} cy={ty} r={item.w * 0.22} fill="#fff" opacity={flash * 0.6} style={{ mixBlendMode: "overlay" }} />
            </>
          }
        />
      </div>

      {/* typography */}
      <div style={{ position: "absolute", left: 140, top: 330, width: 760 }}>
        <div
          style={{
            fontFamily: labelFont,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 10,
            color: C.motion,
            opacity: textIn(0),
            translate: `${(1 - textIn(0)) * -40}px 0`,
          }}
        >
          0{index + 1} / 0{ITEMS.length} — VYRO WEAR
        </div>
        <div style={{ overflow: "hidden", marginTop: 14 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 108,
              lineHeight: 1.05,
              whiteSpace: "nowrap",
              color: C.white,
              translate: `0 ${(1 - textIn(4)) * 110}%`,
            }}
          >
            {item.name}
          </div>
        </div>
        <div
          style={{
            height: 4,
            width: 260 * textIn(10),
            marginTop: 22,
            background: `linear-gradient(90deg, ${C.orange}, ${C.violet}, ${C.blue})`,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: labelFont,
            fontWeight: 500,
            fontSize: 34,
            color: "rgba(255,255,255,0.75)",
            marginTop: 26,
            opacity: textIn(14),
            translate: `${(1 - textIn(14)) * -30}px 0`,
          }}
        >
          {item.sub}
        </div>
      </div>

      {/* edge ring of the circle wipe */}
      {reveal < 1 ? (
        <svg width={width} height={height} style={{ position: "absolute" }}>
          <circle cx={gx} cy={gy} r={Math.max(0, radius - 6)} fill="none" stroke="url(#plat)" strokeWidth={12} opacity={0.9} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

const Lineup: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cardW = 326;
  const gap = 26;
  const total = cardW * ITEMS.length + gap * (ITEMS.length - 1);
  const reveal = interpolate(f, [0, 22], [0, 1], { ...cl, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  const cam = interpolate(f, [0, 90], [1.12, 1], { ...cl, easing: out });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${reveal * Math.hypot(width, height)}px at 50% 55%)` }}>
      <Background />
      <Air count={70} speed={0.8} seed="lineup" />
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <Ripples frame={f} t0={6} cx={width / 2} cy={height * 0.58} count={6} maxR={1300} squash={0.3} duration={70} gap={8} id="lur" width={3} />
      </svg>
      <AbsoluteFill style={{ scale: cam }}>
        <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center" }}>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 92,
                color: C.white,
                translate: `0 ${(1 - interpolate(f, [6, 28], [0, 1], { ...cl, easing: out })) * 110}%`,
              }}
            >
              PORTE LE <span style={{ color: C.motion }}>MOUVEMENT</span>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 300, left: (width - total) / 2, display: "flex", gap }}>
          {ITEMS.map((item, i) => {
            const p = interpolate(f, [10 + i * 6, 34 + i * 6], [0, 1], { ...cl, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
            const o = interpolate(f, [10 + i * 6, 20 + i * 6], [0, 1], cl);
            return (
              <div
                key={item.key}
                style={{
                  width: cardW,
                  height: 560,
                  borderRadius: 34,
                  padding: 2,
                  background: `linear-gradient(160deg, rgba(255,176,58,0.7), rgba(123,92,255,0.25) 50%, rgba(69,200,255,0.7))`,
                  opacity: o,
                  translate: `0 ${(1 - p) * 120 + Math.sin((f + i * 12) / 18) * 6}px`,
                  scale: interpolate(p, [0, 1], [0.85, 1]),
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 32,
                    background: `radial-gradient(circle at 50% 40%, ${item.glow}, #0d0c18 70%)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: 380, marginTop: 30, display: "flex", alignItems: "center", filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.5))" }}>
                    <PhotoGarment src={item.src} w={item.w} h={item.h} height={item.cardHeight} id={`lu${i}`} dark={item.dark} print={item.print(`lu${i}p`)} />
                  </div>
                  <div style={{ fontFamily: displayFont, fontSize: 34, color: C.white, marginTop: 22 }}>{item.name}</div>
                  <div style={{ fontFamily: labelFont, fontWeight: 600, fontSize: 20, letterSpacing: 6, color: C.motion, marginTop: 8 }}>
                    VYRO MOTION
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MERCH_DURATION = ITEM_STEP * ITEMS.length + 100;

export const Merch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      {ITEMS.map((item, i) => (
        <Sequence key={item.key} from={i * ITEM_STEP} durationInFrames={i === 3 ? ITEM_STEP + 30 : ITEM_STEP + 25}>
          <ItemShot item={item} index={i} />
        </Sequence>
      ))}
      <Sequence from={ITEM_STEP * ITEMS.length + 5}>
        <Lineup />
      </Sequence>
    </AbsoluteFill>
  );
};

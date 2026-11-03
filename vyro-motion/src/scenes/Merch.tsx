import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { Drop, Ripples, Splash } from "../fx/Water";
import { Garment, GarmentKind, PrintMark, PrintWord } from "../merch/Garments";
import { C, displayFont, labelFont } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

type Item = {
  kind: GarmentKind;
  name: string;
  sub: string;
  color: string;
  shade: string;
  glow: string;
  target: [number, number];
  print: (id: string) => React.ReactNode;
  sheen: number;
};

export const ITEMS: Item[] = [
  {
    kind: "tee",
    name: "T-SHIRT",
    sub: "Oversize · Coton bio 240 g",
    color: "#1a1a22",
    shade: "#000",
    glow: "rgba(255,90,31,0.45)",
    target: [500, 330],
    sheen: 1,
    print: (id) => (
      <>
        <g transform="translate(500 330)">
          <PrintMark w={210} id={id} />
        </g>
        <g transform="translate(500 525)">
          <PrintWord size={78} color="#fff" />
        </g>
      </>
    ),
  },
  {
    kind: "cap",
    name: "CASQUETTE",
    sub: "6 panneaux · Logo brodé",
    color: "#ebe3d3",
    shade: "#5a4630",
    glow: "rgba(69,200,255,0.45)",
    target: [500, 440],
    sheen: 1,
    print: (id) => (
      <g transform="translate(505 440)">
        <PrintMark w={200} id={id} />
      </g>
    ),
  },
  {
    kind: "hoodie",
    name: "HOODIE",
    sub: "Molleton 400 g · Capuche doublée",
    color: "#ece7df",
    shade: "#5d5468",
    glow: "rgba(123,92,255,0.5)",
    target: [500, 400],
    sheen: 1,
    print: (id) => (
      <>
        <g transform="translate(500 400)">
          <PrintMark w={170} id={id} />
        </g>
        <g transform="translate(500 565)">
          <PrintWord size={60} color="#16161d" />
        </g>
      </>
    ),
  },
  {
    kind: "pants",
    name: "JOGGER",
    sub: "Coupe fuselée · Bandes contrastées",
    color: "#23232b",
    shade: "#000",
    glow: "rgba(240,48,74,0.45)",
    target: [395, 300],
    sheen: 1,
    print: (id) => (
      <>
        <g transform="translate(395 300)">
          <PrintMark w={110} id={id} lines={false} />
        </g>
        <g transform="translate(628 560) rotate(90)">
          <text textAnchor="middle" fontFamily={displayFont} fontSize={44} fill="#fff" letterSpacing={6}>
            VYRO
          </text>
        </g>
      </>
    ),
  },
];

export const ITEM_STEP = 55;
const IMPACT = 24;
const BOX = 860;

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
        <ellipse cx={gx} cy={gy + 400} rx={360 * enter} ry={60 * enter} fill="none" stroke="url(#plat)" strokeWidth={3} opacity={0.7} />
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
          left: gx - BOX / 2,
          top: gy - BOX / 2,
          width: BOX,
          height: BOX,
          translate: `0 ${floatY + (1 - enter) * 80}px`,
          transform: `perspective(1600px) rotateY(${rotY}deg)`,
          scale: interpolate(enter, [0, 1], [0.82, 1]),
          opacity: enter,
        }}
      >
        <Garment
          kind={item.kind}
          color={item.color}
          shade={item.shade}
          id={id}
          sheen={item.sheen}
          print={
            <g
              opacity={printP}
              transform={`translate(${tx} ${ty}) scale(${interpolate(printP, [0, 1], [1.35, 1])}) translate(${-tx} ${-ty})`}
            >
              {item.print(`${id}p`)}
            </g>
          }
        />
        <svg viewBox="0 0 1000 1000" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {f < IMPACT ? <Drop cx={tx} cy={interpolate(fall, [0, 1], [-500, ty])} size={30} stretch={1 + fall} id={`${id}d`} /> : null}
          <Ripples frame={f} t0={IMPACT} cx={tx} cy={ty} count={4} maxR={420} squash={0.75} duration={36} gap={4} id={`${id}r`} width={4} />
          <Splash frame={f} t0={IMPACT} cx={tx} cy={ty} count={18} power={0.6} id={`${id}s`} />
          <circle cx={tx} cy={ty} r={180} fill="#fff" opacity={flash * 0.5} style={{ mixBlendMode: "overlay" }} />
        </svg>
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
          0{index + 1} / 04 — VYRO WEAR
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
  const cardW = 380;
  const gap = 36;
  const total = cardW * 4 + gap * 3;
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
                key={item.kind}
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
                  <div style={{ width: 360, height: 400, marginTop: 30 }}>
                    <Garment kind={item.kind} color={item.color} shade={item.shade} id={`lu${i}`} sheen={item.sheen} print={item.print(`lu${i}p`)} />
                  </div>
                  <div style={{ fontFamily: displayFont, fontSize: 40, color: C.white, marginTop: 24 }}>{item.name}</div>
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

export const MERCH_DURATION = ITEM_STEP * 4 + 100;

export const Merch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      {ITEMS.map((item, i) => (
        <Sequence key={item.kind} from={i * ITEM_STEP} durationInFrames={i === 3 ? ITEM_STEP + 30 : ITEM_STEP + 25}>
          <ItemShot item={item} index={i} />
        </Sequence>
      ))}
      <Sequence from={ITEM_STEP * 4 + 5}>
        <Lineup />
      </Sequence>
    </AbsoluteFill>
  );
};

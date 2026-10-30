import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, CORE, Finish, Flare, FontFaces, GOLD, H, IVORY, SANS, SERIF, Trail, W, expo, glow, inOut, p} from './lib';
import {R, WatchBody, WatchDefs} from './Watch';

const CX = 540;
const CY = 960;
const WS = 0.85; // échelle de la montre en plan héros
const RING = R * WS;

// Le fil part de l'étincelle, boucle autour du « O » puis souligne le nom.
const O = {x: 270, y: 955, r: 95};
const NAME_PATH =
  `M ${CX} ${CY} C 420 1160, 60 1190, 120 1060 C 150 1010, 200 ${O.y + O.r}, ${O.x} ${O.y + O.r} ` +
  `A ${O.r} ${O.r} 0 1 0 ${O.x} ${O.y - O.r} A ${O.r} ${O.r} 0 1 0 ${O.x} ${O.y + O.r} ` +
  `C 380 1050, 420 1085, 540 1078 S 760 1045, 1160 1062`;
const DIAL_PATH = `M ${CX} ${CY - RING} A ${RING} ${RING} 0 1 1 ${CX} ${CY + RING} A ${RING} ${RING} 0 1 1 ${CX} ${CY - RING}`;
const MED = [
  {y: 900, label: 'MOUVEMENT', sub: 'Automatique · 42 h de réserve', vb: '-120 -200 250 250', at: 382},
  {y: 1150, label: 'VERRE', sub: 'Saphir bombé anti-reflet', vb: '190 -115 230 230', at: 402},
  {y: 1400, label: 'BOÎTIER', sub: 'Or champagne · 41 mm', vb: '-170 210 340 340', at: 422},
];
const MX = 280;
const MR = 112;
const SPINE_PATH = `M ${CX} 700 C ${CX} 800, ${MX} 760, ${MX} ${MED[0].y} L ${MX} ${MED[2].y + 160}`;

const Letter: React.FC<{ch: string; x: number; at: number; out: number}> = ({ch, x, at, out}) => {
  const f = useCurrentFrame();
  const a = p(f, at, at + 14);
  const o = p(f, out, out + 16);
  return (
    <div style={{position: 'absolute', left: x, top: 955, transform: `translate(-50%,-52%) translateY(${(1 - a) * 14}px)`,
      fontFamily: SERIF, fontWeight: 500, fontSize: 170, color: interpolate(a, [0, 0.4, 1], [0, 1, 1]) < 1 ? CORE : IVORY,
      opacity: a * (1 - o), filter: `blur(${o * 14}px)`, textShadow: `0 0 ${30 * (1 - a) + 8}px ${GOLD}88`}}>
      {ch}
    </div>
  );
};

/** Cadran lumineux : anneau, index et aiguilles en lumière (scènes 3–4). */
const LightDial: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const move = p(f, 118, 148, inOut);
  const cx = interpolate(move, [0, 1], [O.x, CX]);
  const cy = interpolate(move, [0, 1], [O.y, CY]);
  const r = interpolate(move, [0, 1], [O.r, RING]);
  const ringIn = p(f, 72, 84);
  const fade = 1 - p(f, 252, 285);
  if (f < 72 || fade <= 0) return null;
  const grow = p(f, 182, 202);
  const sp = spring({frame: f - 192, fps, config: {damping: 13, mass: 0.9}});
  const hour = -40 + sp * (305 + 40);
  const minute = -40 + sp * (60 + 40);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fade, filter: glow(GOLD, 0.8)}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth={5} opacity={ringIn} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={CORE} strokeWidth={1.6} opacity={ringIn} />
      {new Array(12).fill(0).map((_, i) => {
        const a = p(f, 150 + i * 2.6, 156 + i * 2.6);
        return (
          <g key={i} transform={`translate(${CX} ${CY}) rotate(${i * 30})`} opacity={a}>
            <line x1={0} y1={-238 * WS} x2={0} y2={-(238 - (i === 0 ? 48 : 40) * a) * WS} stroke={CORE} strokeWidth={i === 0 ? 7 : 5} strokeLinecap="round" />
          </g>
        );
      })}
      {grow > 0 && (
        <g transform={`translate(${CX} ${CY})`}>
          <line x1={0} y1={0} x2={0} y2={-140 * WS * grow} stroke={CORE} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hour})`} />
          <line x1={0} y1={0} x2={0} y2={-215 * WS * grow} stroke={CORE} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minute})`} />
          <circle r={9} fill={CORE} />
        </g>
      )}
    </svg>
  );
};

/** Ruban hélicoïdal autour de la montre (E6). `front` = moitié devant le boîtier. */
const Helix: React.FC<{front: boolean}> = ({front}) => {
  const f = useCurrentFrame();
  const grow = p(f, 248, 300, inOut);
  const unwind = p(f, 318, 356, inOut);
  if (grow <= 0 || unwind >= 1) return null;
  const N = 260;
  const phase = f * 0.045;
  const segs: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    if (t1 > grow || t0 < unwind) continue;
    const pt = (t: number) => {
      const th = phase + t * Math.PI * 2 * 2.4;
      return {x: CX + 390 * Math.cos(th), y: 560 + t * 1000 + 70 * Math.sin(th), z: Math.sin(th)};
    };
    const a = pt(t0);
    const b = pt(t1);
    if (a.z > 0 !== front) continue;
    const depth = (a.z + 1) / 2;
    segs.push(<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={depth > 0.5 ? CORE : GOLD}
      strokeWidth={2 + depth * 6} strokeLinecap="round" opacity={0.25 + depth * 0.75} />);
  }
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: glow(GOLD, front ? 1 : 0.5)}}>{segs}</svg>;
};

const Watch: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const show = p(f, 238, 270);
  if (show <= 0) return null;
  const up = p(f, 352, 384, inOut) * (1 - p(f, 448, 482, inOut));
  const rotY = interpolate(f, [238, 352, 452, 525], [-26, 12, 8, -4], {extrapolateRight: 'clamp'});
  const scale = WS * interpolate(f, [238, 300, 450, 525], [0.9, 1, 1, 1.06], {extrapolateRight: 'clamp', easing: expo}) * (1 - 0.42 * up);
  // aiguille des secondes : un cran par seconde, avec rebond
  const tick = Math.floor((f - 240) / 30);
  const snap = spring({frame: (f - 240) % 30, fps, config: {damping: 9, mass: 0.35}});
  const second = (Math.max(0, tick) + Math.min(1, snap)) * 6;
  const sheen = interpolate(f, [462, 515], [-1.8, 1.8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{perspective: 1700, opacity: show * (1 - 0.5 * up)}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0,
        transform: `translateY(${-470 * up}px) rotateX(6deg) rotateY(${rotY}deg)`, filter: 'drop-shadow(0 50px 60px rgba(0,0,0,.7))'}}>
        <WatchDefs />
        <g transform={`translate(${CX} ${CY}) scale(${scale})`}>
          <WatchBody hour={305} minute={60} second={second} sheen={sheen} edge={-rotY * 0.9} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Medallions: React.FC = () => {
  const f = useCurrentFrame();
  const out = p(f, 444, 462);
  if (f < 370 || out >= 1) return null;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {MED.map((m, i) => {
        const ring = p(f, m.at, m.at + 16);
        const fill = p(f, m.at + 10, m.at + 26);
        const lab = p(f, m.at + 14, m.at + 30);
        return (
          <React.Fragment key={i}>
            <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
              <WatchDefs />
              <defs><clipPath id={`mc${i}`}><circle cx={MX} cy={m.y} r={MR * fill} /></clipPath></defs>
              <circle cx={MX} cy={m.y} r={MR} fill="#0E0B09" opacity={ring} />
              <g clipPath={`url(#mc${i})`}>
                <svg x={MX - MR} y={m.y - MR} width={MR * 2} height={MR * 2} viewBox={m.vb} preserveAspectRatio="xMidYMid slice">
                  <g transform={`scale(${1.12 - 0.12 * fill})`}><WatchBody hour={305} minute={60} second={(f - 240) / 5} edge={0} /></g>
                </svg>
              </g>
              <circle cx={MX} cy={m.y} r={MR} fill="none" stroke={GOLD} strokeWidth={4} pathLength={1}
                strokeDasharray={`${ring} 2`} transform={`rotate(-90 ${MX} ${m.y})`} style={{filter: glow(GOLD, 0.6)}} />
              <line x1={MX + MR + 24} y1={m.y} x2={MX + MR + 24 + 90 * lab} y2={m.y} stroke={GOLD} strokeWidth={2} />
            </svg>
            <div style={{position: 'absolute', left: MX + MR + 140, top: m.y - 50, opacity: lab, transform: `translateX(${(1 - lab) * 30}px)`}}>
              <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 52, letterSpacing: '0.22em', color: IVORY}}>{m.label}</div>
              <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 26, letterSpacing: '0.06em', color: GOLD, marginTop: 4}}>{m.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Headline: React.FC = () => {
  const f = useCurrentFrame();
  const a = p(f, 196, 222);
  const b = p(f, 256, 284);
  const out = p(f, 342, 360);
  if (a <= 0 || out >= 1) return null;
  const line = (v: number) => ({opacity: v * (1 - out), filter: `blur(${(1 - v) * 10 + out * 10}px)`, transform: `translateY(${(1 - v) * 24}px)`});
  return (
    <div style={{position: 'absolute', top: 170, width: W, textAlign: 'center'}}>
      <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 112, color: IVORY, letterSpacing: '0.02em', ...line(a)}}>Le temps,</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 132, color: GOLD, marginTop: -18,
        textShadow: `0 0 28px ${GOLD}66`, ...line(b)}}>sculpté.</div>
    </div>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 520) return null;
  const head = p(f, 522, 544, inOut);
  const contract = p(f, 546, 560, inOut);
  const flare = interpolate(f, [548, 557, 568, 580], [0, 1.15, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: expo});
  const logo = p(f, 558, 580);
  const rule = p(f, 568, 588);
  const tag = p(f, 574, 590);
  const cta = p(f, 584, 598);
  return (
    <AbsoluteFill>
      {/* rideau : le trait balaie et efface la scène (E14) */}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - head * 100}% 0 0)`}}>
        <Background halo={0.55} />
      </div>
      <div style={{position: 'absolute', left: CX, top: CY - 2, width: W + 80, height: 4, marginLeft: -(W + 80) / 2,
        transformOrigin: f < 546 ? '0% 50%' : '50% 50%', transform: `scaleX(${f < 546 ? head : 1 - contract})`,
        background: `linear-gradient(90deg, transparent, ${GOLD} 20%, ${CORE} 50%, ${GOLD} 80%, transparent)`,
        filter: glow(GOLD), opacity: 1 - contract * 0.3}} />
      {f < 546 && <div style={{position: 'absolute', left: -40 + head * (W + 80), top: CY, width: 22, height: 22, marginLeft: -11, marginTop: -11,
        borderRadius: '50%', background: '#fff', boxShadow: `0 0 30px 10px ${CORE}, 0 0 80px 30px ${GOLD}`}} />}
      <Flare x={CX} y={CY - 110} s={flare} rot={f * 0.6} />
      <div style={{position: 'absolute', top: CY - 210, width: W, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 190,
        color: IVORY, letterSpacing: `${0.7 - 0.38 * logo}em`, paddingLeft: `${0.7 - 0.38 * logo}em`, opacity: logo,
        filter: `blur(${(1 - logo) * 12}px)`, textShadow: `0 0 40px ${GOLD}55`}}>ORYX</div>
      <div style={{position: 'absolute', left: CX - 100 * rule, top: CY + 30, width: 200 * rule, height: 2, background: GOLD, filter: glow(GOLD, 0.4)}} />
      <div style={{position: 'absolute', top: CY + 64, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 300, fontSize: 30,
        letterSpacing: '0.42em', paddingLeft: '0.42em', color: GOLD, opacity: tag}}>LE TEMPS, SCULPTÉ.</div>
      <div style={{position: 'absolute', top: CY + 150, width: W, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500,
        fontSize: 44, color: IVORY, opacity: cta * 0.85, transform: `translateY(${(1 - cta) * 12}px)`}}>Lien en bio</div>
    </AbsoluteFill>
  );
};

export const Oryx: React.FC = () => {
  const f = useCurrentFrame();
  // naissance : deux pulsations puis éclosion, qui se résorbe dans la tête du fil
  const pulse = (c: number) => Math.exp(-((f - c) ** 2) / 18);
  const birth = f < 60 ? 0.12 + 0.28 * pulse(4) + 0.35 * pulse(22) + interpolate(f, [30, 40, 50], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const halo = interpolate(f, [0, 40, 120, 250, 300, 450, 500, 525], [0.25, 0.5, 0.4, 0.6, 1, 0.8, 1, 0.6], {extrapolateRight: 'clamp'});
  const cam = 1 + 0.012 * Math.sin(f / 70) + 0.00006 * f;
  return (
    <AbsoluteFill style={{backgroundColor: '#0E0B09', overflow: 'hidden'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        <Background halo={halo} haloY={f > 352 && f < 470 ? 30 : 50} />
        <Flare x={CX} y={CY} s={birth} rot={f * 1.5} />
        <Trail d={NAME_PATH} from={42} dur={72} len={0.42} />
        {['O', 'R', 'Y', 'X'].map((c, i) => (
          <Letter key={c} ch={c} x={[270, 450, 630, 810][i]} at={[70, 84, 92, 100][i]} out={i === 0 ? 120 : 108 + i * 3} />
        ))}
        <LightDial />
        <Trail d={DIAL_PATH} from={146} dur={34} len={0.3} width={6} ease={(t) => t} />
        <Helix front={false} />
        <Watch />
        <Helix front />
        <Trail d={SPINE_PATH} from={362} dur={60} keep width={4} fadeOut={[440, 458]} />
        <Medallions />
        <Headline />
        <Outro />
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

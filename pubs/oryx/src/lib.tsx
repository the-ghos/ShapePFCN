import React from 'react';
import {Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';

export const W = 1080;
export const H = 1920;
export const GOLD = '#E9C987';
export const CORE = '#FFF4DC';
export const IVORY = '#F7EFE3';

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

export const p = (f: number, a: number, b: number, ease: (t: number) => number = expo) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const glow = (c: string, s = 1) =>
  `drop-shadow(0 0 ${2 * s}px ${CORE}) drop-shadow(0 0 ${9 * s}px ${c}) drop-shadow(0 0 ${26 * s}px ${c})`;

export const SERIF = 'Cormorant';
export const SANS = 'InterL';

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face{font-family:Cormorant;font-weight:500;font-style:normal;src:url(${staticFile('fonts/cormorant-garamond-latin-500-normal.woff2')})}
    @font-face{font-family:Cormorant;font-weight:600;font-style:normal;src:url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')})}
    @font-face{font-family:Cormorant;font-weight:500;font-style:italic;src:url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')})}
    @font-face{font-family:InterL;font-weight:300;src:url(${staticFile('fonts/Inter-Light.otf')})}
    @font-face{font-family:InterL;font-weight:400;src:url(${staticFile('fonts/Inter-Regular.otf')})}
  `}</style>
);

/** E1 — trait lumineux : une portion de longueur `len` (0..1) glisse le long du path.
 *  `keep` : la queue reste accrochée au départ (le tracé reste dessiné). */
export const Trail: React.FC<{
  d: string; from: number; dur: number; len?: number; width?: number;
  keep?: boolean; ease?: (t: number) => number; fadeOut?: [number, number];
}> = ({d, from, dur, len = 0.35, width = 7, keep = false, ease = inOut, fadeOut}) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const t = p(f, from, from + dur, ease);
  const head = keep ? t : t * (1 + len);
  const tail = keep ? 0 : Math.max(0, head - len);
  const vis = Math.max(0, Math.min(head, 1) - tail);
  const op = fadeOut ? 1 - p(f, fadeOut[0], fadeOut[1]) : 1;
  if (vis <= 0.0005 || op <= 0) return null;
  const total = getLength(d);
  const hp = getPointAtLength(d, Math.min(head, 1) * total);
  const dash = {strokeDasharray: `${vis} 3`, strokeDashoffset: -tail};
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, opacity: op, filter: glow(GOLD)}}>
      <path d={d} pathLength={1} fill="none" stroke={GOLD} strokeWidth={width * 1.8} strokeLinecap="round" opacity={0.35} {...dash} />
      <path d={d} pathLength={1} fill="none" stroke={GOLD} strokeWidth={width} strokeLinecap="round" {...dash} />
      <path d={d} pathLength={1} fill="none" stroke={CORE} strokeWidth={width * 0.4} strokeLinecap="round" {...dash} />
      {head < 1 && hp && <circle cx={hp.x} cy={hp.y} r={width * 1.2} fill="#fff" />}
    </svg>
  );
};

/** Étincelle à 4 branches (E7). */
export const Flare: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => {
  if (s <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`}}>
      <div style={{position: 'absolute', left: -90, top: -90, width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}aa 0%, ${GOLD}33 35%, transparent 70%)`}} />
      {[0, 90, 45, 135].map((r, i) => (
        <div key={r} style={{position: 'absolute', left: 0, top: 0, width: i < 2 ? 420 : 160, height: i < 2 ? 3 : 2,
          background: `linear-gradient(90deg, transparent, ${CORE}, transparent)`, opacity: i < 2 ? 1 : 0.5,
          transform: `translate(-50%,-50%) rotate(${r + rot}deg)`}} />
      ))}
      <div style={{position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: '50%', background: '#fff',
        boxShadow: `0 0 24px 8px ${CORE}, 0 0 70px 24px ${GOLD}`}} />
    </div>
  );
};

/** Fond : dégradé brun-noir, halo radial respirant, étoiles/poussières sur 3 profondeurs. */
export const Background: React.FC<{halo: number; haloY?: number}> = ({halo, haloY = 50}) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.05 * Math.sin(f / 14);
  const stars = new Array(150).fill(0).map((_, i) => {
    const depth = i % 3;
    const sp = [0.15, 0.35, 0.7][depth];
    const x = random(`x${i}`) * W;
    const y = (((random(`y${i}`) * (H + 100) - f * sp) % (H + 100)) + H + 100) % (H + 100) - 50;
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(f / (18 + random(`t${i}`) * 30) + i));
    const size = [1.4, 2.4, 4][depth] * (0.7 + random(`s${i}`) * 0.6);
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
      background: depth === 2 ? CORE : '#fff', opacity: tw * [0.35, 0.55, 0.6][depth],
      filter: depth === 2 ? 'blur(1.5px)' : undefined, boxShadow: depth > 0 ? `0 0 ${size * 3}px ${GOLD}` : undefined}} />;
  });
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0E0B09 0%,#1F1712 55%,#0E0B09 100%)'}}>
      <div style={{position: 'absolute', inset: 0, opacity: halo,
        background: `radial-gradient(ellipse ${60 * pulse}% ${36 * pulse}% at 50% ${haloY}%, #6b4a26aa 0%, #3a271633 45%, transparent 75%)`}} />
      {stars}
    </div>
  );
};

/** Grain filmique + vignette. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 50} /></filter>
        <rect width={W} height={H} filter="url(#g)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,.65) 100%)'}} />
    </>
  );
};

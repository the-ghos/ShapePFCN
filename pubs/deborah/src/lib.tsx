import React from 'react';
import {Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// La voix off démarre à V secondes : F(t) convertit un temps de la voix en frame vidéo.
export const V = 0.7;
export const F = (s: number) => Math.round((s + V) * FPS);

export const MAROON = '#5E0B10';
export const RED = '#B3121B';
export const OIL = '#E8401C';
export const OIL_HI = '#FFB347';
export const GOLD = '#F7C948';
export const GREEN = '#1E7B3A';
export const CREAM = '#FFF6E0';
export const WA = '#25D366';

export const BOLD = 'Pop';
export const SCRIPT = 'Kaushan';

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

export const p = (f: number, a: number, b: number, ease: (t: number) => number = expo) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const glow = (c: string, s = 1) =>
  `drop-shadow(0 0 ${2 * s}px ${OIL_HI}) drop-shadow(0 0 ${10 * s}px ${c}) drop-shadow(0 0 ${28 * s}px ${c})`;

export const shadow = '0 6px 24px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.6)';

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face{font-family:Pop;font-weight:600;src:url(${staticFile('fonts/poppins-latin-600-normal.woff2')})}
    @font-face{font-family:Pop;font-weight:800;src:url(${staticFile('fonts/poppins-latin-800-normal.woff2')})}
    @font-face{font-family:Pop;font-weight:900;src:url(${staticFile('fonts/poppins-latin-900-normal.woff2')})}
    @font-face{font-family:Kaushan;font-weight:400;src:url(${staticFile('fonts/kaushan-script-latin-400-normal.woff2')})}
  `}</style>
);

/** Visible seulement entre `from` et `to`. */
export const Show: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};

/** Photo plein cadre avec mouvement Ken Burns (zoom + glissement du point focal). */
export const Photo: React.FC<{
  n: number; from: number; to: number; z?: [number, number]; x?: [number, number]; y?: [number, number];
  filter?: string; style?: React.CSSProperties;
}> = ({n, from, to, z = [1.05, 1.18], x = [50, 50], y = [50, 50], filter, style}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zz = interpolate(t, [0, 1], z);
  const xx = interpolate(t, [0, 1], x);
  const yy = interpolate(t, [0, 1], y);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
      <Img src={staticFile(`img/${n}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: `${xx}% ${yy}%`, transform: `scale(${zz})`, transformOrigin: `${xx}% ${yy}%`, filter}} />
    </div>
  );
};

/** Filet d'huile lumineux (élément conducteur) : portion de longueur `len` qui glisse le long du path. */
export const OilTrail: React.FC<{
  d: string; from: number; dur: number; len?: number; width?: number; keep?: boolean;
  ease?: (t: number) => number; fadeOut?: [number, number];
}> = ({d, from, dur, len = 0.4, width = 12, keep = false, ease = inOut, fadeOut}) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const t = p(f, from, from + dur, ease);
  const head = keep ? t : t * (1 + len);
  const tail = keep ? 0 : Math.max(0, head - len);
  const vis = Math.max(0, Math.min(head, 1) - tail);
  const op = fadeOut ? 1 - p(f, fadeOut[0], fadeOut[1]) : 1;
  if (vis <= 0.0005 || op <= 0) return null;
  const hp = getPointAtLength(d, Math.min(head, 1) * getLength(d));
  const dash = {strokeDasharray: `${vis} 3`, strokeDashoffset: -tail};
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: op, filter: glow(OIL)}}>
      <path d={d} pathLength={1} fill="none" stroke={RED} strokeWidth={width * 1.5} strokeLinecap="round" {...dash} />
      <path d={d} pathLength={1} fill="none" stroke={OIL} strokeWidth={width} strokeLinecap="round" {...dash} />
      <path d={d} pathLength={1} fill="none" stroke={OIL_HI} strokeWidth={width * 0.35} strokeLinecap="round" {...dash} />
      {head < 1 && hp && <circle cx={hp.x} cy={hp.y} r={width * 0.9} fill="#FFE2B0" />}
    </svg>
  );
};

/** Goutte d'huile brillante. */
export const Drop: React.FC<{x: number; y: number; s: number; stretch?: number}> = ({x, y, s, stretch = 1}) => (
  <svg width={120} height={160} viewBox="-60 -90 120 160" style={{position: 'absolute', left: x - 60, top: y - 110,
    transform: `scale(${s}) scaleY(${stretch})`, filter: glow(OIL, 0.7), overflow: 'visible'}}>
    <defs>
      <radialGradient id="dropG" cx=".35" cy=".55" r=".75">
        <stop offset="0" stopColor="#FFD08A" /><stop offset=".35" stopColor={OIL} /><stop offset="1" stopColor="#7A0A06" />
      </radialGradient>
    </defs>
    <path d="M 0 -80 C 18 -45, 45 -10, 45 20 C 45 48, 25 65, 0 65 C -25 65, -45 48, -45 20 C -45 -10, -18 -45, 0 -80 Z" fill="url(#dropG)" />
    <ellipse cx={-16} cy={10} rx={8} ry={16} fill="#fff" opacity={0.75} transform="rotate(20)" />
  </svg>
);

/** Éclaboussure : anneaux + gouttelettes. */
export const Splash: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 40) return null;
  const k = p(f, at, at + 30);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: glow(OIL, 0.6)}}>
      {[0, 6, 12].map((d, i) => {
        const kk = p(f, at + d, at + d + 26);
        return <ellipse key={i} cx={x} cy={y} rx={60 + 380 * kk} ry={(60 + 380 * kk) * 0.32} fill="none" stroke={OIL_HI}
          strokeWidth={6 * (1 - kk)} opacity={1 - kk} />;
      })}
      {new Array(14).fill(0).map((_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * random(`a${i}${at}`));
        const v = 260 + 240 * random(`v${i}${at}`);
        const px = x + Math.cos(a) * v * k;
        const py = y + Math.sin(a) * v * k + 520 * k * k;
        return <circle key={i} cx={px} cy={py} r={(5 + 9 * random(`r${i}`)) * (1 - k * 0.6)} fill={OIL} opacity={1 - k} />;
      })}
    </svg>
  );
};

/** Texte qui « pop » (ressort + flou). */
export const Pop: React.FC<{at: number; out?: number; style: React.CSSProperties; children: React.ReactNode; from?: 'up' | 'down' | 'scale'}> =
({at, out, style, children, from = 'scale'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 13, mass: 0.7}});
  const o = out ? p(f, out, out + 8) : 0;
  if (o >= 1) return null;
  const tr = from === 'scale' ? `scale(${0.55 + 0.45 * s})` : `translateY(${(1 - s) * (from === 'up' ? 60 : -60)}px)`;
  return (
    <div style={{position: 'absolute', width: W, textAlign: 'center', opacity: Math.min(1, s * 1.4) * (1 - o),
      transform: `${tr} scale(${1 - o * 0.2})`, filter: `blur(${(1 - Math.min(1, s)) * 8 + o * 8}px)`, ...style}}>
      {children}
    </div>
  );
};

/** Texte tamponné : arrive gros, s'écrase, petite secousse. */
export const Stamp: React.FC<{at: number; out?: number; style: React.CSSProperties; children: React.ReactNode; rot?: number}> =
({at, out, style, children, rot = -4}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = p(f, at, at + 7, Easing.in(Easing.quad));
  const shake = f - at < 14 && f - at > 6 ? Math.sin((f - at) * 2.6) * (14 - (f - at)) * 1.4 : 0;
  const o = out ? p(f, out, out + 8) : 0;
  if (o >= 1) return null;
  return (
    <div style={{position: 'absolute', width: W, textAlign: 'center', opacity: k * (1 - o),
      transform: `translateX(${shake}px) rotate(${rot}deg) scale(${2.4 - 1.4 * k})`, ...style}}>
      {children}
    </div>
  );
};

/** Fond marron profond, halo chaud, poussières dorées. */
export const Backdrop: React.FC<{tint?: string; halo?: number}> = ({tint = MAROON, halo = 1}) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.05 * Math.sin(f / 15);
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, #1a0305 0%, ${tint} 50%, #1a0305 100%)`}}>
      <div style={{position: 'absolute', inset: 0, opacity: halo,
        background: `radial-gradient(ellipse ${70 * pulse}% ${42 * pulse}% at 50% 48%, ${OIL}66 0%, ${RED}22 45%, transparent 75%)`}} />
      <Dust n={60} />
    </div>
  );
};

export const Dust: React.FC<{n: number; opacity?: number}> = ({n, opacity = 1}) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const depth = i % 3;
        const sp = [0.25, 0.5, 0.9][depth];
        const x = random(`dx${i}`) * W + Math.sin(f / 40 + i) * 10;
        const y = ((((random(`dy${i}`) * (H + 100) - f * sp) % (H + 100)) + H + 100) % (H + 100)) - 50;
        const size = [2, 3.5, 7][depth] * (0.7 + random(`ds${i}`) * 0.6);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (16 + random(`dt${i}`) * 30) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
          background: depth === 2 ? GOLD : '#FFE6B0', opacity: tw * [0.4, 0.5, 0.35][depth] * opacity,
          filter: depth === 2 ? 'blur(2px)' : undefined, boxShadow: `0 0 ${size * 3}px ${OIL_HI}`}} />;
      })}
    </>
  );
};

/** Rayons de soleil qui tournent (fond promo). */
export const Rays: React.FC<{color?: string; opacity?: number}> = ({color = GOLD, opacity = 0.18}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: -600, top: -100, width: W + 1200, height: H + 200, opacity,
      background: `repeating-conic-gradient(from ${f * 0.4}deg at 50% 45%, ${color} 0deg 7deg, transparent 7deg 18deg)`,
      maskImage: 'radial-gradient(circle at 50% 45%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 50% 45%, #000 0%, transparent 70%)'}} />
  );
};

/** Grain + vignette. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 40} /></filter>
        <rect width={W} height={H} filter="url(#g)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
    </>
  );
};

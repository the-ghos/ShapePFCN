import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  Backdrop, BOLD, CREAM, Drop, Dust, F, GOLD, GREEN, H, MAROON, OIL, OIL_HI, OilTrail, Photo, Pop, RED, Rays,
  SCRIPT, Show, Splash, Stamp, W, WA, expo, glow, inOut, p, shadow,
} from './lib';

const T = (size: number, weight = 900, color = CREAM, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: BOLD, fontWeight: weight, fontSize: size, color, lineHeight: 1.02, textShadow: shadow, ...extra,
});
const S = (size: number, color = GOLD, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SCRIPT, fontSize: size, color, lineHeight: 1.1, textShadow: shadow, ...extra,
});
const oilText: React.CSSProperties = {
  background: `linear-gradient(180deg, ${OIL_HI} 0%, ${OIL} 45%, ${RED} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text',
  color: 'transparent', filter: `drop-shadow(0 0 18px ${OIL}aa) drop-shadow(0 6px 10px rgba(0,0,0,.6))`, textShadow: 'none',
};

/** Révélation circulaire bordée d'un anneau d'huile. */
const CircleWipe: React.FC<{from: number; dur?: number; cx?: number; cy?: number; children: React.ReactNode}> =
({from, dur = 22, cx = 540, cy = 960, children}) => {
  const f = useCurrentFrame();
  const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const r = far * p(f, from, from + dur, inOut);
  const ring = 1 - p(f, from + dur - 6, from + dur + 4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `circle(${r}px at ${cx}px ${cy}px)`}}>{children}</AbsoluteFill>
      {ring > 0 && r > 0 && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: glow(OIL), opacity: ring}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={OIL} strokeWidth={12} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={OIL_HI} strokeWidth={4} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

const Whip: React.FC<{from: number; dir?: 1 | -1; children: React.ReactNode}> = ({from, dir = 1, children}) => {
  const f = useCurrentFrame();
  const k = p(f, from, from + 10);
  return (
    <AbsoluteFill style={{transform: `translateX(${(1 - k) * 1100 * dir}px)`, filter: `blur(${(1 - k) * 30}px)`}}>{children}</AbsoluteFill>
  );
};

const Flash: React.FC<{at: number; color?: string}> = ({at, color = '#FFE9B8'}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 2, at, at + 14], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} /> : null;
};

const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0.6, bottom = 0.7}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(20,2,4,${top}) 0%, transparent 30%, transparent 60%, rgba(20,2,4,${bottom}) 100%)`}} />
);

const Warm: React.FC = () => <AbsoluteFill style={{background: `${OIL}22`, mixBlendMode: 'soft-light'}} />;

/** Logo « Chez DEBORAH DOLLARS ». */
export const Logo: React.FC<{at: number; y: number; scale?: number}> = ({at, y, scale = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 10, mass: 0.8}});
  const s2 = spring({frame: f - at - 6, fps, config: {damping: 12}});
  const s3 = spring({frame: f - at - 12, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top: y, width: W, textAlign: 'center', transform: `scale(${scale})`, transformOrigin: '50% 0%'}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 0, transform: `scale(${s2})`, height: 22, marginBottom: 6}}>
        <div style={{width: 40, background: GREEN}} /><div style={{width: 40, background: RED}} /><div style={{width: 40, background: GOLD}} />
      </div>
      <div style={{...S(96, CREAM), transform: `translateX(${-150 + (1 - s2) * -80}px) rotate(-8deg)`, opacity: s2, marginBottom: -46}}>Chez</div>
      <div style={{...T(178, 900, GOLD), transform: `scale(${0.4 + 0.6 * s})`, opacity: Math.min(1, s * 1.5), letterSpacing: '-0.02em',
        background: `linear-gradient(180deg, #FFE58A 0%, ${GOLD} 50%, #C98A12 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
        filter: 'drop-shadow(0 6px 0 #3a0508) drop-shadow(0 10px 20px rgba(0,0,0,.6))', textShadow: 'none'}}>DEBORAH</div>
      <div style={{display: 'inline-block', marginTop: 6, padding: '6px 54px', borderRadius: 60, background: `linear-gradient(90deg, ${RED}, ${MAROON})`,
        border: `4px solid ${GOLD}`, ...T(58, 800, GOLD), letterSpacing: '0.2em', transform: `scaleX(${s3})`, boxShadow: shadow}}>DOLLARS</div>
    </div>
  );
};

const WhatsApp: React.FC<{at: number; y: number; scale?: number}> = ({at, y, scale = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 11}});
  const pulse = 1 + 0.035 * Math.sin((f - at) / 4.5);
  const ring = ((f - at) % 30) / 30;
  return (
    <div style={{position: 'absolute', top: y, left: 0, width: W, display: 'flex', justifyContent: 'center',
      transform: `scale(${s * pulse * scale})`}}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 26, padding: '22px 52px 22px 26px', borderRadius: 100,
        background: `linear-gradient(180deg, #3BE07A, ${WA} 60%, #128C4A)`, boxShadow: `0 0 0 ${ring * 30}px rgba(37,211,102,${0.45 * (1 - ring)}), ${shadow}`}}>
        <svg width={104} height={104} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={48} fill="#fff" />
          <path d="M50 14 a36 36 0 0 0 -31 54 l-5 18 19 -5 a36 36 0 1 0 17 -67 z" fill={WA} />
          <path d="M38 33 c-3 0 -6 4 -5 9 c2 9 10 18 20 22 c5 2 9 -1 10 -4 l1 -3 -8 -5 -4 4 c-5 -2 -10 -7 -12 -12 l4 -4 -4 -8 z" fill="#fff" />
        </svg>
        <div>
          <div style={T(30, 600, '#EFFFF4', {textShadow: 'none'})}>Commandez sur WhatsApp</div>
          <div style={T(84, 900, '#fff', {letterSpacing: '0.02em'})}>682 59 16 70</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── A · Accroche (0 → 5,5 s) ───────────────────────────
const SceneA: React.FC = () => {
  const f = useCurrentFrame();
  const grow = p(f, 0, 12);
  const fall = interpolate(f, [12, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dropY = 150 + 710 * fall * fall;
  const r = 400 * spring({frame: f - 30, fps: 30, config: {damping: 14}});
  const steam = (i: number) => {
    const t = ((f - 120 + i * 13) % 50) / 50;
    return <div key={i} style={{position: 'absolute', left: 560 + i * 40 + Math.sin(f / 9 + i) * 20, top: 1250 - t * 380, width: 90, height: 160,
      borderRadius: '50%', background: 'rgba(255,255,255,.35)', filter: 'blur(22px)', opacity: Math.sin(t * Math.PI) * 0.8}} />;
  };
  return (
    <AbsoluteFill>
      <Backdrop halo={0.5 + 0.5 * p(f, 30, 50)} />
      {f >= 30 && (
        <AbsoluteFill style={{clipPath: `circle(${r}px at 540px 880px)`}}>
          <Photo n={6} from={30} to={130} z={[1.5, 1.75]} x={[45, 50]} y={[62, 58]} filter="saturate(1.25)" />
        </AbsoluteFill>
      )}
      {f >= 30 && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: glow(OIL)}}>
          <circle cx={540} cy={880} r={r} fill="none" stroke={OIL} strokeWidth={10} /><circle cx={540} cy={880} r={r} fill="none" stroke={OIL_HI} strokeWidth={3} />
        </svg>
      )}
      {f < 31 && <Drop x={540} y={dropY} s={grow * 1.2} stretch={1 + fall * 0.35} />}
      <Splash x={540} y={880} at={30} />
      <Pop at={F(0)} style={{top: 250, ...T(76, 800)}} from="down">Vous la reconnaissez ?</Pop>
      <Pop at={F(1.39)} style={{top: 1300, ...T(56, 600)}} from="up">Cette couleur</Pop>
      <Pop at={F(1.85)} style={{top: 1350, ...T(190, 900), ...oilText}}>ROUGE</Pop>
      {/* l'odeur : l'image de cuisine envahit l'écran */}
      <Show from={F(3.0) - 2} to={F(5.47) + 12}>
        <CircleWipe from={F(3.0) - 2} cx={540} cy={880}>
          <Photo n={3} from={F(3.0)} to={F(5.47) + 12} z={[1.15, 1.4]} x={[60, 64]} y={[66, 72]} />
          <Warm />
          {[0, 1, 2].map(steam)}
          <Shade />
          <Pop at={F(3.0) + 6} style={{top: 240, ...S(92, CREAM)}} from="down">cette odeur…</Pop>
          <Pop at={F(4.0)} style={{top: 1290, ...T(52, 600)}} from="up">qui annonce</Pop>
          <Pop at={F(4.3)} style={{top: 1350, ...T(128, 900, GOLD)}}>UN BON PLAT</Pop>
        </CircleWipe>
      </Show>
    </AbsoluteFill>
  );
};

// ─────────────────────────── B · Problème (5,5 → 10,7 s) ───────────────────────────
const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  const start = F(5.47);
  const crack = p(f, F(9.05), F(9.05) + 8);
  const shake = f > F(9.05) && f < F(9.05) + 16 ? Math.sin(f * 3.1) * 12 * (1 - (f - F(9.05)) / 16) : 0;
  const wob = Math.sin(f / 8) * 3;
  return (
    <Whip from={start}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #4a4540 0%, #1f1c1a 75%)', transform: `translateX(${shake}px)`}}>
        {/* bouteille sans marque, huile trouble */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="murk"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves={3} seed={Math.floor(f / 3)} />
              <feColorMatrix values="0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .24  0 0 0 .9 0" /></filter>
            <clipPath id="bottle"><path d="M480 330 h120 v90 c0 40 110 70 110 170 v560 c0 50 -30 80 -80 80 h-180 c-50 0 -80 -30 -80 -80 v-560 c0 -100 110 -130 110 -170 z" /></clipPath>
          </defs>
          <g transform={`rotate(${wob} 540 900)`}>
            <g clipPath="url(#bottle)">
              <rect x={300} y={300} width={480} height={1000} fill="#6b5a3a" />
              <rect x={300} y={300} width={480} height={1000} filter="url(#murk)" opacity={0.9} />
              <rect x={300} y={300} width={480} height={260} fill="#2a2520" opacity={0.9} />
            </g>
            <path d="M480 330 h120 v90 c0 40 110 70 110 170 v560 c0 50 -30 80 -80 80 h-180 c-50 0 -80 -30 -80 -80 v-560 c0 -100 110 -130 110 -170 z"
              fill="none" stroke="#bdb6aa" strokeWidth={6} opacity={0.6} />
            <rect x={470} y={280} width={140} height={60} rx={10} fill="#3c3936" />
          </g>
          {crack > 0 && (
            <g stroke="#fff" strokeWidth={4} fill="none" opacity={0.85} pathLength={1}>
              {['M540 900 L470 760 L500 640 L420 520', 'M540 900 L650 820 L700 700 L820 640', 'M540 900 L600 1040 L560 1160 L640 1290', 'M540 900 L420 980 L360 1120'].map((d, i) => (
                <path key={i} d={d} pathLength={1} strokeDasharray={`${crack} 2`} />
              ))}
            </g>
          )}
        </svg>
        <Pop at={start + 4} style={{top: 170, ...T(58, 600, '#E8E2D8')}} from="down">Combien de fois avez-vous acheté…</Pop>
        <Stamp at={F(7.35)} style={{top: 560, ...T(120, 900, '#fff', {WebkitTextStroke: '3px #111'})}} rot={-6}>COUPÉE ?</Stamp>
        <Stamp at={F(8.15)} style={{top: 760, ...T(120, 900, '#fff', {WebkitTextStroke: '3px #111'})}} rot={5}>TROUBLE ?</Stamp>
        <Pop at={F(9.05)} style={{top: 1300, ...T(64, 800, '#fff')}} from="up">qui gâche</Pop>
        <Pop at={F(9.45)} style={{top: 1380, ...T(104, 900, '#FF3B3B')}}>TOUT LE REPAS</Pop>
        <AbsoluteFill style={{background: `rgba(255,0,0,${0.25 * interpolate(f, [F(9.05), F(9.05) + 3, F(9.05) + 12], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}} />
      </AbsoluteFill>
    </Whip>
  );
};

// ─────────────────────────── C · Origine (10,7 → 18,6 s) ───────────────────────────
const SceneC: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(10.67);
  const nuts = F(13.81);
  const sun = p(f, F(16.08), F(16.08) + 20);
  const flagW = p(f, F(12.7), F(12.7) + 14);
  const textOut = F(13.6);
  const circleIn = p(f, nuts + 18, nuts + 34);
  return (
    <CircleWipe from={a - 14} cx={0} cy={1920} dur={20}>
      <Photo n={2} from={a} to={F(17.3)} z={[1.35, 1.5]} x={[50, 50]} y={[0, 5]} filter="blur(5px) brightness(.5) saturate(1.2)" />
      <Backdrop halo={0.6} tint="#4a0a0d" />
      <AbsoluteFill style={{opacity: 0.55}}><Photo n={2} from={a} to={F(17.3)} z={[1.35, 1.5]} y={[0, 5]} filter="blur(6px) brightness(.55)" /></AbsoluteFill>
      <Pop at={a + 2} out={textOut} style={{top: 470, ...S(84)}} from="down">Chez Deborah Dollars,</Pop>
      <Pop at={F(11.6)} out={textOut} style={{top: 610, ...T(54, 600)}} from="up">tout commence au cœur du</Pop>
      <Pop at={F(12.7)} out={textOut} style={{top: 700, ...T(158, 900)}}>CAMEROUN</Pop>
      {f < textOut + 8 && flagW > 0.01 && (
        <div style={{position: 'absolute', top: 880, left: 540 - 380 * flagW, width: 760 * flagW, height: 26, display: 'flex',
          opacity: 1 - p(f, textOut, textOut + 8), boxShadow: shadow}}>
          <div style={{flex: 1, background: GREEN}} /><div style={{flex: 1, background: RED, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <span style={{color: GOLD, fontSize: 30, lineHeight: 1}}>★</span></div><div style={{flex: 1, background: GOLD}} />
        </div>
      )}
      {/* le filet d'huile dessine le médaillon des noix de palme */}
      <OilTrail d="M 540 640 A 340 340 0 1 1 539.9 640" from={nuts} dur={22} keep width={10} fadeOut={[F(17.3) - 4, F(17.3) + 4]} />
      {f >= nuts + 18 && (
        <div style={{position: 'absolute', left: 540 - 330, top: 980 - 330, width: 660, height: 660, borderRadius: '50%', overflow: 'hidden',
          clipPath: `circle(${50 * circleIn}% at 50% 50%)`, boxShadow: `0 0 60px ${OIL}88`}}>
          <Img src={staticFile('img/1.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 58%',
            transform: `scale(${1.5 - 0.15 * circleIn + 0.08 * sun})`, filter: `saturate(${1.1 + 0.3 * sun}) brightness(${1 + 0.1 * sun})`}} />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 15%, rgba(255,200,80,${0.55 * sun}), transparent 60%)`, mixBlendMode: 'screen'}} />
        </div>
      )}
      {/* soleil */}
      {sun > 0 && (
        <div style={{position: 'absolute', left: 860 - 160, top: 420 - 160, width: 320, height: 320, borderRadius: '50%', opacity: sun,
          background: 'radial-gradient(circle, #fff 0%, #FFE08A 18%, rgba(255,170,40,.55) 40%, transparent 70%)', transform: `scale(${0.6 + 0.4 * sun}) rotate(${f}deg)`}} />
      )}
      <Pop at={nuts + 8} out={F(16.08) - 2} style={{top: 1380, ...S(84, CREAM)}} from="up">Choisies une à une…</Pop>
      <Pop at={F(16.08)} out={F(17.3) - 2} style={{top: 1380, ...S(84, GOLD)}} from="up">mûries au soleil…</Pop>
      {/* zoom vers la presse */}
      <Show from={F(17.3) - 4} to={F(18.62) + 10}>
        <CircleWipe from={F(17.3) - 4} cx={540} cy={980} dur={14}>
          <Photo n={2} from={F(17.3) - 4} to={F(18.62) + 10} z={[1.1, 1.55]} x={[48, 47]} y={[60, 66]} />
          <Warm />
          <Shade top={0.3} />
          <Pop at={F(17.3) + 4} style={{top: 1340, ...T(96, 900)}} from="up">PRESSÉES</Pop>
          <Pop at={F(17.3) + 12} style={{top: 1450, ...S(70, GOLD)}} from="up">avec soin</Pop>
        </CircleWipe>
      </Show>
    </CircleWipe>
  );
};

// ─────────────────────────── D · Révélation (18,6 → 22 s) ───────────────────────────
const ProductCard: React.FC<{n: number; from: number; to: number; top: number; height: number; z?: [number, number]}> = ({n, from, to, top, height, z = [1.12, 1]}) => {
  const f = useCurrentFrame();
  const sweep = interpolate(f, [from + 6, from + 40], [-0.4, 1.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height,
      maskImage: 'linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)'}}>
      <Photo n={n} from={from} to={to} z={z} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${sweep * 100 - 12}%, rgba(255,240,200,.45) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`, mixBlendMode: 'screen'}} />
    </div>
  );
};

const SceneD: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(18.62);
  const logo = F(20.57);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Rays opacity={0.12} />
      <ProductCard n={5} from={a} to={F(21.98)} top={640} height={1012} />
      <Pop at={a + 2} out={logo - 6} style={{top: 210, ...T(68, 800)}} from="down">Voici l'Huile de</Pop>
      <Pop at={a + 10} out={logo - 6} style={{top: 290, ...S(150, GOLD), filter: glow(OIL, 0.5)}}>Palme Rouge</Pop>
      <Logo at={logo} y={130} scale={0.9} />
      <Dust n={30} />
      <Flash at={a} />
      <Flash at={logo} color="#FFD27A" />
    </AbsoluteFill>
  );
};

// ─────────────────────────── E · Bénéfices (22 → 30,3 s) ───────────────────────────
const Badge: React.FC<{at: number; y: number; bg: string; color: string; icon: string; children: React.ReactNode; dir: 1 | -1}> =
({at, y, bg, color, icon, children, dir}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top: y, left: 0, width: W, display: 'flex', justifyContent: 'center',
      transform: `translateX(${(1 - s) * 900 * dir}px)`, opacity: Math.min(1, s * 2)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 44px 14px 16px', borderRadius: 70, background: bg,
        border: `4px solid ${GOLD}`, boxShadow: shadow}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, transform: `scale(${spring({frame: f - at - 6, fps, config: {damping: 8}})})`}}>{icon}</div>
        <div style={T(54, 900, color, {textShadow: 'none'})}>{children}</div>
      </div>
    </div>
  );
};

const SceneE: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(21.98);
  const b = F(26.44);
  const c = F(29.16);
  const dim = p(f, c, c + 10);
  return (
    <AbsoluteFill>
      <Backdrop />
      <ProductCard n={4} from={a} to={b} top={60} height={1180} z={[1.05, 1.15]} />
      <Badge at={a} y={1150} bg={GREEN} color="#fff" icon="🌿" dir={-1}>100% NATURELLE</Badge>
      <Badge at={F(23.42)} y={1270} bg={RED} color={CREAM} icon="💧" dir={1}>VITAMINES A &amp; E</Badge>
      <Badge at={F(25.21)} y={1390} bg={GOLD} color={MAROON} icon="★" dir={-1}>QUALITÉ EXTRA</Badge>
      <Show from={b - 2} to={F(30.3) + 12}>
        <Whip from={b - 2}>
          <Photo n={6} from={b} to={F(30.3) + 12} z={[1.05, 1.22]} x={[50, 55]} y={[45, 40]} filter={`blur(${dim * 10}px) brightness(${1 - dim * 0.6})`} />
          <ProductShine from={b + 4} />
          <Shade top={0.75} bottom={0.75} />
          <Pop at={b + 2} out={c - 4} style={{top: 180, ...T(64, 700)}} from="down">une couleur</Pop>
          <Pop at={b + 8} out={c - 4} style={{top: 250, ...T(130, 900), ...oilText}}>ÉCLATANTE</Pop>
          <Pop at={F(27.75)} out={c - 4} style={{top: 1300, ...T(64, 700)}} from="up">un goût</Pop>
          <Pop at={F(27.95)} out={c - 4} style={{top: 1370, ...T(120, 900, GOLD)}}>AUTHENTIQUE</Pop>
          <Pop at={c + 2} style={{top: 760, ...T(118, 900)}}>ET RIEN</Pop>
          <Pop at={c + 8} style={{top: 890, ...T(118, 900, GOLD)}}>D'AUTRE.</Pop>
          <Pop at={c + 14} style={{top: 1040, ...T(44, 700, '#8CF0A8')}} from="up">100% naturelle · sans mélange</Pop>
        </Whip>
      </Show>
    </AbsoluteFill>
  );
};

const ProductShine: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, from + 30], [-0.3, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: `linear-gradient(115deg, transparent ${k * 100 - 10}%, rgba(255,235,200,.5) ${k * 100}%, transparent ${k * 100 + 10}%)`, mixBlendMode: 'screen'}} />;
};

// ─────────────────────────── F · Émotion (30,3 → 37,2 s) ───────────────────────────
const Dish: React.FC<{at: number; out: number; x: number; y: number; name: string}> = ({at, out, x, y, name}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 9, mass: 0.6}});
  const o = p(f, out, out + 10);
  const bob = Math.sin((f - at) / 10) * 8;
  return (
    <div style={{position: 'absolute', left: x - 140, top: y - 140 + bob - o * 200, width: 280, height: 280, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${RED}, ${MAROON})`, border: `6px solid ${GOLD}`, boxShadow: `0 0 40px ${OIL}aa, ${shadow}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s * (1 - o)})`, opacity: 1 - o}}>
      <span style={S(84, CREAM)}>{name}</span>
    </div>
  );
};

const HEART = 'M 540 900 C 540 900, 300 760, 300 610 C 300 500, 400 450, 470 470 C 510 482, 535 515, 540 540 C 545 515, 570 482, 610 470 C 680 450, 780 500, 780 610 C 780 760, 540 900, 540 900';

const SceneF: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(30.3);
  const b = F(33.22);
  const c = F(35.54);
  return (
    <CircleWipe from={a - 8} cx={540} cy={960}>
      <Photo n={3} from={a - 8} to={F(37.24) + 10} z={[1.08, 1.25]} x={[48, 45]} y={[42, 38]} />
      <Warm />
      <Shade top={0.55} bottom={0.75} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, rgba(255,160,60,${0.35 * p(f, c, c + 20)}), transparent 60%)`, mixBlendMode: 'screen'}} />
      <Pop at={a + 2} out={b - 6} style={{top: 140, ...T(58, 700)}} from="down">Pour votre…</Pop>
      <Dish at={F(30.9)} out={b} x={240} y={430} name="Eru" />
      <Dish at={F(31.7)} out={b + 3} x={540} y={600} name="Koki" />
      <Dish at={F(32.5)} out={b + 6} x={840} y={430} name="Okok" />
      <Pop at={b + 2} out={c - 4} style={{top: 1220, ...T(60, 700)}} from="up">chaque plat retrouve</Pop>
      <Pop at={b + 10} out={c - 4} style={{top: 1300, ...T(96, 900, GOLD)}}>LE VRAI GOÛT</Pop>
      <Pop at={F(34.5)} out={c - 4} style={{top: 1410, ...S(84, CREAM)}} from="up">de chez nous</Pop>
      <OilTrail d={HEART} from={c} dur={26} keep width={12} />
      <Pop at={c + 6} style={{top: 1250, ...T(58, 700)}} from="up">le goût de</Pop>
      <Pop at={c + 12} style={{top: 1320, ...S(118, GOLD)}}>la cuisine de maman</Pop>
    </CircleWipe>
  );
};

// ─────────────────────────── G · Formats (37,2 → 41,7 s) ───────────────────────────
const Tag: React.FC<{at: number; x: number; y: number; big: string; small: string; arrow: string}> = ({at, x, y, big, small, arrow}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 9}});
  const draw = p(f, at + 6, at + 20);
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={arrow} pathLength={1} fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${draw} 2`} style={{filter: glow(OIL, 0.4)}} />
      </svg>
      <div style={{position: 'absolute', left: x - 110, top: y - 110, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFE58A, ${GOLD} 55%, #C98A12)`,
        border: `6px solid ${MAROON}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s}) rotate(${(1 - s) * -40}deg)`, boxShadow: shadow}}>
        <span style={T(100, 900, MAROON, {textShadow: 'none'})}>{big}</span>
      </div>
      <div style={{position: 'absolute', left: x - 240, top: y + 120, width: 480, textAlign: 'center', opacity: Math.min(1, s), ...S(60, CREAM)}}>{small}</div>
    </>
  );
};

const SceneG: React.FC = () => {
  const a = F(37.24);
  return (
    <Whip from={a - 2} dir={-1}>
      <Backdrop />
      <Rays opacity={0.14} />
      <ProductCard n={5} from={a} to={F(41.73)} top={600} height={1012} z={[1.1, 1]} />
      <Pop at={a + 2} style={{top: 150, ...T(72, 900)}} from="down">DISPONIBLE EN</Pop>
      <Tag at={a + 4} x={250} y={420} big="1L" small="pour tous les jours" arrow="M 300 560 C 330 640, 300 700, 280 760" />
      <Tag at={F(39.3)} x={800} y={420} big="5L" small="pour toute la famille" arrow="M 760 560 C 730 640, 760 700, 780 760" />
    </Whip>
  );
};

// ─────────────────────────── H · Appel à l'action (41,7 → 46,7 s) ───────────────────────────
const Truck: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = p(f, at, at + 18);
  const bump = Math.abs(Math.sin(f / 2.5)) * 4;
  return (
    <svg width={300} height={170} viewBox="0 0 300 170" style={{position: 'absolute', left: -320 + k * 420, top: 1300 - bump}}>
      <rect x={10} y={20} width={170} height={100} rx={12} fill={GOLD} />
      <text x={95} y={82} textAnchor="middle" fill={MAROON} style={{fontFamily: BOLD, fontWeight: 900, fontSize: 34}}>DD</text>
      <path d="M180 50 h60 l40 40 v30 h-100 z" fill={CREAM} /><rect x={195} y={60} width={45} height={30} rx={4} fill="#6fb7d8" />
      <circle cx={60} cy={130} r={24} fill="#222" /><circle cx={60} cy={130} r={10} fill="#999" />
      <circle cx={230} cy={130} r={24} fill="#222" /><circle cx={230} cy={130} r={10} fill="#999" />
      {[0, 1, 2].map((i) => <line key={i} x1={-20 - i * 10} y1={40 + i * 25} x2={-70 - i * 20} y2={40 + i * 25} stroke={CREAM} strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
    </svg>
  );
};

const SceneH: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(41.73);
  const b = F(43.04);
  const stock = interpolate(f, [a + 6, a + 36], [1, 0.14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: expo});
  const up = p(f, b - 4, b + 8);
  const blink = f > a + 36 && Math.floor(f / 6) % 2 === 0;
  return (
    <Whip from={a - 2}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${RED} 0%, #6d070c 70%, #2a0204 100%)`}} />
      <Rays opacity={0.2} />
      <Dust n={40} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-up * 120}px) scale(${1 - up * 0.25})`, transformOrigin: '50% 0%', opacity: 1 - up * 0.15}}>
        <Stamp at={a} style={{top: 170, ...T(118, 900)}} rot={-3}>LES STOCKS</Stamp>
        <Stamp at={a + 6} style={{top: 300, ...T(118, 900, GOLD)}} rot={2}>PARTENT VITE !</Stamp>
        <div style={{position: 'absolute', left: 140, top: 480, width: 800, opacity: p(f, a + 4, a + 10)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', ...T(36, 800)}}><span>STOCK</span><span style={{color: blink ? '#fff' : GOLD}}>{Math.round(stock * 100)}%</span></div>
          <div style={{marginTop: 10, height: 40, borderRadius: 20, background: 'rgba(0,0,0,.45)', border: `3px solid ${GOLD}`, overflow: 'hidden'}}>
            <div style={{width: `${stock * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${OIL})`}} />
          </div>
        </div>
      </div>
      <Stamp at={b} style={{top: 680, ...T(150, 900, GOLD)}} rot={-2}>COMMANDEZ</Stamp>
      <Pop at={F(44.37)} style={{top: 850, ...T(78, 900)}}>DÈS MAINTENANT</Pop>
      <WhatsApp at={b + 8} y={1000} />
      <Truck at={F(45.33)} />
      <Pop at={F(45.33) + 6} style={{top: 1330, left: 170, ...T(72, 900)}} from="up">ON VOUS LIVRE !</Pop>
    </Whip>
  );
};

// ─────────────────────────── I · Signature (46,7 → fin) ───────────────────────────
const SceneI: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = F(46.74);
  const fall = interpolate(f, [a, a + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hit = a + 14;
  const ph = spring({frame: f - hit - 16, fps, config: {damping: 13}});
  return (
    <CircleWipe from={a - 8} cx={540} cy={960} dur={16}>
      <Photo n={6} from={a} to={a + 220} z={[1.3, 1.4]} filter="blur(14px) brightness(.35) saturate(1.3)" />
      <Backdrop halo={0.8} tint="#4a0a0d" />
      <AbsoluteFill style={{opacity: 0.5}}><Photo n={6} from={a} to={a + 220} z={[1.3, 1.4]} filter="blur(14px) brightness(.4)" /></AbsoluteFill>
      <Rays opacity={0.1} />
      {f < hit + 1 && <Drop x={540} y={-80 + 520 * fall * fall} s={1.1} stretch={1 + fall * 0.3} />}
      <Splash x={540} y={440} at={hit} />
      <Logo at={hit} y={180} scale={0.95} />
      <Pop at={F(47.6)} style={{top: 660, ...S(78, CREAM)}} from="up">la richesse naturelle</Pop>
      <Pop at={F(48.1)} style={{top: 750, ...S(78, GOLD)}} from="up">du Cameroun</Pop>
      {f >= hit + 16 && (
        <div style={{position: 'absolute', left: 540 - 190, top: 870, width: 380, height: 380, borderRadius: '50%', overflow: 'hidden',
          border: `8px solid ${GOLD}`, boxShadow: `0 0 50px ${OIL}aa`, transform: `scale(${ph})`}}>
          <Img src={staticFile('img/7.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '22% 40%', transform: 'scale(1.6)', transformOrigin: '25% 45%'}} />
        </div>
      )}
      <WhatsApp at={hit + 26} y={1270} scale={0.92} />
      <Pop at={hit + 36} style={{top: 1455, ...S(56, GOLD)}} from="up">La qualité au naturel !</Pop>
      <Flash at={hit} color="#FFD27A" />
    </CircleWipe>
  );
};

export const Deborah: React.FC = () => {
  const f = useCurrentFrame();
  const cam = 1 + 0.01 * Math.sin(f / 60);
  return (
    <AbsoluteFill style={{background: '#1a0305', overflow: 'hidden', transform: `scale(${cam})`}}>
      <Show from={0} to={F(5.47) + 12}><SceneA /></Show>
      <Show from={F(5.47)} to={F(10.67) + 8}><SceneB /></Show>
      <Show from={F(10.67) - 14} to={F(18.62) + 6}><SceneC /></Show>
      <Show from={F(18.62)} to={F(21.98) + 2}><SceneD /></Show>
      <Show from={F(21.98)} to={F(30.3) + 12}><SceneE /></Show>
      <Show from={F(30.3) - 8} to={F(37.24) + 10}><SceneF /></Show>
      <Show from={F(37.24) - 2} to={F(41.73) + 10}><SceneG /></Show>
      <Show from={F(41.73) - 2} to={F(46.74) + 12}><SceneH /></Show>
      <Show from={F(46.74) - 8} to={99999}><SceneI /></Show>
      {/* le filet d'huile traverse l'écran à chaque grande transition */}
      <OilTrail d="M -80 1900 C 300 1500, 700 900, 1180 200" from={F(10.67) - 16} dur={20} len={0.5} width={22} />
      <OilTrail d="M 1180 1500 C 800 1300, 400 700, -100 500" from={F(37.24) - 6} dur={16} len={0.5} width={18} />
      <OilTrail d="M -80 300 C 300 600, 800 500, 1180 900" from={F(41.73) - 6} dur={14} len={0.5} width={18} />
      <Flash at={F(21.98)} />
    </AbsoluteFill>
  );
};

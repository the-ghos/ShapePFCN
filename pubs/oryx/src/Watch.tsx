import React from 'react';
import {GOLD, IVORY, SERIF, SANS} from './lib';

// Montre vectorielle, coordonnées centrées sur (0,0), boîtier de rayon 300.
export const R = 300;

const Hand: React.FC<{angle: number; len: number; w: number; tail?: number}> = ({angle, len, w, tail = 30}) => (
  <g transform={`rotate(${angle})`}>
    <path d={`M 0 ${tail} L ${-w} 0 L 0 ${-len} L ${w} 0 Z`} fill="url(#handG)" stroke="#5c4426" strokeWidth={1} />
    <path d={`M 0 ${tail} L 0 ${-len}`} stroke="#fff6e0" strokeWidth={1.2} opacity={0.7} />
  </g>
);

export const WatchDefs: React.FC = () => (
  <defs>
    <linearGradient id="caseG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6e2b0" /><stop offset=".25" stopColor="#b8904f" />
      <stop offset=".5" stopColor="#f3d79c" /><stop offset=".72" stopColor="#6e5129" /><stop offset="1" stopColor="#d9b675" />
    </linearGradient>
    <linearGradient id="bezelG" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4a3519" /><stop offset=".5" stopColor="#e9cb8c" /><stop offset="1" stopColor="#3d2b14" />
    </linearGradient>
    <radialGradient id="dialG" cx=".45" cy=".4" r=".7">
      <stop offset="0" stopColor="#1f2a33" /><stop offset=".6" stopColor="#0c1117" /><stop offset="1" stopColor="#030507" />
    </radialGradient>
    <linearGradient id="handG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8a6a3a" /><stop offset=".5" stopColor="#fff0c8" /><stop offset="1" stopColor="#b08a4e" />
    </linearGradient>
    <linearGradient id="strapG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#1a100b" /><stop offset=".2" stopColor="#3a2416" /><stop offset=".5" stopColor="#4a2f1c" />
      <stop offset=".8" stopColor="#3a2416" /><stop offset="1" stopColor="#1a100b" />
    </linearGradient>
    <linearGradient id="strapFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".22" stopColor="#fff" stopOpacity="1" />
      <stop offset=".78" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <mask id="strapMask"><rect x={-200} y={-1050} width={400} height={2100} fill="url(#strapFade)" /></mask>
    <linearGradient id="sheenG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".55" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <clipPath id="caseClip"><circle r={R} /></clipPath>
  </defs>
);

export const WatchBody: React.FC<{hour: number; minute: number; second: number; sheen?: number; edge?: number}> =
({hour, minute, second, sheen = -2, edge = 0}) => (
  <g>
    {/* bracelet cuir */}
    <g mask="url(#strapMask)">
      <rect x={-150} y={-1050} width={300} height={2100} rx={30} fill="url(#strapG)" />
      <line x1={-128} y1={-1050} x2={-128} y2={1050} stroke={GOLD} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="10 9" />
      <line x1={128} y1={-1050} x2={128} y2={1050} stroke={GOLD} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="10 9" />
    </g>
    {/* cornes */}
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
      <path key={i} d={`M ${sx * 130} ${sy * 220} L ${sx * 160} ${sy * 330} L ${sx * 120} ${sy * 335} L ${sx * 95} ${sy * 240} Z`} fill="url(#caseG)" />
    ))}
    {/* épaisseur (fausse 3D) */}
    <circle cx={edge} cy={10} r={R} fill="#3a2a14" />
    {/* couronne */}
    <g transform={`translate(${R - 4 + Math.max(0, edge) * 0.3},0)`}>
      <rect x={0} y={-30} width={42} height={60} rx={8} fill="url(#caseG)" />
      {[-22, -11, 0, 11, 22].map((y) => <line key={y} x1={6} y1={y} x2={38} y2={y} stroke="#5c4426" strokeWidth={2} />)}
    </g>
    <circle r={R} fill="url(#caseG)" />
    <circle r={276} fill="url(#bezelG)" />
    <circle r={262} fill="url(#dialG)" />
    {/* guillochage soleillé */}
    {new Array(90).fill(0).map((_, i) => (
      <line key={i} x1={0} y1={-60} x2={0} y2={-258} transform={`rotate(${i * 4})`} stroke="#9fb4c4" strokeOpacity={0.05} strokeWidth={2} />
    ))}
    {/* minuterie */}
    {new Array(60).fill(0).map((_, i) => i % 5 ? (
      <line key={i} x1={0} y1={-246} x2={0} y2={-256} transform={`rotate(${i * 6})`} stroke={IVORY} strokeOpacity={0.5} strokeWidth={1.5} />
    ) : null)}
    {/* index */}
    {new Array(12).fill(0).map((_, i) => (
      <g key={i} transform={`rotate(${i * 30})`}>
        {i === 0 ? (
          <><rect x={-12} y={-238} width={8} height={48} rx={2} fill="url(#handG)" /><rect x={4} y={-238} width={8} height={48} rx={2} fill="url(#handG)" /></>
        ) : <rect x={-5} y={-238} width={10} height={40} rx={2} fill="url(#handG)" />}
      </g>
    ))}
    <text y={-120} textAnchor="middle" fill={GOLD} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 40, letterSpacing: 12}}>ORYX</text>
    <text y={-92} textAnchor="middle" fill={IVORY} opacity={0.55} style={{fontFamily: SANS, fontWeight: 300, fontSize: 11, letterSpacing: 5}}>GENÈVE</text>
    <text y={130} textAnchor="middle" fill={IVORY} opacity={0.6} style={{fontFamily: SANS, fontWeight: 300, fontSize: 12, letterSpacing: 6}}>AUTOMATIQUE</text>
    <Hand angle={hour} len={140} w={13} />
    <Hand angle={minute} len={215} w={10} />
    <g transform={`rotate(${second})`}>
      <line x1={0} y1={55} x2={0} y2={-240} stroke={IVORY} strokeWidth={2.5} />
      <circle cy={42} r={8} fill={IVORY} />
    </g>
    <circle r={12} fill="url(#caseG)" /><circle r={4} fill="#3d2b14" />
    {/* verre : reflet qui balaie */}
    <g clipPath="url(#caseClip)" style={{mixBlendMode: 'screen'}}>
      <rect x={sheen * R - 90} y={-R * 1.5} width={180} height={R * 3} fill="url(#sheenG)" transform="rotate(28)" />
      <ellipse cx={-90} cy={-150} rx={170} ry={70} fill="#fff" opacity={0.05} transform="rotate(-30)" />
    </g>
  </g>
);

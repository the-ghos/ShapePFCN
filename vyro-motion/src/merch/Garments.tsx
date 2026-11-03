import React from "react";
import { LEFT_ARM, RIGHT_ARM, SPEED_LINES } from "../logo/VMark";
import { C, displayFont, labelFont } from "../theme";

export type GarmentKind = "tee" | "cap" | "hoodie" | "pants";

/** Logo drawn as a <g>, centered on (0,0), `w` wide. */
export const PrintMark: React.FC<{ w: number; id: string; lines?: boolean }> = ({ w, id, lines = true }) => {
  const s = w / 450;
  return (
    <g transform={`scale(${s}) translate(-525 -430)`}>
      <defs>
        <linearGradient id={`${id}-l`} x1="358" y1="255" x2="530" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.orangeLight} />
          <stop offset="0.5" stopColor={C.orange} />
          <stop offset="1" stopColor={C.red} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="738" y1="255" x2="545" y2="590" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="0.55" stopColor={C.violet} />
          <stop offset="1" stopColor={C.violetDeep} />
        </linearGradient>
      </defs>
      {lines
        ? SPEED_LINES.map((l, i) => (
            <line key={i} x1={l.x1} x2={l.x2} y1={l.y} y2={l.y} stroke={l.color} strokeWidth={18} strokeLinecap="round" />
          ))
        : null}
      <path d={LEFT_ARM} fill={`url(#${id}-l)`} />
      <path d={RIGHT_ARM} fill={`url(#${id}-r)`} opacity={0.88} />
    </g>
  );
};

export const PrintWord: React.FC<{ size: number; color: string; motion?: boolean }> = ({ size, color, motion = true }) => (
  <g>
    <text x={0} y={0} textAnchor="middle" fontFamily={displayFont} fontSize={size} fill={color} transform="scale(1.15 1)">
      VYRO
    </text>
    {motion ? (
      <text x={0} y={size * 0.62} textAnchor="middle" fontFamily={labelFont} fontWeight={600} fontSize={size * 0.32} letterSpacing={size * 0.16} fill={C.motion}>
        MOTION
      </text>
    ) : null}
  </g>
);

const SHAPES: Record<GarmentKind, string> = {
  tee: "M405 120 L255 168 L118 330 L228 405 L300 352 L304 880 Q500 900 696 880 L700 352 L772 405 L882 330 L745 168 L595 120 Q500 205 405 120 Z",
  hoodie:
    "M395 165 L262 205 Q205 230 185 320 L118 760 L222 790 L300 430 L298 870 Q500 895 702 870 L700 430 L778 790 L882 760 L815 320 Q795 230 738 205 L605 165 Q500 230 395 165 Z",
  cap: "M232 600 C215 330 380 235 500 235 C620 235 785 330 768 600 C670 648 330 648 232 600 Z",
  pants: "M318 140 L682 140 L712 860 L712 905 L540 905 L536 860 L506 405 Q500 392 494 405 L464 860 L460 905 L288 905 L288 860 Z",
};

/** Fabric texture + soft folds + print, using an SVG displacement so the print follows the cloth. */
export const Garment: React.FC<{
  kind: GarmentKind;
  color: string;
  shade?: string;
  print: React.ReactNode;
  id: string;
  sheen?: number;
}> = ({ kind, color, shade = "#000", print, id, sheen = 0.5 }) => {
  const shape = SHAPES[kind];
  return (
    <svg viewBox="0 0 1000 1000" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor={shade} stopOpacity="0.55" />
          <stop offset="0.3" stopColor={shade} stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff" stopOpacity={0.07 * sheen} />
          <stop offset="1" stopColor={shade} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-vshade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.1 * sheen} />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor={shade} stopOpacity="0.35" />
        </linearGradient>
        <filter id={`${id}-tex`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id={`${id}-warp`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="2" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={shape} />
          {kind === "cap" ? <path d="M186 596 C330 656 670 656 814 596 C858 640 800 724 500 736 C200 724 142 640 186 596 Z" /> : null}
        </clipPath>
      </defs>

      {/* drop shadow */}
      <ellipse cx={500} cy={kind === "cap" ? 770 : 935} rx={kind === "cap" ? 300 : 330} ry={34} fill="#000" opacity={0.55} filter={`url(#${id}-shadow)`} />

      {kind === "hoodie" ? (
        // hood behind the neck
        <>
          <path d="M330 205 Q318 40 500 30 Q682 40 670 205 Q600 160 500 160 Q400 160 330 205 Z" fill={color} />
          <path d="M330 205 Q318 40 500 30 Q682 40 670 205 Q600 160 500 160 Q400 160 330 205 Z" fill={shade} opacity={0.18} />
          <path d="M372 182 Q380 80 500 72 Q620 80 628 182 Q560 150 500 150 Q440 150 372 182 Z" fill={shade} opacity={0.35} />
        </>
      ) : null}

      <g clipPath={`url(#${id}-clip)`}>
        <rect width={1000} height={1000} fill={color} />
        {kind === "cap" ? (
          <>
            {/* panel seams + brim */}
            <path d="M500 240 C470 330 455 470 455 600" stroke={shade} strokeOpacity={0.35} strokeWidth={4} fill="none" />
            <path d="M500 240 C540 330 560 470 560 600" stroke={shade} strokeOpacity={0.2} strokeWidth={3} fill="none" />
            <path d="M500 240 C380 300 300 420 270 600" stroke={shade} strokeOpacity={0.3} strokeWidth={4} fill="none" />
            <path d="M500 240 C620 300 700 420 730 600" stroke={shade} strokeOpacity={0.3} strokeWidth={4} fill="none" />
            <path d="M186 596 C330 656 670 656 814 596 C858 640 800 724 500 736 C200 724 142 640 186 596 Z" fill={color} />
            <path d="M186 596 C330 656 670 656 814 596 C858 640 800 724 500 736 C200 724 142 640 186 596 Z" fill={shade} opacity={0.22} />
            <path d="M210 622 C340 680 660 680 790 622" stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="7 7" fill="none" />
            <path d="M200 652 C300 712 700 712 800 652" stroke="#fff" strokeOpacity={0.2} strokeWidth={2} strokeDasharray="7 7" fill="none" />
            <path d="M150 640 C200 712 330 734 500 738 C670 734 800 712 850 640" stroke={C.orange} strokeWidth={8} fill="none" opacity={0.85} />
            <path d="M190 598 C330 658 670 658 810 598" stroke={shade} strokeOpacity={0.55} strokeWidth={10} fill="none" />
            <circle cx={330} cy={420} r={8} fill={shade} opacity={0.4} />
            <circle cx={670} cy={420} r={8} fill={shade} opacity={0.4} />
          </>
        ) : null}

        {/* folds */}
        <g filter={`url(#${id}-soft)`} opacity={0.9}>
          {kind === "tee" ? (
            <>
              <path d="M330 520 Q420 600 400 860" stroke={shade} strokeOpacity={0.35} strokeWidth={26} fill="none" />
              <path d="M670 470 Q600 640 640 860" stroke={shade} strokeOpacity={0.3} strokeWidth={22} fill="none" />
              <path d="M520 600 Q560 720 540 870" stroke="#fff" strokeOpacity={0.06 * sheen} strokeWidth={30} fill="none" />
              <path d="M180 300 Q240 330 260 380" stroke={shade} strokeOpacity={0.4} strokeWidth={20} fill="none" />
              <path d="M820 300 Q760 330 740 380" stroke={shade} strokeOpacity={0.4} strokeWidth={20} fill="none" />
            </>
          ) : null}
          {kind === "hoodie" ? (
            <>
              <path d="M200 420 Q230 560 190 720" stroke={shade} strokeOpacity={0.4} strokeWidth={24} fill="none" />
              <path d="M800 420 Q770 560 810 720" stroke={shade} strokeOpacity={0.4} strokeWidth={24} fill="none" />
              <path d="M340 470 Q380 560 360 640" stroke={shade} strokeOpacity={0.25} strokeWidth={22} fill="none" />
              <path d="M660 470 Q620 560 640 640" stroke={shade} strokeOpacity={0.25} strokeWidth={22} fill="none" />
            </>
          ) : null}
          {kind === "pants" ? (
            <>
              <path d="M360 260 Q400 520 380 860" stroke={shade} strokeOpacity={0.35} strokeWidth={24} fill="none" />
              <path d="M640 260 Q600 520 620 860" stroke={shade} strokeOpacity={0.35} strokeWidth={24} fill="none" />
              <path d="M300 760 Q380 790 460 760" stroke={shade} strokeOpacity={0.4} strokeWidth={14} fill="none" />
              <path d="M300 700 Q380 730 460 700" stroke={shade} strokeOpacity={0.3} strokeWidth={12} fill="none" />
              <path d="M540 760 Q620 790 700 760" stroke={shade} strokeOpacity={0.4} strokeWidth={14} fill="none" />
              <path d="M540 700 Q620 730 700 700" stroke={shade} strokeOpacity={0.3} strokeWidth={12} fill="none" />
            </>
          ) : null}
          {kind === "cap" ? <ellipse cx={420} cy={360} rx={150} ry={70} fill="#fff" opacity={0.12 * sheen} /> : null}
        </g>

        {/* print, warped by the cloth */}
        <g filter={`url(#${id}-warp)`}>{print}</g>

        {/* volume shading */}
        <rect width={1000} height={1000} fill={`url(#${id}-shade)`} />
        <rect width={1000} height={1000} fill={`url(#${id}-vshade)`} />
        {/* knit texture */}
        <rect width={1000} height={1000} filter={`url(#${id}-tex)`} opacity={0.16} style={{ mixBlendMode: "overlay" }} />
      </g>

      {/* construction details drawn on top */}
      {kind === "tee" ? (
        <>
          <path d="M405 120 Q500 205 595 120" stroke={shade} strokeOpacity={0.55} strokeWidth={22} fill="none" />
          <path d="M412 136 Q500 210 588 136" stroke="#fff" strokeOpacity={0.08} strokeWidth={2} strokeDasharray="5 6" fill="none" />
          <path d="M122 336 L230 408" stroke={shade} strokeOpacity={0.5} strokeWidth={8} />
          <path d="M878 336 L770 408" stroke={shade} strokeOpacity={0.5} strokeWidth={8} />
          <path d="M306 866 Q500 886 694 866" stroke={shade} strokeOpacity={0.4} strokeWidth={4} strokeDasharray="8 6" fill="none" />
        </>
      ) : null}
      {kind === "hoodie" ? (
        <>
          <path d="M395 165 Q500 235 605 165" stroke={shade} strokeOpacity={0.5} strokeWidth={14} fill="none" />
          <path d="M455 205 L450 360" stroke="#ddd" strokeWidth={6} strokeLinecap="round" />
          <path d="M545 205 L552 350" stroke="#ddd" strokeWidth={6} strokeLinecap="round" />
          <rect x={444} y={356} width={12} height={26} rx={4} fill={C.orange} />
          <rect x={546} y={346} width={12} height={26} rx={4} fill={C.orange} />
          <path d="M350 650 L650 650 L680 820 L320 820 Z" fill={shade} opacity={0.12} />
          <path d="M350 650 L650 650 M350 650 Q330 720 320 820 M650 650 Q670 720 680 820" stroke={shade} strokeOpacity={0.45} strokeWidth={5} fill="none" />
          <path d="M300 850 Q500 875 700 850" stroke={shade} strokeOpacity={0.45} strokeWidth={18} fill="none" />
          <path d="M120 752 L222 782" stroke={shade} strokeOpacity={0.45} strokeWidth={18} />
          <path d="M880 752 L778 782" stroke={shade} strokeOpacity={0.45} strokeWidth={18} />
        </>
      ) : null}
      {kind === "pants" ? (
        <>
          <rect x={318} y={140} width={364} height={62} fill={shade} opacity={0.35} />
          <path d="M330 172 Q500 182 670 172" stroke="#fff" strokeOpacity={0.12} strokeWidth={2} strokeDasharray="6 6" fill="none" />
          <path d="M480 202 Q470 260 460 290 M520 202 Q530 260 540 290" stroke="#e8e8e8" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M288 862 L462 862 M538 862 L712 862" stroke={shade} strokeOpacity={0.6} strokeWidth={14} />
          <path d="M318 202 L292 860" stroke={C.orange} strokeWidth={10} opacity={0.9} />
          <path d="M682 202 L708 860" stroke={C.blue} strokeWidth={10} opacity={0.9} />
        </>
      ) : null}
      {kind === "cap" ? <circle cx={500} cy={240} r={15} fill={color} stroke={shade} strokeOpacity={0.4} strokeWidth={3} /> : null}
    </svg>
  );
};

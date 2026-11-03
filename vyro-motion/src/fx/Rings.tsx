import React from "react";

/** Orbiting thin circles, dashed arcs and tick marks. */
export const OrbitRings: React.FC<{ frame: number; cx: number; cy: number; base?: number; progress?: number; opacity?: number }> = ({
  frame,
  cx,
  cy,
  base = 300,
  progress = 1,
  opacity = 1,
}) => {
  const rings = [
    { r: base, w: 1.5, dash: "", speed: 0.25, col: "rgba(255,255,255,0.18)" },
    { r: base * 1.18, w: 2, dash: "2 14", speed: -0.5, col: "rgba(255,176,58,0.55)" },
    { r: base * 1.36, w: 3, dash: `${base * 1.4} ${base * 7}`, speed: 0.9, col: "url(#ringgrad)" },
    { r: base * 1.6, w: 1, dash: "60 30 4 30", speed: -0.2, col: "rgba(69,200,255,0.35)" },
    { r: base * 1.95, w: 1, dash: "", speed: 0, col: "rgba(255,255,255,0.07)" },
  ];
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id="ringgrad" x1="0" x2="1">
          <stop offset="0" stopColor="#FF5A1F" />
          <stop offset="1" stopColor="#45C8FF" />
        </linearGradient>
      </defs>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.r;
        const p = Math.max(0, Math.min(1, progress * 1.4 - i * 0.1));
        return (
          <g key={i} transform={`rotate(${frame * ring.speed + i * 40} ${cx} ${cy})`}>
            {ring.dash ? (
              <circle cx={cx} cy={cy} r={ring.r * (0.85 + 0.15 * p)} fill="none" stroke={ring.col} strokeWidth={ring.w} strokeDasharray={ring.dash} opacity={p} strokeLinecap="round" />
            ) : (
              <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke={ring.col} strokeWidth={ring.w} strokeDasharray={`${circ * p} ${circ}`} />
            )}
          </g>
        );
      })}
      {/* ticks */}
      <g transform={`rotate(${-frame * 0.15} ${cx} ${cy})`} opacity={progress}>
        {new Array(72).fill(0).map((_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const r1 = base * 1.75;
          const r2 = r1 + (i % 6 === 0 ? 18 : 7);
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={i % 6 === 0 ? 2 : 1}
            />
          );
        })}
      </g>
    </g>
  );
};

# Effets — implémentations Remotion

Briques réutilisables pour la DA « fil de lumière ». Composition de base : 1080×1920, 30 fps.
Les numéros renvoient au catalogue de `SKILL.md` §4.

## Utilitaires communs

```tsx
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing, AbsoluteFill} from 'remotion';

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);

export const p = (f: number, a: number, b: number, ease = expoOut) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Lueur : cœur clair + halo coloré en couches
export const glow = (c: string) =>
  `drop-shadow(0 0 2px #fff) drop-shadow(0 0 8px ${c}) drop-shadow(0 0 24px ${c}) drop-shadow(0 0 60px ${c}88)`;
```

## E1 — Trait lumineux qui voyage (queue effilée)

```tsx
// Tête qui avance, queue qui suit : la portion visible glisse le long du path.
export const LightTrail: React.FC<{d: string; from: number; dur: number; color: string; len?: number}> =
({d, from, dur, color, len = 0.35}) => {
  const f = useCurrentFrame();
  const t = p(f, from, from + dur);
  const head = t * (1 + len);          // 0 → 1+len
  const tail = Math.max(0, head - len);
  return (
    <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, filter: glow(color)}}>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${Math.min(head, 1) - tail} 2`} strokeDashoffset={-tail} />
      <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round"
        strokeDasharray={`${Math.min(head, 1) - tail} 2`} strokeDashoffset={-tail} />
    </svg>
  );
};
```
Effilement plus fin : dupliquer 3 paths de largeurs 14/8/3 avec des `len` décroissants.

## E2 — Écriture au trait

Lettres en `<text>` SVG ; chaque lettre apparaît quand la tête du trait passe son abscisse :
`opacity = p(f, from + dur * (x_lettre / largeur), +6)`, avec un léger `translateY(8px → 0)` et
un flash blanc → or (`fill` interpolé). Le trait passe **sous** le texte (ordre des calques) pour
garder la lisibilité.

## E3 — Trait → cercle → masque photo

```tsx
const close = p(f, 0, 20);          // le cercle se ferme
const fill  = p(f, 18, 34);         // l'image apparaît
<svg ...><circle cx={540} cy={900} r={220} pathLength={1} fill="none" stroke={gold}
  strokeWidth={8} strokeDasharray={`${close} 1`} transform="rotate(-90 540 900)" style={{filter: glow(gold)}}/></svg>
<Img src={staticFile('portrait.jpg')} style={{position:'absolute', left:320, top:680, width:440, height:440,
  borderRadius:'50%', objectFit:'cover', clipPath:`circle(${fill * 50}% at 50% 50%)`,
  transform:`scale(${1.15 - 0.15 * fill})`}}/>
```

## E4 — Chaîne de médaillons
Deux E3 positionnés aux extrémités d'un path en S (E1). Animer `translateX` du groupe
(−400 px sur 40 frames, expoOut) pendant que le S se redessine vers le médaillon suivant.

## E5 — Trait → contour d'objet
Path d'un `rect` arrondi (rx 60) tracé avec E1 (`len = 1`, tête qui ne disparaît pas), puis le
contenu (mockup téléphone, carte) fait un fondu + `scale 0.96 → 1` à l'intérieur.

## E6 — Ruban en spirale autour du produit
- Option Blender : courbe hélice + matériau Emission or, bloom (Eevee), rendu PNG séquence →
  `<OffthreadVideo>` / `<Img>` séquence.
- Option Remotion : `@remotion/three`, `TubeGeometry` sur une hélice, `MeshBasicMaterial`
  additif, `drawRange` animé pour la croissance du ruban ; la moitié arrière de l'hélice passe
  derrière le produit (deux meshes ou `depthTest`).

## E7 — Flare de naissance

```tsx
const s = spring({frame: f - from, fps, config: {damping: 14, mass: 0.6}});
<div style={{position:'absolute', left:540, top:960, transform:`translate(-50%,-50%) scale(${s})`}}>
  <div style={{width:24, height:24, borderRadius:'50%', background:'#fff', boxShadow:`0 0 40px 12px ${accent}`}}/>
  {[0, 90].map(r => <div key={r} style={{position:'absolute', left:'50%', top:'50%', width:260, height:2,
    background:`linear-gradient(90deg, transparent, #fff, transparent)`,
    transform:`translate(-50%,-50%) rotate(${r + f * 0.4}deg)`}}/>)}
</div>
```
Puis le logo : `opacity` + `letterSpacing 0.4em → 0.08em` + `blur(12px → 0)`.

## E8 — Spot radial respirant
```tsx
const pulse = 1 + 0.06 * Math.sin(f / 12);
<AbsoluteFill style={{background:`radial-gradient(circle at 50% 48%, ${accent}${'55'} 0%, transparent ${38 * pulse}%), #0A0A0A`}}/>
```

## E9 — Flèche / gribouillis dessiné
Path main levée (quelques courbes de Bézier irrégulières), `strokeDashoffset` 1 → 0 en 12–16
frames, `strokeWidth` 6, couleur blanche ou accent, `filter: glow` léger. Pointe de flèche
dessinée après le corps (décalage 4 frames).

## E10 — Carte 3D flottante
```tsx
<AbsoluteFill style={{perspective: 1400}}>
  <div style={{transform:`rotateX(${12 - 12 * t}deg) rotateY(${-18 + 10 * t}deg) translateZ(${-200 + 200 * t}px)`,
    borderRadius:20, background:'rgba(30,30,36,.92)', boxShadow:'0 40px 80px rgba(0,0,0,.5)'}}>...</div>
</AbsoluteFill>
```
Arrière-plan flouté (`filter: blur(8px)`) pour la profondeur de champ.

## E11 — Prompt tapé + menu
- Texte : `text.slice(0, Math.floor((f - from) / 1.5))` + curseur clignotant (`f % 16 < 8`).
- Menu : items qui tombent en cascade (`translateY(-8 → 0)`, délai 2 frames/item), surbrillance
  qui glisse vers l'item choisi, ✓ qui pop (`spring`).
- Envoi : bouton `scale 1 → 0.92 → 1`, puis « Generating… » avec points animés.

## E12 — Resolve pixel → net
Image rendue deux fois : version pixellisée (`imageRendering: pixelated` sur une copie réduite
à 1/16 puis agrandie) + version nette par-dessus en `opacity`/`clipPath` qui progresse, avec
`blur(20px → 0)` sur la nette.

## E13 — Whip / zoom-through
`translateX` ±1200 px en 6–8 frames + `<CameraMotionBlur samples={10} shutterAngle={270}>`
(`@remotion/motion-blur`). Zoom-through : `scale 1 → 4` + `opacity 1 → 0` sur la scène
sortante, la scène entrante part de `scale 0.6`.

## E14 — Trait-rideau de fin
Ligne horizontale (`height: 4`, glow) qui part de la gauche (`scaleX 0 → 1`, origine gauche) ;
la scène suivante est révélée par un `clipPath: inset(0 ${100 - t*100}% 0 0)` qui suit la tête.

## E15 — Logo typographique final
Icône carrée arrondie + wordmark en capitales espacées. Apparition : `opacity 0 → 1`,
`letterSpacing 0.5em → 0.2em`, `blur(6px → 0)` sur 18 frames ; CTA en dessous à +10 frames.

## Finitions globales
- Grain : `<AbsoluteFill>` avec un PNG de bruit en `mixBlendMode: 'overlay'`, opacité 0.06,
  position aléatoire chaque frame.
- Aberration chromatique sur les lumières : dupliquer le calque en rouge/cyan décalé de ±1,5 px,
  `mixBlendMode: 'screen'`.
- Particules : 60–120 points, 3 profondeurs (taille/vitesse/flou différents), seed fixe
  (`random()` de Remotion) pour un rendu déterministe.

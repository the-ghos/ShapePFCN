# Motion design — Kylian Mbappé « Le Roi »

Vidéo verticale 1080×1920, 30 i/s, ~58 s, réalisée avec Remotion.

- `src/Main.tsx` : la timeline (scènes calées sur le tempo de la musique, 70 BPM)
- `src/fx.tsx` : effets (texte doré, glitch, particules, rayons, confettis, onde de choc, light leaks, grain)
- `public/sfx` : effets sonores synthétisés ; `public/fonts` : Anton + Montserrat

Les médias sources (`public/clips`, `public/img`, `public/music.wav`) ne sont pas versionnés.

```bash
npm i
npx remotion studio          # aperçu
npx remotion render src/index.ts MbappeRoi out/mbappe-le-roi.mp4 --crf=17
```

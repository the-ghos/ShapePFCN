# VYRO MOTION — animation de logo

Animation de logo 1920×1080, 30 i/s, environ 28 s, réalisée avec [Remotion](https://remotion.dev).

## Scènes
1. **Intro « goutte d'eau »** : une goutte tombe dans le vide, ondes concentriques, éclaboussures, particules et souffle d'air.
2. **Révélation du logo** : les deux branches du V arrivent et se percutent (onde de choc), les traits de vitesse partent, un reflet lumineux passe, des cercles orbitaux tournent, puis VYRO / MOTION apparaissent.
3. **Logo 3D** : le V extrudé en 3D (three.js) tourne et se recompose, avec un éclairage orange et bleu.
4. **Merch** : le logo s'imprime sur de vraies photos de vêtements (polo, casquette trucker, hoodie) dans `public/garments/`, détourées puis imprimées en multiply avec déformation selon les plis, puis les pièces apparaissent ensemble. Pour ajouter un vêtement : déposer un PNG détouré dans `public/garments/` et ajouter une entrée dans `ITEMS` (`src/scenes/Merch.tsx`).
5. **Final** : une dernière goutte fait apparaître le logo complet, avec la signature « LE MOUVEMENT, PARTOUT. ».

Transitions : zoom-blur, cross-zoom, ripple (effet eau), dreamy-zoom, plus des transitions circulaires entre les vêtements.
Tout le son (gouttes, impacts, souffles, nappe d'ambiance) est synthétisé par `scripts/make-sfx.sh`.

## Utilisation
```bash
npm i
./scripts/make-sfx.sh            # régénère les sons dans public/sfx
npx remotion studio              # aperçu interactif
npx remotion render VyroMotion out/vyro-motion.mp4 --crf=16
```
Dans un environnement sans GPU ni écran : `REMOTION_BROWSER=/chemin/vers/chrome` (voir `remotion.config.ts`).

---
name: direction-artistique
description: Direction artistique "fil de lumière" pour pubs motion design 9:16 (TikTok, Reels, Shorts) — tirée de 3 vidéos de référence (parfum NUÉLA, Higgsfield, ElevenLabs). À charger dès que l'utilisateur envoie un texte, un brief, un nom de marque, un produit, une image ou une vidéo et veut une pub, une animation, un storyboard ou "la même DA". Donne la grammaire visuelle, les effets, les transitions, les palettes, le storyboard type et la méthode pour analyser une nouvelle référence.
---

# Direction artistique — « Le fil de lumière »

Synthèse de 3 vidéos de référence (format 576×1024, 30 fps, 17 à 35 s, **zéro cut dur détecté** :
tout est une seule continuité animée). Cette DA s'applique à n'importe quel texte ou produit.

## 1. La règle d'or : un seul élément conducteur

Chaque pub est portée par **un élément lumineux unique** (trait, étincelle, coup de pinceau)
qui **naît, voyage, se transforme** et **devient** chaque scène suivante. Il n'y a jamais de
coupe : la transition, c'est le trait lui-même.

| Référence | Élément conducteur | Ce qu'il devient |
|---|---|---|
| NUÉLA (parfum, luxe) | Ruban de lumière **or** | lettres du nom → cercle (masque photo) → chaîne en S entre portraits → rectangle arrondi (téléphone) → spirale autour du flacon 3D → trait horizontal de fin |
| Higgsfield (IA vidéo) | Étincelle **vert citron** (lens flare) | logo → carte de prompt → flèche dessinée à la main → menu → étincelle → logo |
| ElevenLabs (IA voix) | Orbe / coup de pinceau **orange** | point lumineux → icône pause → carte → gribouillis qui souligne → logo typographique |

➡ Pour tout nouveau brief : **choisir d'abord l'élément conducteur** et lister ses métamorphoses
(une par beat). C'est la colonne vertébrale du storyboard.

## 2. Structure type (15–30 s)

1. **Naissance (0–1,5 s)** — fond sombre ou neutre, un point de lumière apparaît, pulse, flare
   (étoile à 4 branches), révèle le logo ou le nom.
2. **Promesse (1,5–4 s)** — accroche courte, un mot-clé en couleur d'accent :
   « START WITH **ONE SENTENCE** », « Une voix pour chaque idée, en **70 langues** ».
3. **Démonstration (4–20 s)** — interface produit recréée (cartes, prompt qui se tape, menu
   déroulant, résultat) **ou** produit 3D héroïque. Chaque beat dure 1–2 s.
4. **Preuve / humain (optionnel)** — portraits dans des cercles, grille de résultats, conversation.
5. **Retour à la source (dernières 2–3 s)** — le trait revient, se contracte en étincelle,
   re-révèle le logo. **La pub boucle** : la fin rime avec le début.

## 3. Grammaire visuelle

### Fond
- **Toujours un fond simple + un halo radial** derrière le sujet (vignette inversée) :
  - luxe : brun-noir chaud + **champ d'étoiles / bokeh** sur 2–3 profondeurs (parallaxe) ;
  - tech créative : noir + **spot radial citron** qui pulse ;
  - tech douce : blanc cassé + **dégradé radial pêche/orange**.
- Particules / poussières lentes en permanence = la scène « respire ».

### Couleur
Une marque = **une seule couleur d'accent**, le reste est monochrome.

| Ambiance | Fond | Accent | Texte |
|---|---|---|---|
| Luxe / beauté / parfum | `#140D0A` → `#2A1C14` | or `#F5C77A` (cœur `#FFF4DC`) | ivoire `#F7EFE3` |
| Tech créative / IA image-vidéo | `#0A0A0A` | citron `#D7FF3A` | blanc `#FFFFFF`, gris `#8A8A8A` |
| Tech douce / voix / SaaS | `#F4F1EC` | orange `#FF5A2C` | encre `#1A1A1A` |

Toute lumière = **cœur presque blanc + halo coloré** (bloom en 2–3 couches de `drop-shadow`/blur).

### Typographie
- Luxe : **serif capitales très espacées** (type Cormorant / Didot), écrites **par le trait**
  (stroke-draw puis remplissage doré).
- Tech : **grotesque bold** (Inter / Satoshi / Helvetica Now), courte, un mot-clé en accent.
- Phrases ultra-courtes, rythmées : « Une phrase. Un film. »

### Interfaces recréées
- Cartes arrondies (rayon 12–20 px), ombres douces, fond sombre translucide ou blanc.
- Flottent en **perspective 3D** (rotateX/rotateY 8–20°), avec **profondeur de champ** (le
  reste flou) et **motion blur** pendant les déplacements.
- Micro-interactions réelles : texte qui se tape, menu qui s'ouvre, ✓ de sélection, bouton
  pressé, « Generating… », barre de progression.
- Révélation du résultat : **mosaïque pixellisée/floue → image nette** (« resolve »).

## 4. Catalogue d'effets (à réutiliser)

| # | Effet | Description | Vu dans |
|---|---|---|---|
| E1 | **Trait lumineux qui voyage** | Path SVG animé (`strokeDashoffset`), queue effilée, glow | 1, 3 |
| E2 | **Écriture au trait** | Le trait passe et laisse les lettres derrière lui | 1 |
| E3 | **Trait → cercle → masque** | Le trait boucle en cercle, l'intérieur devient une photo, liseré lumineux | 1 |
| E4 | **Chaîne de médaillons** | Courbe en S reliant deux cercles, qui glissent latéralement | 1 |
| E5 | **Trait → contour d'objet** | Le trait dessine un rectangle arrondi qui devient un téléphone / carte | 1 |
| E6 | **Ruban en spirale autour du produit** | Ruban 3D qui enroule le produit (Blender / Three.js) | 1 |
| E7 | **Flare de naissance** | Point → étoile 4 branches → logo apparaît | 2, 3 |
| E8 | **Spot radial respirant** | Halo radial qui pulse au rythme | 2, 3 |
| E9 | **Flèche / gribouillis dessiné** | Annotation main levée qui pointe ou souligne | 2, 3 |
| E10 | **Carte 3D flottante** | UI inclinée, ombre, DOF | 2, 3 |
| E11 | **Prompt tapé + menu** | Typewriter, dropdown, ✓, envoi | 2, 3 |
| E12 | **Resolve pixel → net** | Grille floue/pixellisée qui se précise | 2 |
| E13 | **Whip / zoom-through** | Passage rapide avec motion blur directionnel | 2, 3 |
| E14 | **Trait-rideau de fin** | Ligne horizontale lumineuse qui balaie l'écran | 1 |
| E15 | **Logo typographique final** | Icône + wordmark espacé, apparition douce | 2, 3 |

Implémentations Remotion de chaque effet : `references/effets-remotion.md`.

## 5. Mouvement

- Easing : sorties **expo-out** (`Easing.bezier(0.16, 1, 0.3, 1)`), ressorts amortis
  (`spring({damping: 18, mass: 0.8})`). Jamais de linéaire sauf pour les particules.
- Le trait accélère au départ, ralentit en arrivant (anticipation → arrivée douce).
- Caméra toujours légèrement en mouvement (dolly/zoom 2–5 %) : rien n'est figé.
- Un beat toutes les 1–2 s, calé sur la musique.

## 6. Ce que j'améliore par rapport aux références

1. **Natif 9:16** : les références filment un écran de laptop 16:9 (le contenu n'occupe
   ~35 % de l'image). Version propre : composition 1080×1920 plein cadre ; garder l'option
   « mise en scène laptop » comme variante « behind the scenes ».
2. **Lisibilité** : dans NUÉLA le trait barre le nom ; dans ElevenLabs le flou rend l'UI
   illisible. → Tenir chaque texte/UI **net au moins 0,8 s**, le trait passe *derrière* ou
   *sous* le texte.
3. **Zones sûres TikTok** : rien d'important dans les 20 % du bas ni la colonne de droite (icônes).
4. **Sound design synchronisé** : whoosh sur chaque trajet du trait, « shimmer » sur les flares,
   « tick » sur les clics UI, riser avant le logo, impact grave sur la révélation finale.
5. **Grain + aberration chromatique légère** sur les lumières pour unifier et faire « ciné ».
6. **Motion blur cohérent** (sous-échantillonnage) sur tout ce qui bouge vite, pas seulement
   les whips.
7. **CTA final** : logo + une ligne d'action (« Disponible maintenant », « Lien en bio ») au lieu
   du logo seul.
8. **Variation du rythme** : une respiration lente (≈2 s) au milieu pour contraster avec les beats rapides.

## 7. Procédure quand l'utilisateur envoie un TEXTE / BRIEF

Produire, dans cet ordre :

1. **Analyse** : marque, produit, cible, émotion (luxe / tech créative / tech douce / autre).
2. **Fiche DA** : élément conducteur, palette (fond / accent / texte), typo, fond + halo, musique.
3. **Accroche** : 1 à 3 phrases ultra-courtes, un mot-clé en accent.
4. **Storyboard minuté** (tableau) : `temps | ce qu'on voit | métamorphose du trait | effet (E#) | texte | son`.
5. **Proposition de réalisation** : Remotion (skills `remotion:*` / `publicite`), Blender pour le
   produit 3D si besoin, ElevenLabs pour voix et SFX.
6. Si demandé : implémenter et rendre le MP4.

Vérifier avant de livrer : un seul élément conducteur ? zéro cut dur ? une seule couleur
d'accent ? la fin rime avec le début ? textes lisibles ≥ 0,8 s ? zones sûres respectées ?

## 8. Procédure quand l'utilisateur envoie une VIDÉO / IMAGE de référence

```bash
S=<scratchpad>; mkdir -p $S/ref
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact ref.mp4
# planches contact (2 img/s)
ffmpeg -v error -i ref.mp4 -vf "fps=2,scale=192:-1,tile=6x3" $S/ref/sheet_%02d.jpg
# zoom sur la zone utile (adapter crop=w:h:x:y)
ffmpeg -v error -i ref.mp4 -vf "fps=2,crop=576:400:0:300,scale=288:-1,tile=4x4" $S/ref/crop_%02d.jpg
# détection de cuts (vide = continuité animée)
ffmpeg -v error -i ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"
```

Puis regarder les planches et remplir : élément conducteur, palette, typo, structure,
nouveaux effets (les ajouter au catalogue §4 avec un nouveau numéro), points faibles à améliorer.

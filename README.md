# MiniCraft MEGA 🌲⛏️

**MiniCraft MEGA** est un clone complet, performant et 100% navigateur de Minecraft écrit en HTML, CSS et JavaScript pur avec **Three.js** (via CDN).

## 🌟 Fonctionnalités Principales

- **Moteur Voxel & Monde Infini** : Chunks de 16x16x128, génération procédurale multi-octaves (Simplex Noise), 8 biomes distincts (Plaines, Forêt, Désert, Montagnes, Taïga, Jungle, Marais, Océan).
- **Sous-sol complet & Structure** : Caves 3D, minerais (Charbon, Fer, Or, Lapis, Redstone, Diamant), Donjons.
- **Rendu & Textures Procedurales** : Textures 16x16 générées dynamiquement par Canvas (0 image externe), cycle Jour/Nuit (15 min), météo.
- **Physique & Contrôles** : Mode FPS avec PointerLock (PC) ou Joystick Tactile (Mobile), Collisions AABB, gravité, nage, saut, mode vol double-espace.
- **Inventaire & Crafting** : Grille 2x2 et Établi 3x3, recettes réalistes (outils, fourneau, coffres, torches, TNT), durabilité des outils.
- **Fourneau & Cuisson** : Fonte des minerais et cuisson.
- **Mobs & Combat** : Mobs passifs (Vaches) et Mobs hostiles (Zombies, Squelettes, Creepers qui explosent !).
- **Effets & Audio Synthesizer** : Effets sonores générés via Web Audio API (aucun fichier son externe requis).
- **Sauvegarde Automatique** : Sauvegarde dans le `localStorage` toutes les 30 secondes.

## 🎮 Contrôles

### PC
- **Déplacement** : ZQSD / WASD
- **Saut** : Espace (Double-espace = Mode Vol)
- **Sprint / Sneak** : Shift / Ctrl
- **Regard** : Souris (Pointer Lock)
- **Miner / Attaquer** : Clic Gauche
- **Poser Bloc / Interagir** : Clic Droit
- **Hotbar** : Touches 1-9 ou Molette Souris

### Mobile
- **Déplacement** : Joystick tactile virtuel à gauche
- **Actions** : Boutons d'action SAUT, MINER, POSER, SAC à droite

## 🚀 Activation GitHub Pages
1. Poussez le dépôt sur GitHub.
2. Allez dans **Settings > Pages**.
3. Sous **Build and deployment**, choisissez la branche `main` / `/ (root)`.
4. Enregistrez : Votre jeu est accessible en ligne gratuitement sans installation !

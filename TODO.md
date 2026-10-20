# TODO.md — Feuilles de Route & Reprise MiniCraft MEGA

Ce document liste l'état d'avancement des fonctionnalités du projet et fournit des instructions détaillées pour tout futur agent souhaitant poursuivre le développement.

---

## 🟢 Features Implémentées et Opérationnelles
- [x] **Moteur Voxel & Chunks** : Système de chunks 16x16x128 avec meshing optimisé (culling de faces cachées).
- [x] **Génération Procédurale** : Bruit Simplex multi-octaves avec 8 biomes, grottes 3D, minerais et donjons.
- [x] **Textures & Audio 16x16** : Générateur de textures Canvas 0 asset externe + synthétiseur sonore Web Audio API.
- [x] **Contrôles FPS & Mobile** : Support PointerLock PC + Joystick tactile Mobile.
- [x] **Physique & Collisions** : Collisions AABB, gravité, vol double-espace, dégâts.
- [x] **Inventaire & Crafting** : Hotbar, sac 36 slots, établis 2x2/3x3, fourneau et coffres.
- [x] **Mobs & AI** : Vaches (passifs), Zombies, Squelettes, Creepers (explosion TNT/Creeper).
- [x] **Sauvegarde LocalStorage** : Auto-save 30s.

---

## 🟡 Features en Attente / Reprise Future Agent

### 1. Animations Dynamiques du Bras & Outils
- **Fichier impacté** : `js/joueur.js` & `index.html`
- **Instruction** : Animer le canvas `#hand-canvas` lors du clic gauche (coup de pioche) avec un mouvement d'oscillation angulaire.

### 2. Physique Avancée des Fluides (Eau/Lave de proche en proche)
- **Fichier impacté** : `js/agriculture.js`
- **Instruction** : Implémenter un algorithme BFS court pour étaler le bloc `WATER` (ID 24) et `LAVA` (ID 25) sur les blocs d'air adjacents.

### 3. Culture & Pousse du Blé étape par étape
- **Fichier impacté** : `js/agriculture.js`
- **Instruction** : Ajouter un timer par cycle de pousse (4 étapes) modifiant le sous-type du bloc `CROP_WHEAT` (ID 31).

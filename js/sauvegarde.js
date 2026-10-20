// Module js/sauvegarde.js
(function() {
  const Sauvegarde = {};
  const SAVE_KEY = 'minicraft_mega_save';

  Sauvegarde.saveGame = function() {
    if (!window.Joueur || !window.Moteur) return;

    const modifiedChunks = {};
    const loadedChunks = window.Moteur.getLoadedChunks();
    Object.keys(loadedChunks).forEach(key => {
      const c = loadedChunks[key];
      if (Object.keys(c.modifiedBlocks).length > 0) {
        modifiedChunks[key] = c.modifiedBlocks;
      }
    });

    const saveData = {
      player: {
        x: window.Joueur.position.x,
        y: window.Joueur.position.y,
        z: window.Joueur.position.z,
        health: window.Joueur.health,
        hunger: window.Joueur.hunger,
        xp: window.Joueur.xp
      },
      inventory: window.Inventaire ? window.Inventaire.getSlots() : [],
      chunks: modifiedChunks,
      time: window.Meteo ? window.Meteo.getTime() : 0,
      timestamp: Date.now()
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    if (window.UI) window.UI.showToast("Partie sauvegardée !");
  };

  Sauvegarde.hasSave = function() {
    return localStorage.getItem(SAVE_KEY) !== null;
  };

  Sauvegarde.loadSave = function() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch(e) {
      return null;
    }
  };

  window.Sauvegarde = Sauvegarde;
})();

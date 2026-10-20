// Module js/succes.js
(function() {
  const Succes = {};
  const unlocked = {};

  Succes.unlock = function(id, title, desc) {
    if (unlocked[id]) return;
    unlocked[id] = true;
    if (window.UI) {
      window.UI.showToast(`🏆 SUCCÈS : ${title} - ${desc}`);
    }
    if (window.AudioEngine) {
      window.AudioEngine.playPlace();
    }
  };

  window.Succes = Succes;
})();

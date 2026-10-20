// Module js/ui.js
(function() {
  const UI = {};

  UI.init = function() {
    setupHUD();
    setupMenuEvents();
  };

  function setupHUD() {
    const hotbarEl = document.getElementById('hotbar');
    if (!hotbarEl) return;
    hotbarEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = `slot ${i === 0 ? 'selected' : ''}`;
      slot.dataset.index = i;
      slot.addEventListener('click', () => {
        if (window.Inventaire) {
          window.Inventaire.setSelectedSlotIndex(i);
          UI.updateHotbar();
        }
      });
      hotbarEl.appendChild(slot);
    }
  }

  UI.updateHotbar = function() {
    if (!window.Inventaire) return;
    const slots = window.Inventaire.getSlots();
    const selectedIdx = window.Inventaire.getSelectedSlotIndex();
    const hotbarEl = document.getElementById('hotbar');
    if (!hotbarEl) return;

    const children = hotbarEl.children;
    for (let i = 0; i < 9; i++) {
      const slotEl = children[i];
      if (!slotEl) continue;
      slotEl.className = `slot ${i === selectedIdx ? 'selected' : ''}`;
      slotEl.innerHTML = '';

      const item = slots[i];
      if (item) {
        const img = document.createElement('img');
        img.src = window.Textures.getItemDataURL(item.id);
        slotEl.appendChild(img);

        if (item.count > 1) {
          const countEl = document.createElement('span');
          countEl.className = 'slot-count';
          countEl.textContent = item.count;
          slotEl.appendChild(countEl);
        }
      }
    }

    const nameEl = document.getElementById('held-item-name');
    if (nameEl) {
      const held = window.Inventaire.getHeldItem();
      nameEl.textContent = held ? held.id.toUpperCase() : '';
    }
  };

  function setupMenuEvents() {
    const btnPlayNew = document.getElementById('btn-play-new');
    const btnContinue = document.getElementById('btn-continue');
    const mainMenu = document.getElementById('main-menu');
    const hud = document.getElementById('hud');

    if (window.Sauvegarde && window.Sauvegarde.hasSave()) {
      if (btnContinue) {
        btnContinue.disabled = false;
        btnContinue.classList.remove('disabled');
      }
    }

    if (btnPlayNew) {
      btnPlayNew.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        hud.classList.remove('hidden');
        if (window.startGame) window.startGame(false);
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        hud.classList.remove('hidden');
        if (window.startGame) window.startGame(true);
      });
    }
  }

  UI.showToast = function(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
  };

  UI.showDeathScreen = function(cause) {
    const deathScreen = document.getElementById('death-screen');
    const causeEl = document.getElementById('death-cause');
    if (deathScreen) deathScreen.classList.remove('hidden');
    if (causeEl) causeEl.textContent = cause;
  };

  window.UI = UI;
})();

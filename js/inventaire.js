// Module js/inventaire.js
(function() {
  const Inventaire = {};

  // Inventory 36 slots + 9 hotbar
  const mainSlots = new Array(36).fill(null);
  let selectedHotbarIndex = 0;
  const chestsData = {}; // 'x,y,z' -> Array(27)

  Inventaire.init = function() {
    // Fill hotbar with starting items for easy testing
    mainSlots[0] = { id: 'wood', count: 16 };
    mainSlots[1] = { id: 'stone', count: 32 };
    mainSlots[2] = { id: 'iron_pickaxe', count: 1, durability: 250 };
  };

  Inventaire.getSlots = function() { return mainSlots; };
  Inventaire.getSelectedSlotIndex = function() { return selectedHotbarIndex; };
  Inventaire.setSelectedSlotIndex = function(idx) { selectedHotbarIndex = idx; };

  Inventaire.getHeldItem = function() {
    return mainSlots[selectedHotbarIndex];
  };

  Inventaire.addItem = function(itemId, count) {
    count = count || 1;

    // Check if stackable existing slot
    for (let i = 0; i < 36; i++) {
      if (mainSlots[i] && mainSlots[i].id === itemId && mainSlots[i].count < 64) {
        const space = 64 - mainSlots[i].count;
        const add = Math.min(space, count);
        mainSlots[i].count += add;
        count -= add;
        if (count <= 0) return true;
      }
    }

    // Place in first empty slot
    for (let i = 0; i < 36; i++) {
      if (!mainSlots[i]) {
        mainSlots[i] = { id: itemId, count: Math.min(64, count) };
        count -= mainSlots[i].count;
        if (count <= 0) return true;
      }
    }
    return count === 0;
  };

  Inventaire.removeHeldItem = function(count) {
    count = count || 1;
    const item = mainSlots[selectedHotbarIndex];
    if (!item) return;
    item.count -= count;
    if (item.count <= 0) {
      mainSlots[selectedHotbarIndex] = null;
    }
  };

  Inventaire.getChest = function(x, y, z) {
    const key = `${x},${y},${z}`;
    if (!chestsData[key]) {
      chestsData[key] = new Array(27).fill(null);
    }
    return chestsData[key];
  };

  window.Inventaire = Inventaire;
})();

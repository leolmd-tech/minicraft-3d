// Module js/combat.js
(function() {
  const Combat = {};

  Combat.attackMob = function(mob, weaponId) {
    let damage = 2; // Hand damage
    if (weaponId) {
      if (weaponId.includes('wooden_sword')) damage = 4;
      if (weaponId.includes('stone_sword')) damage = 5;
      if (weaponId.includes('iron_sword')) damage = 6;
      if (weaponId.includes('diamond_sword')) damage = 7;
    }

    mob.health -= damage;
    if (window.AudioEngine) window.AudioEngine.playHurt();

    if (mob.health <= 0) {
      // Drop loot into inventory
      if (mob.type === 'cow' && window.Inventaire) window.Inventaire.addItem('beef', 2);
      if (mob.type === 'zombie' && window.Inventaire) window.Inventaire.addItem('rotten_flesh', 1);
      if (mob.type === 'creeper' && window.Inventaire) window.Inventaire.addItem('gunpowder', 2);
      if (mob.type === 'skeleton' && window.Inventaire) window.Inventaire.addItem('bone', 2);
    }
  };

  window.Combat = Combat;
})();

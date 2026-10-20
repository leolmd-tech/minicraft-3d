// Module js/agriculture.js
(function() {
  const Agriculture = {};

  const activeExplosions = [];

  Agriculture.igniteTNT = function(x, y, z, moteur) {
    if (window.AudioEngine) window.AudioEngine.playCreeperHiss();
    setTimeout(() => {
      // Destroy 3x3x3 blocks around TNT
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (dx*dx + dy*dy + dz*dz <= 6) {
              const bx = x + dx, by = y + dy, bz = z + dz;
              const b = moteur.getBlockAt(bx, by, bz);
              if (b && b !== window.Biomes.BLOCK.BEDROCK) {
                moteur.setBlockAt(bx, by, bz, window.Biomes.BLOCK.AIR);
              }
            }
          }
        }
      }
      if (window.AudioEngine) window.AudioEngine.playExplosion();
    }, 1500);
  };

  window.Agriculture = Agriculture;
})();

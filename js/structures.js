// Module js/structures.js
(function() {
  const Structures = {};

  // Simple PRNG for deterministic structure placement per position
  function createPosRand(x, z) {
    let s = Math.abs(x * 73856093 ^ z * 19349663);
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Generate tree in chunk voxel grid
  Structures.generateTree = function(chunk, lx, y, lz, treeType) {
    const B = window.Biomes.BLOCK;
    const trunkHeight = treeType === 'jungle' ? 7 : (treeType === 'taiga' ? 6 : 4);
    const leafRadius = treeType === 'jungle' ? 3 : 2;

    // Trunk
    for (let h = 0; h < trunkHeight; h++) {
      chunk.setBlock(lx, y + h, lz, B.WOOD);
    }

    // Leaves
    const top = y + trunkHeight;
    for (let ly = top - 2; ly <= top + 1; ly++) {
      for (let dx = -leafRadius; dx <= leafRadius; dx++) {
        for (let dz = -leafRadius; dz <= leafRadius; dz++) {
          if (Math.abs(dx) === leafRadius && Math.abs(dz) === leafRadius && ly === top + 1) continue;
          const wx = lx + dx;
          const wz = lz + dz;
          if (wx >= 0 && wx < 16 && wz >= 0 && wz < 16 && ly < 128) {
            if (chunk.getBlock(wx, ly, wz) === B.AIR) {
              chunk.setBlock(wx, ly, wz, B.LEAVES);
            }
          }
        }
      }
    }
  };

  Structures.generateCactus = function(chunk, lx, y, lz) {
    const B = window.Biomes.BLOCK;
    const h = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < h; i++) {
      if (y + i < 128) chunk.setBlock(lx, y + i, lz, B.CACTUS);
    }
  };

  // Generate dungeon structure underground
  Structures.generateDungeon = function(chunk, cx, cz) {
    const rand = createPosRand(cx, cz);
    if (rand() > 0.05) return; // 5% chance per chunk

    const B = window.Biomes.BLOCK;
    const dx = 4 + Math.floor(rand() * 8);
    const dy = 20 + Math.floor(rand() * 20);
    const dz = 4 + Math.floor(rand() * 8);

    // Cobblestone room with chest
    for (let x = dx - 3; x <= dx + 3; x++) {
      for (let z = dz - 3; z <= dz + 3; z++) {
        for (let y = dy; y <= dy + 4; y++) {
          if (x >= 0 && x < 16 && z >= 0 && z < 16) {
            if (y === dy || y === dy + 4 || x === dx - 3 || x === dx + 3 || z === dz - 3 || z === dz + 3) {
              chunk.setBlock(x, y, z, B.COBBLESTONE);
            } else {
              chunk.setBlock(x, y, z, B.AIR);
            }
          }
        }
      }
    }

    // Place Chest
    if (dx >= 0 && dx < 16 && dz >= 0 && dz < 16) {
      chunk.setBlock(dx, dy + 1, dz, B.CHEST);
    }
  };

  window.Structures = Structures;
})();

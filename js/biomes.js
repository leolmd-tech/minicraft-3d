// Module js/biomes.js
(function() {
  const Biomes = {};

  // Simple Perlin Noise 2D / 3D Implementation
  function SimplexNoise(seed) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    const p = new Uint8Array(256);
    let s = seed || 1234;
    function rand() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    }
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }

    const perm = new Uint8Array(512);
    const permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      permMod12[i] = (perm[i] % 12);
    }

    const grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];

    this.noise2D = function(xin, yin) {
      let n0, n1, n2;
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;

      let i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; }
      else { i1 = 0; j1 = 1; }

      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;

      const ii = i & 255;
      const jj = j & 255;

      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 < 0) n0 = 0.0;
      else {
        t0 *= t0;
        const gi0 = permMod12[ii + perm[jj]];
        n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
      }

      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 < 0) n1 = 0.0;
      else {
        t1 *= t1;
        const gi1 = permMod12[ii + i1 + perm[jj + j1]];
        n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
      }

      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 < 0) n2 = 0.0;
      else {
        t2 *= t2;
        const gi2 = permMod12[ii + 1 + perm[jj + 1]];
        n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
      }

      return 70.0 * (n0 + n1 + n2);
    };

    this.noise3D = function(xin, yin, zin) {
      let n0, n1, n2, n3;
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const X0 = i - t; const Y0 = j - t; const Z0 = k - t;
      const x0 = xin - X0; const y0 = yin - Y0; const z0 = zin - Z0;

      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
        else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
        else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
      } else {
        if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
        else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
        else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
      }

      const x1 = x0 - i1 + G3; const y1 = y0 - j1 + G3; const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2.0*G3; const y2 = y0 - j2 + 2.0*G3; const z2 = z0 - k2 + 2.0*G3;
      const x3 = x0 - 1.0 + 3.0*G3; const y3 = y0 - 1.0 + 3.0*G3; const z3 = z0 - 1.0 + 3.0*G3;

      const ii = i & 255; const jj = j & 255; const kk = k & 255;

      let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if (t0 < 0) n0 = 0.0;
      else {
        t0 *= t0;
        const gi0 = permMod12[ii + perm[jj + perm[kk]]];
        n0 = t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0 + grad3[gi0][2]*z0);
      }

      let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if (t1 < 0) n1 = 0.0;
      else {
        t1 *= t1;
        const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
        n1 = t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1 + grad3[gi1][2]*z1);
      }

      let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if (t2 < 0) n2 = 0.0;
      else {
        t2 *= t2;
        const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
        n2 = t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2 + grad3[gi2][2]*z2);
      }

      let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if (t3 < 0) n3 = 0.0;
      else {
        t3 *= t3;
        const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
        n3 = t3 * t3 * (grad3[gi3][0]*x3 + grad3[gi3][1]*y3 + grad3[gi3][2]*z3);
      }

      return 32.0 * (n0 + n1 + n2 + n3);
    };
  }

  // Block IDs mapping
  Biomes.BLOCK = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    COBBLESTONE: 4,
    WOOD: 5,
    LEAVES: 6,
    SAND: 7,
    SNOW: 8,
    ICE: 9,
    GLASS: 10,
    BRICK: 11,
    ORE_COAL: 12,
    ORE_IRON: 13,
    ORE_GOLD: 14,
    ORE_LAPIS: 15,
    ORE_REDSTONE: 16,
    ORE_DIAMOND: 17,
    BEDROCK: 18,
    PLANKS: 19,
    CRAFTING_TABLE: 20,
    FURNACE: 21,
    CHEST: 22,
    TNT: 23,
    WATER: 24,
    LAVA: 25,
    TORCH: 26,
    CACTUS: 27,
    FLOWER_RED: 28,
    FLOWER_YELLOW: 29,
    TALL_GRASS: 30,
    CROP_WHEAT: 31
  };

  // Biome Types definition
  Biomes.TYPES = {
    PLAINS: { name: 'Plaines', topBlock: 1, subBlock: 2, height: 64, scale: 0.008, mult: 12 },
    FOREST: { name: 'Forêt', topBlock: 1, subBlock: 2, height: 68, scale: 0.01, mult: 16 },
    DESERT: { name: 'Désert', topBlock: 7, subBlock: 7, height: 62, scale: 0.008, mult: 8 },
    MOUNTAINS: { name: 'Montagnes', topBlock: 8, subBlock: 3, height: 90, scale: 0.015, mult: 35 },
    TAIGA: { name: 'Taïga', topBlock: 8, subBlock: 2, height: 72, scale: 0.01, mult: 20 },
    JUNGLE: { name: 'Jungle', topBlock: 1, subBlock: 2, height: 75, scale: 0.012, mult: 25 },
    SWAMP: { name: 'Marais', topBlock: 1, subBlock: 2, height: 60, scale: 0.006, mult: 4 },
    OCEAN: { name: 'Océan', topBlock: 7, subBlock: 7, height: 45, scale: 0.005, mult: 10 }
  };

  let noiseGen = new SimplexNoise(1337);
  let caveNoise = new SimplexNoise(9999);

  Biomes.setSeed = function(seed) {
    const s = typeof seed === 'number' ? seed : hashString(seed);
    noiseGen = new SimplexNoise(s);
    caveNoise = new SimplexNoise(s + 100);
  };

  function hashString(str) {
    let hash = 0;
    if (!str) return 12345;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  Biomes.getBiomeAt = function(x, z) {
    const temp = noiseGen.noise2D(x * 0.002, z * 0.002);
    const humid = noiseGen.noise2D(x * 0.002 + 500, z * 0.002 + 500);

    if (temp < -0.3) {
      return humid > 0 ? Biomes.TYPES.TAIGA : Biomes.TYPES.MOUNTAINS;
    } else if (temp > 0.4) {
      return humid < -0.2 ? Biomes.TYPES.DESERT : Biomes.TYPES.JUNGLE;
    } else {
      if (humid < -0.4) return Biomes.TYPES.OCEAN;
      if (humid > 0.3) return Biomes.TYPES.SWAMP;
      if (temp > 0.1) return Biomes.TYPES.FOREST;
      return Biomes.TYPES.PLAINS;
    }
  };

  Biomes.getHeightAt = function(x, z) {
    const biome = Biomes.getBiomeAt(x, z);
    const baseNoise = noiseGen.noise2D(x * biome.scale, z * biome.scale);
    const detailNoise = noiseGen.noise2D(x * 0.05, z * 0.05) * 0.2;
    return Math.floor(biome.height + (baseNoise + detailNoise) * biome.mult);
  };

  Biomes.isCave = function(x, y, z) {
    if (y <= 2 || y >= 115) return false;
    const n = caveNoise.noise3D(x * 0.03, y * 0.03, z * 0.03);
    return n > 0.42;
  };

  Biomes.getOreForHeight = function(y, rand) {
    if (y < 16 && rand < 0.01) return Biomes.BLOCK.ORE_DIAMOND;
    if (y < 32 && rand < 0.02) return Biomes.BLOCK.ORE_REDSTONE;
    if (y < 32 && rand < 0.02) return Biomes.BLOCK.ORE_LAPIS;
    if (y < 48 && rand < 0.03) return Biomes.BLOCK.ORE_GOLD;
    if (y < 64 && rand < 0.06) return Biomes.BLOCK.ORE_IRON;
    if (y < 96 && rand < 0.1) return Biomes.BLOCK.ORE_COAL;
    return Biomes.BLOCK.STONE;
  };

  window.Biomes = Biomes;
})();

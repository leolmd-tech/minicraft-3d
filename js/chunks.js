// Module js/chunks.js
(function() {
  const Chunks = {};
  Chunks.CHUNK_SIZE = 16;
  Chunks.CHUNK_HEIGHT = 128;

  // Single Chunk class with voxel array and geometry mesher
  function Chunk(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(16 * 128 * 16);
    this.mesh = null;
    this.modifiedBlocks = {}; // Map 'x,y,z' -> blockId for saves
  }

  Chunk.prototype.getIndex = function(x, y, z) {
    return (y * 256) + (z * 16) + x;
  };

  Chunk.prototype.getBlock = function(x, y, z) {
    if (x < 0 || x >= 16 || z < 0 || z >= 16 || y < 0 || y >= 128) return 0;
    return this.blocks[this.getIndex(x, y, z)];
  };

  Chunk.prototype.setBlock = function(x, y, z, id) {
    if (x < 0 || x >= 16 || z < 0 || z >= 16 || y < 0 || y >= 128) return;
    this.blocks[this.getIndex(x, y, z)] = id;
    this.modifiedBlocks[`${x},${y},${z}`] = id;
  };

  Chunk.prototype.generateTerrain = function() {
    const B = window.Biomes.BLOCK;
    const worldX0 = this.cx * 16;
    const worldZ0 = this.cz * 16;

    for (let lx = 0; lx < 16; lx++) {
      for (let lz = 0; lz < 16; lz++) {
        const wx = worldX0 + lx;
        const wz = worldZ0 + lz;
        const surfaceY = window.Biomes.getHeightAt(wx, wz);
        const biome = window.Biomes.getBiomeAt(wx, wz);

        // Bedrock bottom layer
        this.setBlock(lx, 0, B.BEDROCK);

        for (let y = 1; y < 128; y++) {
          if (y > surfaceY) {
            // Water filling up to sea level 60
            if (y <= 60 && biome.name === 'Océan') {
              this.setBlock(lx, y, lz, B.WATER);
            } else {
              this.setBlock(lx, y, lz, B.AIR);
            }
            continue;
          }

          // Check caves
          if (window.Biomes.isCave(wx, y, wz)) {
            this.setBlock(lx, y, lz, B.AIR);
            continue;
          }

          if (y === surfaceY) {
            this.setBlock(lx, y, lz, biome.topBlock);
          } else if (y >= surfaceY - 3) {
            this.setBlock(lx, y, lz, biome.subBlock);
          } else {
            // Underground stone & ores
            const rand = Math.random();
            const ore = window.Biomes.getOreForHeight(y, rand);
            this.setBlock(lx, y, lz, ore);
          }
        }

        // Trees & Flora generation on surface
        if (surfaceY > 60 && surfaceY < 100) {
          const rand = Math.random();
          if (biome.name === 'Forêt' && rand < 0.05) {
            window.Structures.generateTree(this, lx, surfaceY + 1, lz, 'oak');
          } else if (biome.name === 'Taïga' && rand < 0.04) {
            window.Structures.generateTree(this, lx, surfaceY + 1, lz, 'taiga');
          } else if (biome.name === 'Jungle' && rand < 0.08) {
            window.Structures.generateTree(this, lx, surfaceY + 1, lz, 'jungle');
          } else if (biome.name === 'Désert' && rand < 0.01) {
            window.Structures.generateCactus(this, lx, surfaceY + 1, lz);
          } else if (biome.name === 'Plaines') {
            if (rand < 0.03) this.setBlock(lx, surfaceY + 1, lz, B.TALL_GRASS);
            else if (rand < 0.005) this.setBlock(lx, surfaceY + 1, lz, B.FLOWER_RED);
            else if (rand < 0.01) this.setBlock(lx, surfaceY + 1, lz, B.FLOWER_YELLOW);
          }
        }
      }
    }

    // Dungeon chance
    window.Structures.generateDungeon(this, this.cx, this.cz);
  };

  // Build custom meshed geometry (Culled faces)
  Chunk.prototype.buildMesh = function(scene, materialsMap) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let indexOffset = 0;

    const B = window.Biomes.BLOCK;

    // Face offsets
    const faces = [
      { dir: [0, 1, 0], norm: [0, 1, 0], corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]], faceIdx: 0 }, // Top
      { dir: [0,-1, 0], norm: [0,-1, 0], corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]], faceIdx: 1 }, // Bottom
      { dir: [0, 0, 1], norm: [0, 0, 1], corners: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]], faceIdx: 2 }, // Front
      { dir: [0, 0,-1], norm: [0, 0,-1], corners: [[1,0,0],[0,0,0],[0,1,0],[1,1,0]], faceIdx: 3 }, // Back
      { dir: [1, 0, 0], norm: [1, 0, 0], corners: [[1,0,1],[1,0,0],[1,1,0],[1,1,1]], faceIdx: 4 }, // Right
      { dir: [-1,0, 0], norm: [-1,0, 0], corners: [[0,0,0],[0,0,1],[0,1,1],[0,1,0]], faceIdx: 5 }  // Left
    ];

    const worldX0 = this.cx * 16;
    const worldZ0 = this.cz * 16;

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 128; y++) {
        for (let z = 0; z < 16; z++) {
          const blockId = this.getBlock(x, y, z);
          if (blockId === B.AIR) continue;

          for (let f = 0; f < 6; f++) {
            const face = faces[f];
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighborId = this.getBlock(nx, ny, nz);
            // Hide face if neighbor is solid
            if (neighborId !== B.AIR && neighborId !== B.WATER && neighborId !== B.GLASS && neighborId !== B.LEAVES) {
              continue;
            }

            // Append vertices
            for (let c = 0; c < 4; c++) {
              const corner = face.corners[c];
              positions.push(worldX0 + x + corner[0], y + corner[1], worldZ0 + z + corner[2]);
              normals.push(...face.norm);
            }

            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

            indices.push(
              indexOffset, indexOffset + 1, indexOffset + 2,
              indexOffset, indexOffset + 2, indexOffset + 3
            );
            indexOffset += 4;
          }
        }
      }
    }

    if (positions.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Use default material or custom terrain texture atlas material
    const mat = materialsMap['default'] || new THREE.MeshLambertMaterial({ color: 0x888888 });
    this.mesh = new THREE.Mesh(geometry, mat);
    scene.add(this.mesh);
  };

  Chunks.Chunk = Chunk;
  window.Chunks = Chunks;
})();

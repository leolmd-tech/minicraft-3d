// Module js/textures.js
(function() {
  const Textures = {};
  const cache = {};
  const threeTextures = {};
  const itemCanvasCache = {};

  // Helper seed pseudo-random for procedural textures
  function createRandom(seed) {
    let s = seed || 123456789;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  // Create 16x16 canvas with a pixel drawing function
  function generateCanvasTexture(drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    return canvas;
  }

  function canvasToThreeTexture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  // Block definitions and pixel art generator
  const blockDrawers = {
    dirt: function(ctx) {
      const rand = createRandom(101);
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.25) {
            ctx.fillStyle = '#573d26';
            ctx.fillRect(x, y, 1, 1);
          } else if (r > 0.8) {
            ctx.fillStyle = '#9c7352';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    grass_top: function(ctx) {
      const rand = createRandom(202);
      ctx.fillStyle = '#5c8e32';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.3) {
            ctx.fillStyle = '#477023';
            ctx.fillRect(x, y, 1, 1);
          } else if (r > 0.75) {
            ctx.fillStyle = '#72ab3d';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    grass_side: function(ctx) {
      blockDrawers.dirt(ctx);
      const rand = createRandom(203);
      ctx.fillStyle = '#5c8e32';
      ctx.fillRect(0, 0, 16, 4);
      for (let x = 0; x < 16; x++) {
        const h = 3 + Math.floor(rand() * 4);
        for (let y = 0; y < h; y++) {
          const r = rand();
          ctx.fillStyle = r > 0.5 ? '#5c8e32' : '#477023';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    stone: function(ctx) {
      const rand = createRandom(303);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.2) {
            ctx.fillStyle = '#5a5a5a';
            ctx.fillRect(x, y, 1, 1);
          } else if (r > 0.82) {
            ctx.fillStyle = '#a0a0a0';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    cobblestone: function(ctx) {
      const rand = createRandom(304);
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if ((x % 4 === 0 && y % 2 === 0) || (x + y) % 5 === 0) {
            ctx.fillStyle = '#3d3d3d';
            ctx.fillRect(x, y, 1, 1);
          } else if (rand() > 0.7) {
            ctx.fillStyle = '#999999';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    wood_side: function(ctx) {
      ctx.fillStyle = '#674d2f';
      ctx.fillRect(0, 0, 16, 16);
      const rand = createRandom(404);
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          if (x % 3 === 0 || rand() < 0.15) {
            ctx.fillStyle = '#42301c';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    wood_top: function(ctx) {
      ctx.fillStyle = '#a28258';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#674d2f';
      ctx.lineWidth = 1;
      ctx.strokeRect(2.5, 2.5, 11, 11);
      ctx.strokeRect(5.5, 5.5, 5, 5);
      ctx.fillStyle = '#42301c';
      ctx.fillRect(0, 0, 16, 2); ctx.fillRect(0, 14, 16, 2);
      ctx.fillRect(0, 0, 2, 16); ctx.fillRect(14, 0, 2, 16);
    },
    planks: function(ctx) {
      ctx.fillStyle = '#9e7949';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#5c4323';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(8, 0, 1, 3);
      ctx.fillRect(4, 4, 1, 3);
      ctx.fillRect(12, 8, 1, 3);
      ctx.fillRect(6, 12, 1, 3);
    },
    leaves: function(ctx) {
      const rand = createRandom(505);
      ctx.fillStyle = '#2d6d1b';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.2) {
            ctx.fillStyle = '#1c4810';
            ctx.fillRect(x, y, 1, 1);
          } else if (r > 0.75) {
            ctx.fillStyle = '#44962c';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    sand: function(ctx) {
      const rand = createRandom(606);
      ctx.fillStyle = '#dcd3a1';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.2) {
            ctx.fillStyle = '#b3aa77';
            ctx.fillRect(x, y, 1, 1);
          } else if (r > 0.8) {
            ctx.fillStyle = '#f0e8be';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    snow: function(ctx) {
      const rand = createRandom(707);
      ctx.fillStyle = '#eaf7fd';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (rand() < 0.15) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, 1, 1);
          } else if (rand() > 0.85) {
            ctx.fillStyle = '#d0e5f2';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    ice: function(ctx) {
      ctx.fillStyle = '#8cbbf1';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#bce0fd';
      ctx.fillRect(2, 2, 4, 1);
      ctx.fillRect(2, 3, 1, 3);
      ctx.fillRect(9, 10, 5, 1);
      ctx.fillRect(13, 11, 1, 3);
    },
    glass: function(ctx) {
      ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(0, 0, 1, 16); ctx.fillRect(15, 0, 1, 16);
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(10, 11, 3, 2);
    },
    brick: function(ctx) {
      ctx.fillStyle = '#9b422a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d3d3d3';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(7, 0, 1, 3); ctx.fillRect(15, 0, 1, 3);
      ctx.fillRect(3, 4, 1, 3); ctx.fillRect(11, 4, 1, 3);
      ctx.fillRect(7, 8, 1, 3); ctx.fillRect(15, 8, 1, 3);
      ctx.fillRect(3, 12, 1, 3); ctx.fillRect(11, 12, 1, 3);
    },
    // Ore textures with visible spots
    ore_coal: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
      ctx.fillRect(7, 12, 3, 2);
    },
    ore_iron: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#d8af93';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
      ctx.fillRect(7, 12, 3, 2);
    },
    ore_gold: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#fcee4b';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
      ctx.fillRect(7, 12, 3, 2);
    },
    ore_lapis: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#1042b0';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
    },
    ore_redstone: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#ff1100';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
    },
    ore_diamond: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#42f5e3';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 2, 4, 3);
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(11, 9, 3, 4);
    },
    bedrock: function(ctx) {
      const rand = createRandom(999);
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = rand();
          if (r < 0.35) ctx.fillStyle = '#111111';
          else if (r > 0.8) ctx.fillStyle = '#555555';
          else ctx.fillStyle = '#333333';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    crafting_table_top: function(ctx) {
      blockDrawers.planks(ctx);
      ctx.fillStyle = '#6b4c2b';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#3a2714';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#c49a62';
      ctx.fillRect(5, 5, 2, 2); ctx.fillRect(9, 5, 2, 2);
      ctx.fillRect(5, 9, 6, 2);
    },
    furnace_front: function(ctx) {
      blockDrawers.stone(ctx);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(3, 4, 10, 9);
      ctx.fillStyle = '#333333';
      ctx.fillRect(4, 5, 8, 7);
    },
    furnace_front_lit: function(ctx) {
      blockDrawers.furnace_front(ctx);
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(5, 7, 6, 4);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(6, 8, 4, 2);
    },
    chest_top: function(ctx) {
      blockDrawers.planks(ctx);
      ctx.fillStyle = '#2d1e10';
      ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(0, 0, 1, 16); ctx.fillRect(15, 0, 1, 16);
    },
    chest_side: function(ctx) {
      blockDrawers.planks(ctx);
      ctx.fillStyle = '#2d1e10';
      ctx.fillRect(0, 0, 16, 2); ctx.fillRect(0, 14, 16, 2);
      ctx.fillRect(0, 0, 2, 16); ctx.fillRect(14, 0, 2, 16);
      ctx.fillStyle = '#808080';
      ctx.fillRect(7, 5, 2, 4);
    },
    tnt_side: function(ctx) {
      ctx.fillStyle = '#db2a1d';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 5, 16, 6);
      ctx.fillStyle = '#000000';
      // TNT Text pixelized
      ctx.fillRect(2, 6, 3, 1); ctx.fillRect(3, 7, 1, 3); // T
      ctx.fillRect(6, 6, 1, 4); ctx.fillRect(8, 6, 1, 4); ctx.fillRect(7, 7, 1, 2); // N
      ctx.fillRect(11, 6, 3, 1); ctx.fillRect(12, 7, 1, 3); // T
    },
    tnt_top: function(ctx) {
      ctx.fillStyle = '#db2a1d';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#111111';
      ctx.fillRect(7, 7, 2, 2);
    },
    water: function(ctx) {
      ctx.fillStyle = 'rgba(30, 100, 230, 0.7)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(80, 150, 255, 0.8)';
      ctx.fillRect(2, 4, 6, 1); ctx.fillRect(9, 10, 5, 1);
    },
    lava: function(ctx) {
      ctx.fillStyle = '#e85d04';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffba08';
      ctx.fillRect(3, 3, 4, 3); ctx.fillRect(9, 8, 5, 4);
    },
    cactus_side: function(ctx) {
      ctx.fillStyle = '#1b7a2b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#0e4a18';
      ctx.fillRect(3, 0, 2, 16); ctx.fillRect(11, 0, 2, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, 4, 1, 1); ctx.fillRect(7, 8, 1, 1); ctx.fillRect(14, 12, 1, 1);
    }
  };

  // Item icon pixel art generator
  const itemDrawers = {
    stick: function(ctx) {
      ctx.fillStyle = '#674d2f';
      for (let i = 2; i < 14; i++) ctx.fillRect(15 - i, i, 2, 2);
    },
    coal: function(ctx) {
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath(); ctx.arc(8, 8, 5, 0, Math.PI * 2); ctx.fill();
    },
    iron_ingot: function(ctx) {
      ctx.fillStyle = '#d8af93';
      ctx.fillRect(3, 6, 10, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 6, 8, 1);
    },
    gold_ingot: function(ctx) {
      ctx.fillStyle = '#fcee4b';
      ctx.fillRect(3, 6, 10, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 6, 8, 1);
    },
    diamond: function(ctx) {
      ctx.fillStyle = '#42f5e3';
      ctx.beginPath();
      ctx.moveTo(8, 2); ctx.lineTo(14, 8); ctx.lineTo(8, 14); ctx.lineTo(2, 8);
      ctx.closePath(); ctx.fill();
    },
    apple: function(ctx) {
      ctx.fillStyle = '#e62222';
      ctx.beginPath(); ctx.arc(8, 9, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5c4323'; ctx.fillRect(8, 3, 1, 3);
    },
    bread: function(ctx) {
      ctx.fillStyle = '#9e6727';
      ctx.fillRect(3, 6, 10, 5);
      ctx.fillStyle = '#bd8744'; ctx.fillRect(4, 5, 8, 2);
    },
    sword: function(ctx, color) {
      ctx.fillStyle = color;
      for (let i = 3; i < 12; i++) ctx.fillRect(15 - i, i, 2, 2);
      ctx.fillStyle = '#674d2f';
      ctx.fillRect(3, 12, 2, 2);
      ctx.fillStyle = '#3a2714'; ctx.fillRect(2, 11, 4, 1); ctx.fillRect(4, 13, 1, 2);
    },
    pickaxe: function(ctx, color) {
      ctx.fillStyle = color;
      ctx.fillRect(3, 3, 10, 3);
      ctx.fillStyle = '#674d2f';
      for (let i = 5; i < 14; i++) ctx.fillRect(18 - i, i, 2, 2);
    },
    axe: function(ctx, color) {
      ctx.fillStyle = color;
      ctx.fillRect(8, 2, 5, 5);
      ctx.fillStyle = '#674d2f';
      for (let i = 4; i < 14; i++) ctx.fillRect(16 - i, i, 2, 2);
    },
    shovel: function(ctx, color) {
      ctx.fillStyle = color;
      ctx.fillRect(10, 2, 4, 4);
      ctx.fillStyle = '#674d2f';
      for (let i = 5; i < 14; i++) ctx.fillRect(16 - i, i, 2, 2);
    }
  };

  Textures.getCanvas = function(name) {
    if (cache[name]) return cache[name];
    if (blockDrawers[name]) {
      cache[name] = generateCanvasTexture(blockDrawers[name]);
      return cache[name];
    }
    // Fallback drawer
    cache[name] = generateCanvasTexture(function(ctx) {
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 8, 8); ctx.fillRect(8, 8, 8, 8);
    });
    return cache[name];
  };

  Textures.getThreeTexture = function(name) {
    if (threeTextures[name]) return threeTextures[name];
    const canvas = Textures.getCanvas(name);
    threeTextures[name] = canvasToThreeTexture(canvas);
    return threeTextures[name];
  };

  Textures.getItemDataURL = function(id) {
    if (itemCanvasCache[id]) return itemCanvasCache[id];
    const canvas = generateCanvasTexture(function(ctx) {
      if (id.includes('sword')) itemDrawers.sword(ctx, getColorForMaterial(id));
      else if (id.includes('pickaxe')) itemDrawers.pickaxe(ctx, getColorForMaterial(id));
      else if (id.includes('axe')) itemDrawers.axe(ctx, getColorForMaterial(id));
      else if (id.includes('shovel')) itemDrawers.shovel(ctx, getColorForMaterial(id));
      else if (itemDrawers[id]) itemDrawers[id](ctx);
      else {
        // Render block texture into item icon
        const bCanvas = Textures.getCanvas(id);
        ctx.drawImage(bCanvas, 0, 0);
      }
    });
    itemCanvasCache[id] = canvas.toDataURL();
    return itemCanvasCache[id];
  };

  function getColorForMaterial(id) {
    if (id.startsWith('wood')) return '#9e7949';
    if (id.startsWith('stone')) return '#808080';
    if (id.startsWith('iron')) return '#d8af93';
    if (id.startsWith('gold')) return '#fcee4b';
    if (id.startsWith('diamond')) return '#42f5e3';
    return '#ffffff';
  }

  window.Textures = Textures;
})();

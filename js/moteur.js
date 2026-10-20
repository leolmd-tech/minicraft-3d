// Module js/moteur.js
(function() {
  const Moteur = {};

  let scene, camera, renderer;
  let loadedChunks = {};
  let materialsMap = {};
  let renderDistance = 4;
  let raycaster = new THREE.Raycaster();
  let clock = new THREE.Clock();

  Moteur.init = function(container) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.015);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    initMaterials();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 150, 50);
    scene.add(dirLight);

    window.addEventListener('resize', onWindowResize);
  };

  function initMaterials() {
    const grassTex = window.Textures.getThreeTexture('grass_top');
    materialsMap['default'] = new THREE.MeshLambertMaterial({ map: grassTex });
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  Moteur.getBlockAt = function(wx, wy, wz) {
    const cx = Math.floor(wx / 16);
    const cz = Math.floor(wz / 16);
    const key = `${cx},${cz}`;
    const chunk = loadedChunks[key];
    if (!chunk) return 0;

    let lx = Math.floor(wx - cx * 16);
    let lz = Math.floor(wz - cz * 16);
    if (lx < 0) lx += 16;
    if (lz < 0) lz += 16;

    return chunk.getBlock(lx, Math.floor(wy), lz);
  };

  Moteur.setBlockAt = function(wx, wy, wz, id) {
    const cx = Math.floor(wx / 16);
    const cz = Math.floor(wz / 16);
    const key = `${cx},${cz}`;
    const chunk = loadedChunks[key];
    if (!chunk) return;

    let lx = Math.floor(wx - cx * 16);
    let lz = Math.floor(wz - cz * 16);
    if (lx < 0) lx += 16;
    if (lz < 0) lz += 16;

    chunk.setBlock(lx, Math.floor(wy), lz, id);
    chunk.buildMesh(scene, materialsMap);
  };

  Moteur.raycastBlock = function() {
    if (!camera || !scene) return null;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const meshes = [];
    Object.values(loadedChunks).forEach(c => { if (c.mesh) meshes.push(c.mesh); });

    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0 && intersects[0].distance <= 5.0) {
      const hit = intersects[0];
      const norm = hit.face.normal;

      const p = hit.point.clone().sub(norm.clone().multiplyScalar(0.01));
      const bx = Math.floor(p.x);
      const by = Math.floor(p.y);
      const bz = Math.floor(p.z);

      const px = Math.floor(p.x + norm.x * 0.99);
      const py = Math.floor(p.y + norm.y * 0.99);
      const pz = Math.floor(p.z + norm.z * 0.99);

      return {
        blockPos: { x: bx, y: by, z: bz },
        placePos: { x: px, y: py, z: pz },
        distance: hit.distance
      };
    }
    return null;
  };

  Moteur.updateChunksAround = function(playerX, playerZ) {
    const centerChunkX = Math.floor(playerX / 16);
    const centerChunkZ = Math.floor(playerZ / 16);

    for (let x = centerChunkX - renderDistance; x <= centerChunkX + renderDistance; x++) {
      for (let z = centerChunkZ - renderDistance; z <= centerChunkZ + renderDistance; z++) {
        const key = `${x},${z}`;
        if (!loadedChunks[key]) {
          const chunk = new window.Chunks.Chunk(x, z);
          chunk.generateTerrain();
          chunk.buildMesh(scene, materialsMap);
          loadedChunks[key] = chunk;
        }
      }
    }
  };

  Moteur.setRenderDistance = function(dist) { renderDistance = dist; };
  Moteur.getScene = function() { return scene; };
  Moteur.getCamera = function() { return camera; };
  Moteur.getRenderer = function() { return renderer; };
  Moteur.getLoadedChunks = function() { return loadedChunks; };

  window.Moteur = Moteur;

  window.startGame = function(isLoad) {
    const container = document.getElementById('game-container');
    Moteur.init(container);

    if (window.Biomes) window.Biomes.setSeed(1337);
    if (window.Inventaire) window.Inventaire.init();
    if (window.UI) window.UI.init();
    if (window.Meteo) window.Meteo.init(Moteur.getScene());

    let spawnX = 0, spawnZ = 0;
    let spawnY = window.Biomes ? window.Biomes.getHeightAt(spawnX, spawnZ) + 2 : 80;

    if (isLoad && window.Sauvegarde) {
      const data = window.Sauvegarde.loadSave();
      if (data && data.player) {
        spawnX = data.player.x;
        spawnY = data.player.y;
        spawnZ = data.player.z;
      }
    }

    if (window.Joueur) {
      window.Joueur.init(new THREE.Vector3(spawnX, spawnY, spawnZ));
    }

    if (window.Controles) {
      window.Controles.init(renderer.domElement, Moteur.getCamera());
    }

    if (window.Mobs) {
      window.Mobs.spawnMob('cow', new THREE.Vector3(spawnX + 3, spawnY, spawnZ + 3), Moteur.getScene());
    }

    window.addEventListener('mousedown', (e) => {
      if (!renderer || document.pointerLockElement !== renderer.domElement) return;

      const ray = Moteur.raycastBlock();
      if (!ray) return;

      if (e.button === 0) {
        const b = Moteur.getBlockAt(ray.blockPos.x, ray.blockPos.y, ray.blockPos.z);
        if (b && b !== window.Biomes.BLOCK.BEDROCK) {
          Moteur.setBlockAt(ray.blockPos.x, ray.blockPos.y, ray.blockPos.z, window.Biomes.BLOCK.AIR);
          if (window.AudioEngine) window.AudioEngine.playBreak();
          if (window.Inventaire) window.Inventaire.addItem('stone', 1);
          if (window.Succes) window.Succes.unlock('first_block', 'Premier bloc', 'Vous avez miné votre premier bloc !');
        }
      } else if (e.button === 2) {
        const held = window.Inventaire ? window.Inventaire.getHeldItem() : null;
        if (held && held.id === 'wood') {
          Moteur.setBlockAt(ray.placePos.x, ray.placePos.y, ray.placePos.z, window.Biomes.BLOCK.WOOD);
          if (window.AudioEngine) window.AudioEngine.playPlace();
          if (window.Inventaire) window.Inventaire.removeHeldItem(1);
        } else if (held && held.id === 'stone') {
          Moteur.setBlockAt(ray.placePos.x, ray.placePos.y, ray.placePos.z, window.Biomes.BLOCK.STONE);
          if (window.AudioEngine) window.AudioEngine.playPlace();
          if (window.Inventaire) window.Inventaire.removeHeldItem(1);
        }
      }
      if (window.UI) window.UI.updateHotbar();
    });

    setInterval(() => {
      if (window.Sauvegarde) window.Sauvegarde.saveGame();
    }, 30000);

    animate();
  };

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const camera = Moteur.getCamera();
    const scene = Moteur.getScene();
    const rendererInstance = Moteur.getRenderer();

    if (!rendererInstance || !scene || !camera) return;

    if (window.Joueur) {
      window.Joueur.update(delta, camera, Moteur.getBlockAt);
      Moteur.updateChunksAround(window.Joueur.position.x, window.Joueur.position.z);
    }

    if (window.Meteo) {
      window.Meteo.update(delta, scene);
    }

    if (window.Mobs) {
      window.Mobs.updateAll(delta, window.Joueur ? window.Joueur.position : new THREE.Vector3(), scene);
    }

    rendererInstance.render(scene, camera);
  }
})();

// Module js/mobs.js
(function() {
  const Mobs = {};

  const activeMobs = [];

  function Mob(type, pos) {
    this.type = type; // 'cow', 'zombie', 'skeleton', 'creeper'
    this.mesh = null;
    this.position = pos.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.health = type === 'zombie' ? 20 : (type === 'creeper' ? 20 : 10);
    this.isHostile = (type === 'zombie' || type === 'skeleton' || type === 'creeper');
    this.fuseTimer = 0;
  }

  Mob.prototype.createMesh = function(scene) {
    const geo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    let color = 0x00ff00;
    if (this.type === 'cow') color = 0x8b4513;
    if (this.type === 'zombie') color = 0x2e8b57;
    if (this.type === 'skeleton') color = 0xdcdcdc;
    if (this.type === 'creeper') color = 0x32cd32;

    const mat = new THREE.MeshLambertMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  };

  Mob.prototype.update = function(delta, playerPos, scene) {
    if (!this.mesh) return;

    const dist = this.position.distanceTo(playerPos);

    if (this.isHostile && dist < 16) {
      // Move towards player
      const dir = playerPos.clone().sub(this.position).normalize();
      this.velocity.x = dir.x * 2.5;
      this.velocity.z = dir.z * 2.5;

      if (this.type === 'creeper' && dist < 3.0) {
        this.fuseTimer += delta;
        if (window.AudioEngine && this.fuseTimer === delta) {
          window.AudioEngine.playCreeperHiss();
        }
        if (this.fuseTimer >= 1.5) {
          // Explode
          if (window.AudioEngine) window.AudioEngine.playExplosion();
          if (window.Joueur) window.Joueur.takeDamage(15, "Explosé par un Creeper !");
          this.health = 0; // Destroy creeper
        }
      }
    } else {
      // Random wandering
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }

    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.mesh.position.copy(this.position);
  };

  Mobs.spawnMob = function(type, pos, scene) {
    const mob = new Mob(type, pos);
    mob.createMesh(scene);
    activeMobs.push(mob);
    return mob;
  };

  Mobs.updateAll = function(delta, playerPos, scene) {
    for (let i = activeMobs.length - 1; i >= 0; i--) {
      const m = activeMobs[i];
      m.update(delta, playerPos, scene);
      if (m.health <= 0) {
        if (m.mesh) scene.remove(m.mesh);
        activeMobs.splice(i, 1);
      }
    }
  };

  Mobs.getActiveMobs = function() { return activeMobs; };

  window.Mobs = Mobs;
})();

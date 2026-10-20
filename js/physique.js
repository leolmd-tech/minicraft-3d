// Module js/physique.js
(function() {
  const Physique = {};

  // Simple AABB Bounding Box collision checker with voxel terrain
  Physique.checkCollision = function(pos, width, height, getBlockFn) {
    const minX = Math.floor(pos.x - width / 2);
    const maxX = Math.floor(pos.x + width / 2);
    const minY = Math.floor(pos.y);
    const maxY = Math.floor(pos.y + height);
    const minZ = Math.floor(pos.z - width / 2);
    const maxZ = Math.floor(pos.z + width / 2);

    const B = window.Biomes ? window.Biomes.BLOCK : {};

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = getBlockFn(x, y, z);
          // Solid blocks collide
          if (block && block !== B.AIR && block !== B.WATER && block !== B.TALL_GRASS && block !== B.FLOWER_RED && block !== B.FLOWER_YELLOW) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Update position with velocity & axis separation for fluid movement
  Physique.applyPhysics = function(entity, delta, getBlockFn) {
    const width = entity.width || 0.6;
    const height = entity.height || 1.8;

    // Apply gravity
    if (!entity.isFlying && !entity.inWater) {
      entity.velocity.y -= 28.0 * delta;
    }

    // Move X
    entity.position.x += entity.velocity.x * delta;
    if (Physique.checkCollision(entity.position, width, height, getBlockFn)) {
      entity.position.x -= entity.velocity.x * delta;
      entity.velocity.x = 0;
    }

    // Move Z
    entity.position.z += entity.velocity.z * delta;
    if (Physique.checkCollision(entity.position, width, height, getBlockFn)) {
      entity.position.z -= entity.velocity.z * delta;
      entity.velocity.z = 0;
    }

    // Move Y
    entity.position.y += entity.velocity.y * delta;
    entity.isGrounded = false;
    if (Physique.checkCollision(entity.position, width, height, getBlockFn)) {
      if (entity.velocity.y < 0) {
        entity.isGrounded = true;
      }
      entity.position.y -= entity.velocity.y * delta;
      entity.velocity.y = 0;
    }
  };

  window.Physique = Physique;
})();

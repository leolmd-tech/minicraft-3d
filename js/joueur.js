// Module js/joueur.js
(function() {
  const Joueur = {};

  Joueur.position = new THREE.Vector3(0, 80, 0);
  Joueur.velocity = new THREE.Vector3(0, 0, 0);
  Joueur.width = 0.6;
  Joueur.height = 1.8;
  Joueur.isGrounded = false;
  Joueur.isFlying = false;

  Joueur.health = 20; // 10 hearts
  Joueur.hunger = 20; // 10 hunger points
  Joueur.air = 300;   // Drowning air bubbles
  Joueur.xp = 0;
  Joueur.level = 0;

  Joueur.init = function(spawnPos) {
    if (spawnPos) {
      Joueur.position.copy(spawnPos);
    }
  };

  Joueur.update = function(delta, camera, getBlockFn) {
    const moves = window.Controles.getMoveVector();
    Joueur.isFlying = window.Controles.isFlying();

    const speed = (window.Controles.isSprinting() && Joueur.hunger > 6) ? 7.0 : (window.Controles.isSneaking() ? 2.0 : 4.3);

    // Camera angle direction
    const yaw = camera.rotation.y;
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const sideX = Math.cos(yaw);
    const sideZ = -Math.sin(yaw);

    Joueur.velocity.x = (forwardX * moves.forward + sideX * moves.side) * speed;
    Joueur.velocity.z = (forwardZ * moves.forward + sideZ * moves.side) * speed;

    if (Joueur.isGrounded && window.Controles.isJumping()) {
      Joueur.velocity.y = 8.5; // Jump power
      if (window.AudioEngine) window.AudioEngine.playStep();
    }

    if (Joueur.isFlying) {
      if (window.Controles.isJumping()) Joueur.velocity.y = 6.0;
      else if (window.Controles.isSneaking()) Joueur.velocity.y = -6.0;
      else Joueur.velocity.y = 0;
    }

    // Apply physics
    window.Physique.applyPhysics(Joueur, delta, getBlockFn);

    // Align camera position to player eyes
    camera.position.set(Joueur.position.x, Joueur.position.y + 1.6, Joueur.position.z);
  };

  Joueur.takeDamage = function(amount, cause) {
    Joueur.health -= amount;
    if (window.AudioEngine) window.AudioEngine.playHurt();
    if (Joueur.health <= 0) {
      Joueur.health = 0;
      if (window.UI) window.UI.showDeathScreen(cause || "Vous n'avez pas survécu.");
    }
  };

  window.Joueur = Joueur;
})();

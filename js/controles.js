// Module js/controles.js
(function() {
  const Controles = {};

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let isJumping = false;
  let isSneaking = false;
  let isSprinting = false;
  let isFlying = false;

  let yaw = 0;
  let pitch = 0;
  let lastSpaceTime = 0;

  let isPointerLocked = false;
  let sensitivity = 0.002;

  // Touch joystick variables for mobile
  let joystickActive = false;
  let joystickVector = { x: 0, y: 0 };

  Controles.init = function(domElement, camera) {
    // Keyboard events
    document.addEventListener('keydown', (e) => onKeyDown(e));
    document.addEventListener('keyup', (e) => onKeyUp(e));

    // Pointer Lock for PC
    domElement.addEventListener('click', () => {
      if (!isPointerLocked && !document.pointerLockElement) {
        domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = (document.pointerLockElement === domElement);
    });

    document.addEventListener('mousemove', (e) => {
      if (isPointerLocked) {
        yaw -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;
        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
      }
    });

    setupMobileControls();
  };

  function onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': case 'KeyZ': moveForward = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyA': case 'KeyQ': moveLeft = true; break;
      case 'KeyD': moveRight = true; break;
      case 'ShiftLeft': case 'ShiftRight': isSprinting = true; break;
      case 'ControlLeft': case 'ControlRight': isSneaking = true; break;
      case 'Space':
        const now = performance.now();
        if (now - lastSpaceTime < 300) {
          isFlying = !isFlying;
        }
        lastSpaceTime = now;
        isJumping = true;
        break;
    }
  }

  function onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'KeyZ': moveForward = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyA': case 'KeyQ': moveLeft = false; break;
      case 'KeyD': moveRight = false; break;
      case 'ShiftLeft': case 'ShiftRight': isSprinting = false; break;
      case 'ControlLeft': case 'ControlRight': isSneaking = false; break;
      case 'Space': isJumping = false; break;
    }
  }

  function setupMobileControls() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !knob) return;

    let touchId = null;
    let startX = 0, startY = 0;

    zone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      startX = touch.clientX;
      startY = touch.clientY;
      joystickActive = true;
    });

    zone.addEventListener('touchmove', (e) => {
      if (!joystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          const touch = e.changedTouches[i];
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dist = Math.min(40, Math.sqrt(dx * dx + dy * dy));
          const angle = Math.atan2(dy, dx);

          const kx = Math.cos(angle) * dist;
          const ky = Math.sin(angle) * dist;
          knob.style.transform = `translate(${kx}px, ${ky}px)`;

          joystickVector.x = kx / 40;
          joystickVector.y = ky / 40;
        }
      }
    });

    const resetJoystick = () => {
      joystickActive = false;
      joystickVector = { x: 0, y: 0 };
      knob.style.transform = 'translate(0px, 0px)';
    };

    zone.addEventListener('touchend', resetJoystick);
    zone.addEventListener('touchcancel', resetJoystick);
  }

  Controles.getMoveVector = function() {
    let forward = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0);
    let side = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);

    if (joystickActive) {
      forward = -joystickVector.y;
      side = joystickVector.x;
    }

    return { forward, side };
  };

  Controles.isJumping = function() { return isJumping; };
  Controles.isSneaking = function() { return isSneaking; };
  Controles.isSprinting = function() { return isSprinting; };
  Controles.isFlying = function() { return isFlying; };

  Controles.setSensitivity = function(val) { sensitivity = val * 0.002; };

  window.Controles = Controles;
})();

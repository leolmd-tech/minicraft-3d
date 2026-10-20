// Module js/meteo.js
(function() {
  const Meteo = {};

  let dayTime = 0; // 0 to 1 (15 min cycle)
  let weather = 'clear'; // 'clear', 'rain', 'thunder', 'snow'
  let sunLight, moonLight, skyMesh;

  Meteo.init = function(scene) {
    sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(sunLight);

    moonLight = new THREE.DirectionalLight(0x445588, 0.2);
    scene.add(moonLight);
  };

  Meteo.update = function(delta, scene) {
    dayTime = (dayTime + delta / (15 * 60)) % 1; // 15 min cycle

    const angle = dayTime * Math.PI * 2;
    sunLight.position.set(Math.cos(angle) * 300, Math.sin(angle) * 300, 100);
    moonLight.position.set(-Math.cos(angle) * 300, -Math.sin(angle) * 300, -100);

    // Sky color transition
    if (Math.sin(angle) > 0) {
      scene.background.setHSL(0.6, 0.5, 0.6 * Math.sin(angle));
    } else {
      scene.background.setHSL(0.6, 0.8, 0.05); // Night sky
    }
  };

  Meteo.getTime = function() { return dayTime; };
  Meteo.setTime = function(t) { dayTime = t; };
  Meteo.getWeather = function() { return weather; };
  Meteo.setWeather = function(w) { weather = w; };

  window.Meteo = Meteo;
})();

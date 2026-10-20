// Module js/fours.js
(function() {
  const Fours = {};

  const recipes = {
    'ore_iron': { result: 'iron_ingot', cookTime: 10 },
    'ore_gold': { result: 'gold_ingot', cookTime: 10 },
    'sand': { result: 'glass', cookTime: 8 },
    'cobblestone': { result: 'stone', cookTime: 8 }
  };

  const fuels = {
    'coal': 80,
    'wood': 15,
    'planks': 15,
    'stick': 5
  };

  Fours.getSmeltingResult = function(inputId) {
    return recipes[inputId] || null;
  };

  Fours.getFuelBurnTime = function(fuelId) {
    return fuels[fuelId] || 0;
  };

  window.Fours = Fours;
})();

// Module js/craft.js
(function() {
  const Craft = {};

  // Recipes list
  const recipes = [
    { result: 'planks', count: 4, grid: [['wood']] },
    { result: 'stick', count: 4, grid: [['planks'], ['planks']] },
    { result: 'crafting_table', count: 1, grid: [['planks', 'planks'], ['planks', 'planks']] },
    { result: 'torch', count: 4, grid: [['coal'], ['stick']] },
    { result: 'wooden_pickaxe', count: 1, grid: [['planks', 'planks', 'planks'], [null, 'stick', null], [null, 'stick', null]] },
    { result: 'stone_pickaxe', count: 1, grid: [['cobblestone', 'cobblestone', 'cobblestone'], [null, 'stick', null], [null, 'stick', null]] },
    { result: 'iron_pickaxe', count: 1, grid: [['iron_ingot', 'iron_ingot', 'iron_ingot'], [null, 'stick', null], [null, 'stick', null]] },
    { result: 'furnace', count: 1, grid: [['cobblestone', 'cobblestone', 'cobblestone'], ['cobblestone', null, 'cobblestone'], ['cobblestone', 'cobblestone', 'cobblestone']] },
    { result: 'chest', count: 1, grid: [['planks', 'planks', 'planks'], ['planks', null, 'planks'], ['planks', 'planks', 'planks']] },
    { result: 'tnt', count: 1, grid: [['sand', 'gunpowder', 'sand'], ['gunpowder', 'sand', 'gunpowder'], ['sand', 'gunpowder', 'sand']] },
    { result: 'bread', count: 1, grid: [['wheat', 'wheat', 'wheat']] }
  ];

  Craft.checkRecipe = function(gridArray, size) {
    // gridArray is size*size array of item IDs or null
    for (let r of recipes) {
      if (matches(gridArray, size, r.grid)) {
        return { id: r.result, count: r.count };
      }
    }
    return null;
  };

  function matches(gridArray, size, pattern) {
    const pRows = pattern.length;
    const pCols = pattern[0].length;

    if (pRows > size || pCols > size) return false;

    for (let rOffset = 0; rOffset <= size - pRows; rOffset++) {
      for (let cOffset = 0; cOffset <= size - pCols; cOffset++) {
        let match = true;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const gridItem = gridArray[r * size + c];
            let expectedItem = null;
            if (r >= rOffset && r < rOffset + pRows && c >= cOffset && c < cOffset + pCols) {
              expectedItem = pattern[r - rOffset][c - cOffset];
            }
            if (gridItem !== expectedItem) {
              match = false;
              break;
            }
          }
          if (!match) break;
        }
        if (match) return true;
      }
    }
    return false;
  }

  Craft.getRecipesList = function() { return recipes; };

  window.Craft = Craft;
})();

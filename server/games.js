import { registerGame } from '../src/shared/game.js';
import { createArena, stepArena, resultArena } from '../src/games/arena/model.js';
import { createPuzzles, stepPuzzles, resultPuzzles } from '../src/games/puzzles/model.js';
import { createRace, stepRace, resultRace } from '../src/games/race/model.js';
import { createTower, stepTower, resultTower } from '../src/games/tower/model.js';

registerGame('arena', { create: createArena, step: stepArena, result: resultArena });
registerGame('puzzles', { create: createPuzzles, step: stepPuzzles, result: resultPuzzles });
registerGame('race', { create: createRace, step: stepRace, result: resultRace });
registerGame('tower', { create: createTower, step: stepTower, result: resultTower });

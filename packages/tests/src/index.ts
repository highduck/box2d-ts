import { Main } from '@highduck/box2d-testbed';

import './liquidfun';
import './tests';
import './controller';

import { g_testEntries } from './test';

let app: Main;
const init = function (time: number) {
  app = new Main(time, g_testEntries);
  window.requestAnimationFrame(loop);
};
const loop = function (time: number) {
  window.requestAnimationFrame(loop);
  app.SimulationLoop(time);
};
window.requestAnimationFrame(init);

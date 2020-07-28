import {Main} from "@highduck/box2d-testbed";
import {g_testEntries} from "./TestEntries";

let app: Main;
const init = function (time: number) {
    app = new Main(time, g_testEntries);
    window.requestAnimationFrame(loop);
}
const loop = function (time: number) {
    window.requestAnimationFrame(loop);
    app.SimulationLoop(time);
}
window.requestAnimationFrame(init);
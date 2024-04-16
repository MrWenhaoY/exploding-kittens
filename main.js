import {Game} from "./game.js";
import { DumbBot } from "./bots.js";
import * as c from "./calculations.js";
import {winChanceDP} from "./Notes/1-skip.js";
//import {fs} from "fs"; // Need to get fs though

/*let a = winChanceDP(10, 0);
const b = {};
a.forEach((arr, i) => {
    const x = {};
    arr.forEach((obj, j) => x[j] = obj);
    b[i] = x;
});*/

console.log(JSON.stringify(b));

window.calc = c;
window.winChance = winChanceDP;

const p0 = document.getElementById("p0-cards");
//console.log('p0 is:', p0);
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("deck")

const game = new Game(p0, p1, table);
const dumbBot = new DumbBot(game, 0, 500);
const dumb2 = new DumbBot(game, 1, 500);//
window.game = game;
game.turnHandlers.forEach(x => x(game));

// Figure out a way to wait for player input
import {Game} from "./game.js";
import { DumbBot, SkipBot, NullBot } from "./bots.js";
import * as c from "./calculations.js";
import {winChanceDP} from "./Notes/1-skip.js";
//import {fs} from "fs"; // Need to get fs though

/*let a = winChanceDP(10, 0);
const b = {};
a.forEach((arr, i) => {
    const x = {};
    arr.forEach((obj, j) => x[j] = obj);
    b[i] = x;
});

console.log(JSON.stringify(b));*/

window.calc = c;
window.winChance = winChanceDP;

const p0 = document.getElementById("p0-cards");
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("deck")

window.records = [];



function recordGame(delay=0) {
    const game = new Game(p0, p1, table, false, false);
    const dumbBot = new SkipBot(game, 0, -1);
    const dumb2 = new NullBot(game, 1, -1);//
    window.game = game;
    game.gameEndHandlers.push(x => {
        window.records.push(x.winner);
        if (window.records.length > 99990) console.log(window.records);
    })
    game.turnHandlers.forEach(x => x(game));
}

// Doing 10000 runs of the game with just 9 skips and 1 kitten
for (let i = 0; i < 100000; i++) recordGame(0);


// Figure out a way to wait for player input
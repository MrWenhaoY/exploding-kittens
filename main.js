import {Game} from "./game.js";
import { DumbBot, SkipBot, NullBot } from "./bots.js";
import * as c from "./calculations.js";
import {winChanceDP} from "./Notes/1.2-skip-optimal.js";
//import {fs} from "fs"; // Need to get fs though


function modJSON(obj, dim) {
    // Base case with dim=1
    if (dim === 1) {
        for (let key in obj) {
            obj[key] = JSON.stringify(obj[key]);
        }
        return obj;
    }
    for (let key in obj) {
        obj[key] = modJSON(obj[key], dim-1);
    }
    return obj;
}

//console.log(JSON.stringify(modJSON(winChanceDP(10), 3)));


window.calc = c;
window.winChance = winChanceDP;

const p0 = document.getElementById("p0-cards");
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("table");



function runSim(bot1, bot2, trials=1000) {
    const records = [];
    window.records = records;
    for (let i = 0; i < trials; i++) {
        const game = new Game(p0, p1, table, false, false);
        const dumbBot = new bot1(game, 0, -1);
        const dumb2 = new bot2(game, 1, -1);//
        window.game = game;
        game.gameEndHandlers.push(x => {
            window.records.push(x.winner);
            if (window.records.length === trials) console.log(window.records);
        })
        game.turnHandlers.forEach(x => x(game));
    }
}

const game = new Game(p0, p1, table);
const dumbBot = new DumbBot(game, 0, 500);
const dumbBot2 = new DumbBot(game, 1, 500);
window.game = game;
game.turnHandlers.forEach(x => x(game));
// Doing 10000 runs of the game with just 9 skips and 1 kitten
//runSim(10000);


// Figure out a way to wait for player input
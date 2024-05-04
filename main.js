import {Game} from "./game.js";
import * as Bots from "./bots.js";
import * as c from "./calculations.js";
import {results, getResult} from "./Notes/1.4-skip-defuse.js";
import {DP_13Bot} from "./Notes/1.3-skip-optimal+defuse.js";
//import {fs} from "fs"; // Need to get fs though

// WARNING: Modifies input!!!
window.modJSON = function modJSON(obj, dim) {
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
window.getResult = getResult;
window.results = results;

const p0 = document.getElementById("p0-cards");
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("table");



function runSim(bot1, bot2, trials=1000, deck={}) {
    const records = [];
    window.records = records;
    for (let i = 0; i < trials; i++) {
        const game = new Game(p0, p1, table, {render: false, logs: false, deck});
        const dumbBot = new bot1(game, 0, -1);
        const dumb2 = new bot2(game, 1, -1);//
        window.game = game;
        game.handlers.end.push(x => {
            window.records.push(x.winner);
            if (window.records.length === trials) console.log(window.records);
        })
        game.handlers.turn.forEach(x => x(game));
    }
}

const game = new Game(p0, p1, table);
const bot1 = new Bots.DumbBot(game, 0, 700);
const bot2 = new DP_13Bot(game, 1, 700);
window.game = game;
game.handlers.turn.forEach(x => x(game));

//runSim(Bots.DPBot, Bots.SkipBot, 100000, {skip: 4});


// Figure out a way to wait for player input
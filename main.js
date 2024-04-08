import {Game} from "./game.js";
import { DumbBot } from "./dumbBot.js";
import * as c from "./calculations.js";

window.calc = c;

const p0 = document.getElementById("p0-cards");
//console.log('p0 is:', p0);
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("deck")

const game = new Game(p0, p1, table);
const dumbBot = new DumbBot(game, 0);
const dumb2 = new DumbBot(game, 1);//
window.game = game;
while(game.turn % 2 === 0 && game.winner === -1) {
    dumbBot.action();
}

// Figure out a way to wait for player input
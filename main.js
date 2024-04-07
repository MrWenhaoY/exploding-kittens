import {Game} from "./game.js";
import { action } from "./dumbBot.js";

const p0 = document.getElementById("p0-cards");
//console.log('p0 is:', p0);
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("deck")

const game = new Game(p0, p1, table);
window.game = game;

while (game.winner === -1 && game.turn % 2 == 0) {
    action(game, 0, game.players[0], game.deck.length);
}

// Figure out a way to wait for player input
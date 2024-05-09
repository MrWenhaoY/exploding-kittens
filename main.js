import {Game} from "./game.js";
import * as Bots from "./bots.js";
import {DP_13Bot} from "./Notes/1.3-skip-optimal+defuse.js"; // Optimal play in game with skips in deck, defuse in hand
import { DP_14Bot } from "./Notes/1.4-skip-defuse.js"; // Optimal play in game with skips and defuses in deck
import {DP_20Bot} from "./Notes/2.0-attack.js" // Optimal play in games with skips, defuses, attacks in deck
import {results, getResult, DP_30Bot} from "./Notes/3.0-steal-hpc.js"; // Optimal play with skips, defuses, attacks, hairypotatocats
import { verifyResults } from "./utility.js";

// For debugging
window.getResult = getResult;
window.results = results;
window.Game = Game;
window.Bots = Bots;
window.verifyResults = verifyResults;

// For rendering the website
const p0 = document.getElementById("p0-cards");
const p1 = document.getElementById("p1-cards");
const table = document.getElementById("table");
const messageDisplay = document.getElementById("notifications");

const mkNotifs = (limit) => {
    let quantity = 0;
    return (text, pid) => {
        if (++quantity > limit) messageDisplay.removeChild(messageDisplay.lastElementChild);
        const msg = document.createElement("div");
        msg.className = "notif" + String(pid);
        msg.textContent = text;
        messageDisplay.prepend(msg);
    };
}

// For running simulations
function runSim(bot1, bot2, trials=1000, deck={}, hand={}) {
    const records = [];
    window.records = records;
    for (let i = 0; i < trials; i++) {
        const game = new Game(p0, p1, table, undefined, {render: false, logs: false, deck, hand});
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

/* // Example game setup
const game = new Game(p0, p1, table, mkNotifs(5), {deck: {skip: 4, defuse: 2, attack: 4, hairypotatocat: 4}, hide0: true, hide1: true});
const bot1 = new Bots.User(game, 0, 900);
const bot2 = new DP_30Bot(game, 1, 900);*/

const game = new Game(p0, p1, table, mkNotifs(5), {deck: {skip: 4, defuse: 2, attack: 3, hairypotatocat: 0}, hide0: false, hide1: false})
const bot1 = new DP_20Bot(game, 0, 900);
const bot2 = new Bots.DumbBot(game, 1, 900);

window.game = game; // For debugging
game.handlers.turn.forEach(x => x(game)); // To start the game off if a bot goes first

// Example use of runSim
//runSim(DP_30Bot, DP_30Bot, 10000, {skip: 4, defuse: 2, attack: 4, hairypotatocat: 4}, {defuse: 1});
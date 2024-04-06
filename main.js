import {Game} from "./game.js";

const game = new Game();
window.game = game;

// Render game
const p0 = document.getElementById("p0-cards");
const p1 = document.getElementById("p1-cards");
game.render(0, p0);
game.render(1, p1);
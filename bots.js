import { objSum, zeroUndef } from "./utility.js";

export class Bot {
    constructor(game, playerId, sleepTime=200, handlers={draw: [], play: []}) {
        if (typeof handlers !== "object" || !(Array.isArray(handlers.draw)) || !(Array.isArray(handlers.play))) {
            throw new Error("Type of handler input invalid!");
        }
        
        this.game = game;
        this.playerId = playerId;

        // Turn Handler for automatic playing
        if (sleepTime < 0) {
            game.handlers.turn.push( () => {while(game.turn === this.playerId && game.winner === -1) this.action()});
        } else {
            const handler = () => {
                if (game.turn % 2 === this.playerId && game.winner === -1) {
                    const turn = game.turnCount;
                    this.action();
                    if (game.turnCount === turn && game.winner === -1) setTimeout(handler, sleepTime);
                }
            }
            game.handlers.turn.push(_ => {
                if (game.turn % 2 === this.playerId && game.winner === -1) {
                    setTimeout(handler, sleepTime)
                }
            });
        }

        handlers.draw.forEach(x => game.handlers.draw.push(x));
        handlers.play.forEach(x => game.handlers.play.push(x));
    }
    action() {
        if (this.game.turn % 2 !== this.playerId) return;
    }
}

export class NullBot extends Bot {
    action() {
        this.game.draw(this.playerId);
    }
}

export class DumbBot extends Bot {
    action() {
        if (this.game.turn % 2 !== this.playerId) return; 
        const cards = this.game.players[this.playerId];
        let handSize = objSum(cards) - cards["defuse"];
        if (zeroUndef(cards["hairypotatocat"]) < 2) handSize -= zeroUndef(cards["hairypotatocat"]);// TODO
        if (Math.random() < handSize / (handSize + this.game.deck.length - 1)) {
            Object.keys(cards).forEach(card => {
                if (card === "defuse" || (card === "hairypotatocat" && zeroUndef(cards["hairypotatocat"]) < 2)) return;
                if (Math.random() <= cards[card] / handSize) return this.game.play(this.playerId, card);
                handSize -= cards[card];
            })
        }
        return this.game.draw(this.playerId);
    }
}

export class SkipBot extends Bot {
    action() {
        if (this.game.turn % 2 !== this.playerId) return; 
        const cards = this.game.players[this.playerId];
        if (cards["skip"]) return this.game.play(this.playerId, "skip");
        else return this.game.draw(this.playerId);
    }
}

/* // This Bot does not seem to work well
export class DrawBot extends SkipBot {
    action() {
        if (this.game.turn % 2 !== this.playerId) return; 
        const selfCards = this.game.players[this.playerId];
        //if (!selfCards["defuse"]) return super.action();
        const enemyCards = this.game.players[1 - this.playerId];
        const deckSize = this.game.deck.length;
        // Assumes game with only skips and starting defuses
        
        if (selfCards["skips"] && Object.keys(selfCards).reduce((acc, e) => acc + selfCards[e], 0) 
        - Object.keys(enemyCards).reduce((acc, e) => acc + enemyCards[e], 0) > (2 * deckSize - 2))
        return this.game.play(this.playerId, "skip");
        else return this.game.draw(this.playerId);
    }
}*/

const isPlayable = name => name !== "explode" && name !== "defuse";
export class User {
    // This is for user-controls & interface
    constructor(game, playerId, _sleepTime, _handlers) {
        this.playerId = playerId;
        game.settings["hide" + String(playerId)] = false;

        const deck = document.getElementById("deck");

        let playables = [deck];
        const markPlayables = () => playables.forEach(x => x.classList[game.turn === this.playerId ? "add" : "remove"]("playable"+String(this.playerId)));

        const drawListener = () => {
            if (game.turn === this.playerId) setTimeout(() => game.draw(this.playerId), 1);
        }
        deck.addEventListener("click", drawListener)
        game.handlers.render.push((p0, p1, table) => {
            playables = [deck];
            const selfElem = playerId ? p1 : p0;
            const cards = selfElem.childNodes;
            for (let card of cards) {
                if (isPlayable(card.cardName)) {
                    playables.push(card);
                    card.addEventListener("click", () => game.play(this.playerId, card.cardName));
                }
            }
            markPlayables();
        });
        game.handlers.turn.push(markPlayables);
        game.handlers.end.push(() => {
            playables.forEach(x => x.classList.remove("playable" + String(this.playerId)));
            playables = [];
            deck.removeEventListener("click", drawListener);
        })
        game.render();
    }
}
import { getResult } from "./Notes/1.3-skip-optimal+defuse.js";

class Bot {
    constructor(game, playerId, sleepTime=200) {
        this.game = game;
        this.playerId = playerId;

        if (sleepTime < 0) {
            game.turnHandlers.push(_ => {
                while (game.turn % 2 === this.playerId && game.winner === -1) this.action();
            });
            return;
        }

        const handler = () => {
            if (game.turn % 2 === this.playerId && game.winner === -1) {
                const turn = game.turnCount;
                this.action();
                if (game.turnCount === turn && game.winner === -1) setTimeout(handler, sleepTime);
            }
        }
        game.turnHandlers.push(_ => {
            if (game.turn % 2 === this.playerId && game.winner === -1) {
                setTimeout(handler, sleepTime)
            }
        });
    }
    action() {
        if (this.game.turn % 2 !== this.playerId) return;
    }
}

export class NullBot extends Bot {
    action() {
        //delete this.game.players[this.playerId]["defuse"];
        this.game.draw(this.playerId);
    }
}

export class DumbBot extends Bot {
    action() {
        if (this.game.turn % 2 !== this.playerId) return; 
        const cards = this.game.players[this.playerId];
        let handSize = Object.keys(cards).reduce((acc, e) => acc + (e === "defuse" ? 0 : cards[e]), 0);
        if (Math.random() < handSize / (handSize + this.game.deck.length - 1)) {
            Object.keys(cards).forEach(card => {
                if (card === "defuse") return;
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
}

export class DPBot extends Bot {
    action() {
        // Assumes game with only skips and starting defuses
        // Looks at opponent's hand because I'm too lazy to calculate it but this is calculatable (given above assumption)
        if (this.game.turn % 2 !== this.playerId) return; 
        const selfHand = this.game.players[this.playerId];
        const oppHand = this.game.players[1 - this.playerId];
        const r = getResult(this.game.deck.length, selfHand["skip"] ? selfHand["skip"] : 0, oppHand["skip"] ? oppHand["skip"] : 0, selfHand["defuse"] ? selfHand["defuse"] : 0, oppHand["defuse"] ? oppHand["defuse"] : 0);
        if (r.move === "either" || r.move === "draw") return this.game.draw(this.playerId);
        else {
            if (!selfHand.skip) {
                console.log(this.game.deck.length, selfHand["skip"] ? selfHand["skip"] : 0, oppHand["skip"] ? oppHand["skip"] : 0, selfHand["defuse"] ? selfHand["defuse"] : 0, oppHand["defuse"] ? oppHand["defuse"] : 0)
                console.log(selfHand, r);
                throw new Error("Tried to play skip with no skip in hand!");
            }
            return this.game.play(this.playerId, "skip");
        }
    }
}
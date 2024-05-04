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
/*
export class DP_13Bot extends Bot {
    action() {
        // Assumes game with only skips and starting defuses
        // Looks at opponent's hand because I'm too lazy to calculate it but this is calculatable (given above assumption)
        if (this.game.turn % 2 !== this.playerId) return; 
        const selfHand = this.game.players[this.playerId];
        const oppHand = this.game.players[1 - this.playerId];
        const r = DP_13(this.game.deck.length, selfHand["skip"] ? selfHand["skip"] : 0, oppHand["skip"] ? oppHand["skip"] : 0, selfHand["defuse"] ? selfHand["defuse"] : 0, oppHand["defuse"] ? oppHand["defuse"] : 0);
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
}*/
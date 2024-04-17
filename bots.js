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
                const turn = game.turn;
                this.action();
                if (game.turn === turn && game.winner === -1) setTimeout(handler, sleepTime);
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
        this.game.draw(this.playerId);
    }
}

export class DumbBot extends Bot {
    action() {
        if (this.game.turn % 2 !== this.playerId) return; 
        const cards = this.game.players[this.playerId];
        let handSize = Object.values(cards).reduce((acc, e) => acc + e, 0);
        if (Math.random() < handSize / (handSize + game.deck.length - 1)) {
            Object.keys(cards).forEach(card => {
                if (Math.random() <= cards[card] / handSize) return this.game.play(this.playerId, card);
                handSize -= cards[card];
            })
        }
        return this.game.draw(this.playerId);
    }
}

export class SkipBot extends Bot {
    action() {
        const cards = this.game.players[this.playerId];
        if (cards["skip"]) return this.game.play(this.playerId, "skip");
        else return this.game.draw(this.playerId);
    }
}
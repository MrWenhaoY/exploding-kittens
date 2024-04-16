class Bot {
    constructor(game, playerId) {
        this.game = game;
        this.playerId = playerId;
    }
    action() {
        if (this.game.turn % 2 !== this.playerId) return;
    }
}

export class DumbBot extends Bot{
    constructor(game, playerId, sleepTime=200) {
        super(game, playerId);
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
        const cards = this.game.players[this.playerId];
        let handSize = Object.values(cards).reduce((acc, e) => acc + e, 0);
        if (Math.random() < handSize / (handSize + game.deck.length - 1)) {
            Object.keys(cards).forEach(card => {
                if (Math.random() <= cards[card] / handSize) return game.play(this.playerId, card);
                handSize -= cards[card];
            })
        }
        return game.draw(this.playerId);
    }
}
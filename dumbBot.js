export class DumbBot {
    constructor(game, playerId) {
        this.game = game;
        this.playerId = playerId;
        game.turnHandlers.push(x => {
            while(game.turn % 2 === this.playerId && game.winner === -1) {
                this.action();
            }
        });
    }
    action() {
        if (game.turn % 2 !== this.playerId) return; 
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
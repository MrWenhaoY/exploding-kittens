export function action(game, playerId, cards, deckSize) {
    if (game.turn % 2 !== playerId) return; 
    let handSize = Object.values(cards).reduce((acc, e) => acc + e, 0);
    if (Math.random() < handSize / (handSize + deckSize - 1)) {
        Object.keys(cards).forEach(card => {
            if (Math.random() <= cards[card] / handSize) return game.play(playerId, card);
            handSize -= cards[card];
        })
    }
    return game.draw(playerId);
}
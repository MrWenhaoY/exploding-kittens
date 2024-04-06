export class Game {
    constructor() {
        this.players = [{}, {}]; //{[card: string]: number}
        this.turn = 0;
        this.deck = [];
        this.discard = []; // discard pile
        this.winner = -1;

        // Create deck
        const addCard = (card, num) => {while(num-- > 0) this.deck.push(card);};
        addCard("explode", 1);
        //addCard("defuse", 2);
        addCard("skip", 4);
        // Shuffle deck
        this.shuffle();

        // Initialize starting hands
        // TODO
    }
    shuffle() {
        // There's only one thing to shuffle: the deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const temp = this.deck[i];
            const j = Math.floor(Math.random() * (i + 1));
            this.deck[i] = this.deck[j]
            this.deck[j] = temp;
        }
    }
    play(playerId, card) {
        // TODO: Implement Nopes and Defuses
        if (this.turn % 2 == playerId && players[card] > 0) {
            if (--players[card] <= 0) delete players[card];
            switch(card) {
                case "skip":
                    this.turn++;
                    break;
                default:
                    console.log("Card '" + String(card) + "' not recognized.");
            }
        }
    }
    draw(playerId) {
        if (this.turn % 2 == playerId) {
            const card = this.deck.shift();
            if (card == "explode") {
                this.winner = 1 - playerId;
                return;
            }
            const hand = this.players[playerId];
            card in hand ? hand[card]++ : hand[card] = 1;
            this.turn++;
            return card;
        }
    }
}
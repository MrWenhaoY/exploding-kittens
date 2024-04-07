export class Game {
    constructor(p0Element, p1Element, tableElement) {
        this.players = [{}, {}]; //{[card: string]: number}
        this.turn = 0;
        this.deck = [];
        this.discard = []; // discard pile
        this.winner = -1;
        //console.log('p0Element', p0Element);
        this.p0Element = p0Element;
        this.p1Element = p1Element;
        this.tableElement = tableElement;

        // Create deck
        const addCard = (card, num) => {while(num-- > 0) this.deck.push(card);};
        addCard("explode", 1);
        //addCard("defuse", 2);
        addCard("skip", 4);
        // Shuffle deck
        this.shuffle();

        // Initialize starting hands
        // TODO

        this.render();
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
            console.log("Player: " + String(playerId) + " is playing " + String(card) + ".");
            if (--players[card] <= 0) delete players[card];
            switch(card) {
                case "skip":
                    this.turn++;
                    this.render();
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
                console.log("Player: " + String(playerId) + " has exploded.");
                this.winner = 1 - playerId;
                return;
            }
            console.log("Player: " + String(playerId) + " has drawn a card.");
            const hand = this.players[playerId];
            card in hand ? hand[card]++ : hand[card] = 1;
            this.turn++;
            // Render automatically
            this.render();
            return card;
        }
    }
    render() {
        this.players.forEach((hand, id) => {
            const element = this['p'+String(id)+'Element'];
            element.innerHTML = "";
            Object.keys(hand).forEach(name => {
                for (let i = 0; i < hand[name]; i++) {
                    const card = document.createElement("img");
                    card.src = "./Assets/" + name + ".png";
                    card.classList.add("card");
                    element.appendChild(card);
                }
            });
        })
        
        const element = this.tableElement;
        element.innerHTML = "";
        const deck = document.createElement("img");
        deck.src = "./Assets/" + (this.deck.length > 0 ? "card-back" : "empty") + ".png";
        deck.classList.add("card");
        element.appendChild(deck);
        element.appendChild(document.createTextNode(this.deck.length));
        const discard = document.createElement("img");
        discard.src = "./Assets/" + (this.discard.length > 0 ? this.discard[0] : "empty") + ".png";
        discard.classList.add("card");
        element.appendChild(discard);
        element.appendChild(document.createTextNode(this.discard.length));
    }
}
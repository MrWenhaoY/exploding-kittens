import { objAdd } from "./utility.js";

export class Game {
    constructor(p0Element, p1Element, tableElement, options={}) {
        const settings = {
            render: true,
            logs: true,
            deck: {
                "skip": 4,
                "attack": 4,
                "explode": 1,
                "defuse": 2
            },
            hand: {
                "defuse": 1,
                "draw": 0
            },
            hide0: false,
            hide1: false
        };

        // Applies options to settings, modifying settings
        function applyDefaults(set, opt) {
            for (let key of Object.keys(opt)) {
                if (typeof opt[key] !== typeof set[key]) throw new Error(`Options "${key}" should be of type ${typeof set[key]} but is instead ${typeof opt[key]}`);
                if (typeof set[key] === "object") {
                    applyDefaults(set[key], opt[key]);
                } else {
                    set[key] = opt[key];
                }
            }
        }

        applyDefaults(settings, options);

        this.settings = settings;
        this.players = [{}, {}]; //{[card: string]: number}
        this.turn = 0;
        this.stackedTurns = 0;
        this.turnCount = 0;
        this.deck = [];
        this.discard = []; // discard pile
        this.discardCounts = {};
        this.winner = -1;
        this.handlers = {
            draw: [],
            play: [],
            turn: [],
            end: []
        }
        this.p0Element = p0Element;
        this.p1Element = p1Element;
        this.tableElement = tableElement;

        // Create deck
        const addCard = (card, num) => {while(num-- > 0) this.deck.push(card);};
        for (let [card, qty] of Object.entries(settings["deck"])) {
            if (card === "explode") continue;
            addCard(card, qty);
        }
        // Shuffle deck
        this.shuffle();

        // Initialize starting hands
        this.players.forEach(hand => {
            hand["defuse"] = settings.hand["defuse"];
            for (let i = 0; i < settings.hand["draw"]; i++) {
                const card = this.deck.shift();
                objAdd(hand, card);
            }
        });

        // Add exploding kitten(s)
        addCard("explode", settings.deck["explode"]);
        this.shuffle();

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
        if (this.turn % 2 == playerId && this.players[playerId][card] > 0 && this.winner === -1) {
            if (card === "defuse") {
                console.log("Defuse may not be played normally.");
                return;
            }
            if (this.settings.logs) console.log("Player " + String(playerId) + " is playing " + String(card) + ".");
            if (--this.players[playerId][card] <= 0) delete this.players[playerId][card];
            this.handlers.play.forEach(f => f(playerId, card, this));
            switch(card) {
                case "skip":
                    this.discard.unshift(card);
                    objAdd(this.discardCounts, card);
                    this.endTurn();
                    break;
                case "attack":
                    this.discard.unshift(card);
                    objAdd(this.discardCounts, card);
                    this.turn = 1 - this.turn;
                    this.stackedTurns = 2;
                    this.endTurn();
                    break;
                case "defuse":
                    // Defuse may not be played normally
                    // This statement should never be reached
                    break;
                default:
                    console.warn("Card '" + String(card) + "' not recognized.");
                    return;
            }
            
        }
    }
    draw(playerId) {
        if (this.turn % 2 == playerId && this.winner === -1) {
            const card = this.deck.shift();
            if (this.settings.logs) console.log("Player: " + String(playerId) + " has drawn a card.");
            const hand = this.players[playerId];
            objAdd(hand, card);
            this.handlers.draw.forEach(f => f(playerId, card === "explode"));
            this.render();
            if (card == "explode") {
                if ("defuse" in hand && hand["defuse"] >= 1) {
                    // Defuse the kitten
                    if (this.settings.logs) console.log("Player: " + String(playerId) + " has drawn an Exploding Kitten but defused it.");
                    // For now, Defuses put the Kitten randomly back into the deck
                    this.discard.unshift("defuse");
                    objAdd(this.discardCounts, "defuse");
                    if (--hand["defuse"] <= 0) delete hand["defuse"];
                    if (--hand["explode"] <= 0) delete hand["explode"];
                    this.handlers.play.forEach(f => f(playerId, "defuse", this));
                    this.deck.splice(Math.floor((this.deck.length + 1) * Math.random()), 0, "explode");
                } else {
                    if (this.settings.logs) console.log("Player: " + String(playerId) + " has exploded.");
                    this.endGame(1 - playerId);
                    return;
                }

                
            }
            // To let the return happen first
            //setTimeout(() => this.endTurn(), 0);
            this.endTurn();
            return card;
        }
    }
    endTurn() {
        if (this.stackedTurns > 0) this.stackedTurns--;
        else this.turn = 1 - this.turn;
        this.turnCount++;
        if (this.settings.logs) console.log("It is now Turn " + String(this.turnCount) + ", which is player " + String(this.turn) + "'s turn.");
        // To let the render happen first
        setTimeout(() => this.handlers.turn.forEach(x => x(this.turn, this)), 0);
        this.render();
    }
    endGame(winner) {
        this.winner = winner;
        this.handlers.turn = []; // Just in case
        // No need to hide now that the game's over
        this.settings.hide0 = false;
        this.settings.hide1 = false;
        this.render();
        this.handlers.end.forEach(x => x(this));
    }
    render() {
        if (!this.settings.render) return;
        this.players.forEach((hand, id) => {
            const element = this['p'+String(id)+'Element'];
            element.innerHTML = "";
            Object.keys(hand).forEach(name => {
                for (let i = 0; i < hand[name]; i++) {
                    const card = document.createElement("img");
                    card.src = "./Assets/" + (this.settings["hide" + String(id)] && name !== "explode" ? "card-back": name) + ".png";
                    card.classList.add("card");
                    element.appendChild(card);
                }
            });
        })
        
        const element = this.tableElement;
        
        //element.innerHTML = "";
        let deck = document.getElementById("deck");
        if (!deck) {
            deck = document.createElement("img");
            deck.classList.add("card");
            deck.id = "deck";
            element.appendChild(deck);
        }
        deck.src = "./Assets/" + (this.deck.length > 0 ? "card-back" : "empty") + ".png";
        
        let deckLength = document.getElementById("deckLength");
        if (!deckLength) {
            deckLength = document.createElement("span");
            deckLength.id = "deckLength";
            element.appendChild(deckLength);
        }
        deckLength.textContent = this.deck.length;
        
        let discard = document.getElementById("discard");
        if (!discard) {
            discard = document.createElement("img");
            discard.classList.add("card");
            discard.id = "discard";
            element.appendChild(discard);
        }
        discard.src = "./Assets/" + (this.discard.length > 0 ? this.discard[0] : "empty") + ".png";

        let discardLength = document.getElementById("discardLength");
        if (!discardLength) {
            discardLength = document.createElement("span");
            discardLength.id = "discardLength";
            element.appendChild(discardLength);
        }
        discardLength.textContent = this.discard.length;

        // These should always exist
        const turnNum = document.getElementById("turn");
        turnNum.textContent = this.turn;
        const turnArrow = document.getElementById("turn-direction");
        turnArrow.src = "./Assets/" + "p" + this.turn + "-turn-arrow" + ".png";
    }
}
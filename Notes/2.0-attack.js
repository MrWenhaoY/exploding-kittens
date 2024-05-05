/*
Attacks, defuses, and skips in the deck

*/

import { deepCopy, objAdd, objSum, zeroUndef } from "../utility.js";
import { Bot } from "../bots.js";

export const results = {};

function getChance(deck, ySkip, oSkip, yAttack, oAttack, yDef, oDef, dSkip, dAttack, currTurns) {
    return currTurns <= 1 ? 1 - getResult(deck, oSkip, ySkip, oAttack, yAttack, oDef, yDef, dSkip, dAttack, 1).winRate 
        : getResult(deck, ySkip, oSkip, yAttack, oAttack, yDef, oDef, dSkip, dAttack, currTurns - 1).winRate;
}

export function getResult(deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns) {
    //console.log("Called with ", deckSize, yourSkip, oppSkip, yourDefuse, oppDefuse, deckSkip);
    if (deckSize <= 0) {throw new Error("Decksize is invalid: " + deckSize);}
    const deckDef = deckSize - deckSkip - deckAttack - 1; // Should always be nonnegative
    let curr = results;
    [deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack].forEach(x => {
        if (curr[x] === undefined) {
            curr[x] = {};
        }
        curr = curr[x];
    })
    if (!curr[turns]) {
        // Uncalculated; calculate now
        if (deckSize === 1) {
            if (yourSkip < 1 && yourAttack < 1 && yourDefuse < 1) {
                curr[turns] = {winRate: 0, move: "draw", draw: 0, skip: -1, attack: -1};
            } else {
                const attack = yourAttack < 1 ? -1 : 1 - getResult(deckSize, oppSkip, yourSkip, oppAttack, yourAttack - 1, oppDefuse, yourDefuse, 0, 0, 2).winRate;
                let draw = Infinity, skip = Infinity;
                if (turns <= 1) {
                    draw = yourDefuse < 1 ? 0 : 1 - getResult(deckSize, oppSkip, yourSkip, oppAttack, yourAttack, oppDefuse, yourDefuse - 1, 0, 0, 1).winRate;
                    skip = yourSkip < 1 ? -1 : 1 - getResult(deckSize, oppSkip, yourSkip - 1, oppAttack, yourAttack, oppDefuse, yourDefuse, 0, 0, 1).winRate;
                } else {
                    draw = yourDefuse < 1 ? 0 : getResult(deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse - 1, oppDefuse, 0, 0, turns - 1).winRate;
                    skip = yourSkip < 1 ? -1 : getResult(deckSize, yourSkip - 1, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, 0, 0, turns - 1).winRate;
                }
                curr[turns] = {winRate: Math.max(attack, draw, skip), draw, skip, attack}; // Move is just whatever gives you that number
            }
        } else {
            const defDrawChance = deckDef / deckSize;
            const skipDrawChance = deckSkip / deckSize;
            const attackDrawChance = deckAttack / deckSize;
            const explodeDrawChance = 1 / deckSize;
            const draw = explodeDrawChance * (yourDefuse > 0 ? getChance(deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse - 1, oppDefuse, deckSkip, deckAttack, turns): 0) 
                + skipDrawChance * getChance(deckSize - 1, yourSkip + 1, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip - 1, deckAttack, turns)
                + defDrawChance * getChance(deckSize - 1, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse + 1, oppDefuse, deckSkip, deckAttack, turns)
                + attackDrawChance * getChance(deckSize - 1, yourSkip, oppSkip, yourAttack + 1, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack - 1, turns);
            const skip = yourSkip > 0 ? getChance(deckSize, yourSkip - 1, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack - 1, turns): -1;
            const attack = yourAttack > 0 ? 1 - getResult(deckSize, oppSkip, yourSkip, oppAttack, yourAttack - 1, oppDefuse, yourDefuse, deckSkip, deckAttack, 2).winRate: -1;

            curr[turns] = {winRate: Math.max(draw, skip, attack), draw, skip, attack};
        }
    }
    return curr[turns];
}


// There are defuses and the deck and we may not always know for certain what cards are in the opponent's hand
export class DP_20Bot extends Bot {
    constructor(game, playerId, sleepTime=200) {        
        function compDeck(d1, d2) {
            const k1 = Object.keys(d1);
            if (k1.length !== Object.keys(d2).length) return false;
            return k1.every(k => d1[k] === d2[k]);
        }
        function playHandler(playerId, card, game, t) {
            if (playerId === t.playerId) return; // We played this card
            // Update deck tracking
            //console.log("Before updating oppHand odds", t.oppHand);//
            const probs = [];
            for (let i = t.oppHand.length - 1; i >= 0; i--) {
                const hand = t.oppHand[i].hand;
                if (card in hand) {
                    // We do not analyze the probability based on the number of that card the oopponent has
                    probs.unshift(t.oppHand[i].prob);
                    if (--hand[card] === 0) delete hand[card]; // Should never be < 0
                } else {
                    // We have eliminated this possibility
                    t.deckContents.splice(i, 1);
                    t.oppHand.splice(i, 1);
                }
            }
            // Rebalance probabilities
            const sum = probs.reduce((acc, e) => acc + e, 0);
            t.oppHand.forEach((info, i) => info.prob = probs[i]/sum);
            //console.log("After updating oppHand odds", deepCopy(t.oppHand));//
        }
        function drawHandler(playerId, isExplode, t) {
            if (playerId === t.playerId) return; // This is handled later in the code
            if (isExplode) return; // This is an exploding kitten and they will defuse it immediately (or game will end and it won't matter)
            // Calculate possibilities
            //console.log("Old deck and hand", t.deckContents, t.oppHand);//
            const newDeck = [], newHand = [];
            t.deckContents.forEach((info, idx) => {
                const deck = info.deck;
                const sum = Object.keys(deck).reduce((acc, e) => e === "explode" ? acc : acc + deck[e], 0);
                Object.keys(deck).forEach(card => {
                    if (card === "explode") return;
                    const p = info.prob * deck[card] / sum;
                    const newD = {...deck};
                    if (--newD[card] <= 0) delete newD[card];
                    let found = false;
                    // Check for potential merge
                    for (let i = 0; i < newDeck.length; i++) {
                        if (compDeck(newDeck[i].deck, newD)) {
                            newDeck[i].prob += p; newHand[i].prob += p;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        newDeck.push({prob: p, deck: newD});
                        const newH = {...t.oppHand[idx].hand};
                        objAdd(newH, card);
                        newHand.push({prob: p, hand: newH});
                    }
                });
            })
            t.deckContents = newDeck;
            t.oppHand = newHand;
            //console.log("New deck and hand", deepCopy(t.deckContents), deepCopy(t.oppHand));
        };
        super(game, playerId, sleepTime, {play: [(pid, card, game) => playHandler(pid, card, game, this)], draw: [(pid, ex) => drawHandler(pid, ex, this)]});
        
        // Each deck content and hand state is associated
        this.deckContents = [{prob: 1, deck: {...game.settings.deck}}];
        this.oppHand = [{prob: 1, hand: {"defuse": game.settings.hand["defuse"]}}];
    }
    action() {
        if (this.game.turn !== this.playerId) return; 
        const selfHand = this.game.players[this.playerId];
        const selfSkip = zeroUndef(selfHand["skip"]);
        const selfDef = zeroUndef(selfHand["defuse"]);
        let evSkip = 0;
        let evDraw = 0;
        this.oppHand.forEach((info, i) => {
            const result = getResult(objSum(this.deckContents[i].deck), selfSkip, zeroUndef(info.hand["skip"]), selfDef, zeroUndef(info.hand["defuse"]), zeroUndef(this.deckContents[i].deck["skip"]));
            evSkip += info.prob * result.skip;
            evDraw += info.prob * result.draw;
        })
        if (evSkip < -1.00001) throw new Error(`Skip expected value of ${evSkip} found which is invalid.`);
        if (evDraw > 1.00001) throw new Error(`Expected value of drawing exceeds 1 (is ${evDraw})`);
        if (evDraw > evSkip) {
            const card = this.game.draw(this.playerId);
            if (card === "explode") return; // We will either defuse it or die
            // Update deck tracking
            const probs = [];
            for (let i = this.deckContents.length - 1; i >= 0; i--) {
                const deck = this.deckContents[i].deck;
                if (card in deck) {
                    // Each possibility should have the same deckSize
                    probs.unshift( this.deckContents[i].prob * deck[card] /  Object.keys(deck).reduce((sum, key) => sum +deck[key], 0));
                    if (--deck[card] === 0) delete deck[card]; // Should never be < 0
                } else {
                    // We have eliminated this possibility
                    this.deckContents.splice(i, 1);
                    this.oppHand.splice(i, 1);
                }
            }
            // Rebalance probabilities
            const sum = probs.reduce((acc, e) => acc + e, 0);
            //console.log("Before rebalancing", deepCopy(this.deckContents));//
            this.deckContents.forEach((info, i) => {info.prob = probs[i]/sum; this.oppHand[i].prob = probs[i]/sum;});
            //console.log("After rebalancing", deepCopy(this.deckContents));//
        }
        else {
            if (!selfHand.skip) {
                console.log(this.game.deck.length, game);
                console.log(selfHand, r);
                throw new Error("Tried to play skip with no skip in hand!");
            }
            return this.game.play(this.playerId, "skip");
        }
    }
}
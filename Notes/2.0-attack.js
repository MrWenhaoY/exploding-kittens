/*
Attacks, defuses, and skips in the deck

*/

import { deepCopy, objAdd, objComp, objSum, zeroUndef } from "../utility.js";
import { Bot } from "../bots.js";

export const results = {};

function getChance(deck, ySkip, oSkip, yAttack, oAttack, yDef, oDef, dSkip, dAttack, currTurns) {
    return currTurns <= 1 ? 1 - getResult(deck, oSkip, ySkip, oAttack, yAttack, oDef, yDef, dSkip, dAttack, 1).winRate 
        : getResult(deck, ySkip, oSkip, yAttack, oAttack, yDef, oDef, dSkip, dAttack, currTurns - 1).winRate;
}

export function getResult(deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns) {
    //console.log("Called with ", deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns);
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
            if (deckSkip !== 0 || deckAttack !== 0) throw new Error(`Invalid deckSkip ${deckSkip} and deckAttack ${deckAttack} values`);
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

            let draw = explodeDrawChance * (yourDefuse > 0 ? getChance(deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse - 1, oppDefuse, deckSkip, deckAttack, turns): 0);
            if (skipDrawChance > 0) draw += skipDrawChance * getChance(deckSize - 1, yourSkip + 1, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip - 1, deckAttack, turns);
            if (attackDrawChance > 0) draw += attackDrawChance * getChance(deckSize - 1, yourSkip, oppSkip, yourAttack + 1, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack - 1, turns)
            if (defDrawChance > 0) draw += defDrawChance * getChance(deckSize - 1, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse + 1, oppDefuse, deckSkip, deckAttack, turns);
            const skip = yourSkip > 0 ? getChance(deckSize, yourSkip - 1, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns): -1;
            const attack = yourAttack > 0 ? 1 - getResult(deckSize, oppSkip, yourSkip, oppAttack, yourAttack - 1, oppDefuse, yourDefuse, deckSkip, deckAttack, 2).winRate: -1;
            
            if (Math.max(draw, skip, attack) > 1.000001 || Math.min(draw, skip, attack) < -1.000001) {
                console.warn("Called with ", deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns);
                throw new Error(`Winrates > 1: draw: ${draw}, skip: ${skip}, attack: ${attack}`);
            }
            curr[turns] = {winRate: Math.max(draw, skip, attack), draw, skip, attack};
        }
    }
    if (curr[turns.winRate < 0]) throw new Error(`Winrate < 0! ${curr[turns].winRate}`);
    return curr[turns];
}


// There are defuses and the deck and we may not always know for certain what cards are in the opponent's hand
export class DP_20Bot extends Bot {
    constructor(game, playerId, sleepTime=200) {
        function playHandler(playerId, card, _game, self) {
            if (playerId === self.playerId) return; // We played this card
            // Update deck tracking
            //console.log("Before updating odds", deepCopy(self.poss));//
            const probs = [];
            for (let i = self.poss.length - 1; i >= 0; i--) {
                const hand = self.poss[i].hand;
                if (card in hand) {
                    // We do not analyze the probability based on the number of thes card the opponent has
                    probs.unshift(self.poss[i].prob);
                    if (--hand[card] === 0) delete hand[card]; // Should never be < 0
                } else {
                    // We have eliminated this possibility
                    self.poss.splice(i, 1);
                }
            }
            // Rebalance probabilities
            const sum = probs.reduce((acc, e) => acc + e, 0);
            self.poss.forEach((info, i) => info.prob = probs[i]/sum);
            //console.log("After updating odds", deepCopy(self.poss));//
        }
        function drawHandler(playerId, isExplode, self) {
            if (playerId === self.playerId) return; // This is handled later in the code
            if (isExplode) return; // This is an exploding kitten and they will defuse it immediately (or game will end and it won't matter)
            // Calculate possibilities
            //console.log("Old poss", self.poss);//
            const newPoss = [];
            self.poss.forEach((info, idx) => {
                const deck = info.deck;
                const sum = objSum(deck) - deck["explode"]; //Object.keys(deck).reduce((acc, e) => e === "explode" ? acc : acc + deck[e], 0);
                Object.keys(deck).forEach(card => {
                    if (card === "explode") return;
                    const p = info.prob * deck[card] / sum;
                    const newD = {...deck};
                    if (--newD[card] <= 0) delete newD[card];
                    let found = false;
                    // Check for potential merge
                    for (let i = 0; i < newPoss.length; i++) {
                        if (objComp(newPoss[i].deck, newD)) {
                            newPoss[i].prob += p;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        const newH = {...self.poss[idx].hand};
                        objAdd(newH, card);
                        newPoss.push({prob: p, deck: newD, hand: newH});
                    }
                });
            })
            self.poss = newPoss;
            //console.log("New poss", deepCopy(self.poss));
        };
        super(game, playerId, sleepTime, {play: [(pid, card, game) => playHandler(pid, card, game, this)], draw: [(pid, ex) => drawHandler(pid, ex, this)]});
        
        // Each deck content and hand state is associated
        this.poss = [{prob: 1, deck: {...game.settings.deck}, hand: {"defuse": game.settings.hand["defuse"]}}];
    }
    action() {
        if (this.game.turn !== this.playerId) return; 
        const myHand = this.game.players[this.playerId];
        const mySkip = zeroUndef(myHand["skip"]);
        const myDef = zeroUndef(myHand["defuse"]);
        const myAttack = zeroUndef(myHand["attack"]);
        let evSkip = 0;
        let evDraw = 0;
        let evAttack = 0;
        this.poss.forEach((info, i) => {
            const result = getResult(objSum(info.deck), mySkip, zeroUndef(info.hand["skip"]), myAttack, zeroUndef(info.hand["attack"]), myDef, zeroUndef(info.hand["defuse"]), zeroUndef(info.deck["skip"]), zeroUndef(info.deck["attack"]), game.stackedTurns + 1);
            //console.log(objSum(info.deck), mySkip, zeroUndef(info.hand["skip"]), myAttack, zeroUndef(info.hand["attack"]), myDef, zeroUndef(info.hand["defuse"]), zeroUndef(info.deck["skip"]), zeroUndef(info.deck["attack"]), game.stackedTurns + 1);
            evSkip += info.prob * result.skip;
            evDraw += info.prob * result.draw;
            evAttack += info.prob * result.attack;
            //console.log(evSkip, evDraw, evAttack);
        })
        const best = Math.max(evSkip, evDraw, evAttack);
        if (evSkip < -1.00001 || evAttack < -1.00001) throw new Error(`Invalid EV: evSkip: ${evSkip}, evAttack: ${evAttack}`);
        if (evDraw > 1.00001) throw new Error(`Expected value of drawing exceeds 1 (is ${evDraw})`);
        
        if (evSkip === best) {
            if (!myHand.skip) {
                console.warn(selfHand);
                throw new Error("Tried to play skip with no skip in hand!");
            }
            return this.game.play(this.playerId, "skip");
        } else if (evAttack === best) {
            if (!myHand.attack) {
                console.warn(selfHand);
                throw new Error("Tried to play attack with no attack in hand!");
            }
            return this.game.play(this.playerId, "attack");
        } else {
            // Must be draw then
            const card = this.game.draw(this.playerId);
            if (card === "explode") return; // We will either defuse it or die
            // Update deck tracking
            const probs = [];
            for (let i = this.poss.length - 1; i >= 0; i--) {
                const deck = this.poss[i].deck;
                if (card in deck) {
                    // Each possibility should have the same deckSize
                    probs.unshift( this.poss[i].prob * deck[card] / objSum(deck));
                    if (--deck[card] === 0) delete deck[card]; // Should never be < 0
                } else {
                    // We have eliminated this possibility
                    this.poss.splice(i, 1);
                }
            }
            // Rebalance probabilities
            const sum = probs.reduce((acc, e) => acc + e, 0);
            if (probs.length !== this.poss.length) {console.warn(probs, this.poss); throw new Error("Length mismatch.");}
            //console.log("Before rebalancing", deepCopy(this.poss));//
            this.poss.forEach((info, i) => info.prob = probs[i]/sum);
            //console.log("After rebalancing", deepCopy(this.poss));//
        }
    }
}
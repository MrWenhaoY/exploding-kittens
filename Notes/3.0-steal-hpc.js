/*
Attacks, defuses, and skips in the deck

*/

import { deepCopy, objAdd, objComp, objSub, objSum, zeroUndef } from "../utility.js";
import { Bot } from "../bots.js";

import data from './3.0-steal-hpc.json' assert { type: 'json' };
export const results = data;
//export const results = {};

function getChance(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, currTurns) {
    return currTurns <= 1 ? 1 - getResult(deckSize, oSkip, uSkip, oAtk, uAtk, oDef, uDef, ohpc, uhpc, dSkip, dAtk, dhpc, 1).winRate 
        : getResult(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, currTurns - 1).winRate;
}

export function getResult(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns) {
    //console.log("Called with ", deckSize, yourSkip, oppSkip, yourAttack, oppAttack, yourDefuse, oppDefuse, deckSkip, deckAttack, turns);
    if (deckSize <= 0) {throw new Error("Decksize is invalid: " + deckSize);}
    const dDef = deckSize - dSkip - dAtk - dhpc - 1; // Should always be nonnegative
    let curr = results;
    [deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc].forEach(x => {
        if (curr[x] === undefined) {
            curr[x] = {};
        }
        curr = curr[x];
    })
    if (!curr[turns]) {
        //console.log("New call with ", deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns);
        // Uncalculated; calculate now
        if (deckSize === 1 && uSkip < 1 && uAtk < 1 && uDef < 1 && uhpc < 2) {
            curr[turns] = {winRate: 0, move: "draw", draw: 0, skip: -1, attack: -1, hpc: -1};
        } else {
            const attack = uAtk > 0 ? 1 - getResult(deckSize, oSkip, uSkip, oAtk, uAtk - 1, oDef, uDef, ohpc, uhpc, dSkip, dAtk, dhpc, 2).winRate: -1;
            const skip = uSkip < 1 ? -1 : getChance(deckSize, uSkip - 1, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns);
            // Calculate hpc
            let hpc = 0;
            const oppHandSize = oSkip + oAtk + oDef + ohpc;
            if (uhpc >= 2 && oppHandSize > 0) {
                if (oSkip > 0) hpc += oSkip / oppHandSize * getResult(deckSize, uSkip + 1, oSkip - 1, uAtk, oAtk, uDef, oDef, uhpc - 2, ohpc, dSkip, dAtk, dhpc, turns).winRate;
                if (oAtk > 0) hpc += oAtk / oppHandSize * getResult(deckSize, uSkip, oSkip, uAtk + 1, oAtk - 1, uDef, oDef, uhpc - 2, ohpc, dSkip, dAtk, dhpc, turns).winRate;
                if (oDef > 0) hpc += oDef / oppHandSize * getResult(deckSize, uSkip, oSkip, uAtk, oAtk, uDef + 1, oDef - 1, uhpc - 2, ohpc, dSkip, dAtk, dhpc, turns).winRate;
                if (ohpc > 0) hpc += ohpc / oppHandSize * getResult(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc - 1, ohpc - 1, dSkip, dAtk, dhpc, turns).winRate; // You lost 2 gained 1
            } else hpc = -1;
            // Calculate draw
            const defDrawChance = dDef / deckSize;
            const skipDrawChance = dSkip / deckSize;
            const attackDrawChance = dAtk / deckSize;
            const hpcDrawChance = dhpc / deckSize;
            const explodeDrawChance = 1 / deckSize;
            let draw = explodeDrawChance * (uDef > 0 ? getChance(deckSize, uSkip, oSkip, uAtk, oAtk, uDef - 1, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns): 0);
            if (skipDrawChance > 0) draw += skipDrawChance * getChance(deckSize - 1, uSkip + 1, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip - 1, dAtk, dhpc, turns);
            if (attackDrawChance > 0) draw += attackDrawChance * getChance(deckSize - 1, uSkip, oSkip, uAtk + 1, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk - 1, dhpc, turns);
            if (defDrawChance > 0) draw += defDrawChance * getChance(deckSize - 1, uSkip + 1, oSkip, uAtk, oAtk, uDef + 1, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns);
            if (hpcDrawChance > 0) draw += hpcDrawChance * getChance(deckSize - 1, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc + 1, ohpc, dSkip, dAtk, dhpc - 1, turns);
            if (draw < 0) {
                console.log(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns);
                console.log(explodeDrawChance, skipDrawChance, defDrawChance, hpcDrawChance, attackDrawChance);
                throw new Error("Negative draw winRate");
            }
            curr[turns] = {winRate: Math.max(draw, skip, attack, hpc), draw, skip, attack, hpc};
            // There are cases where you could steal but you shouldn't (even if your opponent has more than just hpcs)
            // There are cases where you got attacked but attacking is worse than skipping
            // There are cases where there is only 1 card left in the deck but you shouldn't steal (yet) even though you could
            //if (deckSize === 1 && hpc !== -1 && curr[turns].winRate - hpc > 0.00001) {console.log(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns); console.log(curr[turns]); throw new Error();}
        }  
    }
    if (curr[turns].winRate < 0) {
        console.log(deckSize, uSkip, oSkip, uAtk, oAtk, uDef, oDef, uhpc, ohpc, dSkip, dAtk, dhpc, turns);
        console.log(curr[turns]);
        throw new Error(`Winrate < 0! ${curr[turns].winRate}`);
    }
    return curr[turns];
}


// There are defuses and the deck and we may not always know for certain what cards are in the opponent's hand
export class DP_30Bot extends Bot {
    constructor(game, playerId, sleepTime=200) {
        function playHandler(playerId, card, special, self) {
            if (playerId === self.playerId) return; // We played this card
            // Update deck tracking
            //console.log("Before updating odds", deepCopy(self.poss));//
            const probs = [];
            for (let i = self.poss.length - 1; i >= 0; i--) {
                const hand = self.poss[i].hand;
                if (zeroUndef(hand[card] >= card === "hairypotatocat" ? 2 : 1)) {
                    // We do not analyze the probability based on the number of thes card the opponent has
                    probs.unshift(self.poss[i].prob);
                    objSub(hand, card, card === "hairypotatocat" ? 2 : 1)
                } else {
                    // We have eliminated this possibility
                    self.poss.splice(i, 1);
                }
            }
            // Rebalance probabilities
            const sum = probs.reduce((acc, e) => acc + e, 0);
            self.poss.forEach((info, i) => info.prob = probs[i]/sum);

            if (card === "hairypotatcat") {
                // Add the stolen card
                self.poss.forEach((info, i) => objAdd(info.hand, special));
            }
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
        const myhpc = zeroUndef(myHand["hpc"]);
        let evSkip = 0;
        let evDraw = 0;
        let evAttack = 0;
        let evhpc = 0;
        this.poss.forEach((info, i) => {
            const result = getResult(objSum(info.deck), mySkip, zeroUndef(info.hand["skip"]), myAttack, zeroUndef(info.hand["attack"]), myDef, zeroUndef(info.hand["defuse"]), myhpc, zeroUndef(info.hand["hairypotatocat"]), zeroUndef(info.deck["skip"]), zeroUndef(info.deck["attack"]), zeroUndef(info.deck["hairypotatocat"]), game.stackedTurns + 1);
            //console.log(objSum(info.deck), mySkip, zeroUndef(info.hand["skip"]), myAttack, zeroUndef(info.hand["attack"]), myDef, zeroUndef(info.hand["defuse"]), zeroUndef(info.deck["skip"]), zeroUndef(info.deck["attack"]), game.stackedTurns + 1);
            evSkip += info.prob * result.skip;
            evDraw += info.prob * result.draw;
            evAttack += info.prob * result.attack;
            evhpc += info.prob * result.hpc;
            //console.log(evSkip, evDraw, evAttack);
        })
        const best = Math.max(evSkip, evDraw, evAttack, evhpc);
        if (evSkip < -1.00001 || evAttack < -1.00001 || evhpc < -1.00001) throw new Error(`Invalid EV: evSkip: ${evSkip}, evAttack: ${evAttack}, evhpc: ${evhpc}`);
        if (evDraw > 1.00001) throw new Error(`Expected value of drawing exceeds 1 (is ${evDraw})`);
        
        if (evhpc === best) {
            if (zeroUndef(myHand.hpc) < 2) {
                console.warn(selfHand);
                throw new Error("Tried to play hpc while not having enough");
            }
        } else if (evSkip === best) {
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
import { Bot } from "./../bots.js";

export const results = {};

export function getResult(deckSize, yourSkip, oppSkip, yourDefuse, oppDefuse) {
    let curr = results;
    [deckSize, yourSkip, oppSkip, yourDefuse].forEach(x => {
        if (curr[x] === undefined) {
            curr[x] = {};
        }
        curr = curr[x];
    })
    if (!curr[oppDefuse]) {
        // Uncalculated; calculate now
        if (deckSize === 1) {
            curr[oppDefuse] = {winRate: yourSkip + yourDefuse > oppSkip + oppDefuse ? 1 : 0, move: yourSkip > 0 ? "skip" : "draw"};
        } else {
            const draw = 1/deckSize * (yourDefuse > 0 ? 1 - getResult(deckSize, oppSkip, yourSkip, oppDefuse, yourDefuse - 1).winRate: 0) 
                + (deckSize-1)/deckSize * (1 - getResult(deckSize - 1, oppSkip, yourSkip + 1, oppDefuse, yourDefuse).winRate);
            const skip = yourSkip > 0 ? 1 - getResult(deckSize, oppSkip, yourSkip - 1, oppDefuse, yourDefuse).winRate: -1;

            //console.log(deckSize, yourSkip, oppSkip, yourDefuse, oppDefuse, {draw, skip});

            if (Math.abs(draw - skip) < 0.00001) {
                curr[oppDefuse] = {winRate: draw, move: "either"};
            } else {
                curr[oppDefuse] = draw > skip ? {winRate: draw, move: "draw", skip} : {winRate: skip, move: "skip", draw};
            }
        }
    }
    //console.log(deckSize, yourSkip, oppSkip, yourDefuse, oppDefuse, curr[oppDefuse]);
    return curr[oppDefuse];
}

export class DP_13Bot extends Bot {
    action() {
        // Assumes game with only skips and starting defuses
        // Looks at opponent's hand because I'm too lazy to calculate it but this is calculatable (given above assumption)
        if (this.game.turn % 2 !== this.playerId) return; 
        const selfHand = this.game.players[this.playerId];
        const oppHand = this.game.players[1 - this.playerId];
        const r = getResult(this.game.deck.length, selfHand["skip"] ? selfHand["skip"] : 0, oppHand["skip"] ? oppHand["skip"] : 0, selfHand["defuse"] ? selfHand["defuse"] : 0, oppHand["defuse"] ? oppHand["defuse"] : 0);
        if (r.move === "either" || r.move === "draw") return this.game.draw(this.playerId);
        else {
            if (!selfHand.skip) {
                console.log(this.game.deck.length, selfHand["skip"] ? selfHand["skip"] : 0, oppHand["skip"] ? oppHand["skip"] : 0, selfHand["defuse"] ? selfHand["defuse"] : 0, oppHand["defuse"] ? oppHand["defuse"] : 0)
                console.log(selfHand, r);
                throw new Error("Tried to play skip with no skip in hand!");
            }
            return this.game.play(this.playerId, "skip");
        }
    }
}
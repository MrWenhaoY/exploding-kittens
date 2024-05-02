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
    console.log(deckSize, yourSkip, oppSkip, yourDefuse, oppDefuse, curr[oppDefuse]);
    return curr[oppDefuse];
}
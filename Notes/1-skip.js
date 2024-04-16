export function winChanceDP(deckMax, skipMax) {
    skipMax += deckMax - 1;
    const result = [];     // [deck][skip]
    for (let i = 0; i <= deckMax; i++) result.push(Array(skipMax + 1));
    
    for (let x = 1; x <= deckMax; x++) {
        for (let y = 0; y <= skipMax; y++) {
            if (x === 1) {
                result[x][y] = y > 0 ? {winRate: 1, move: "skip"} : {winRate: 0, move: "draw"};
                continue;
            }
            const draw = x === 2 ? 0.5 : (x-1)/x * (1/(x-1) + (x-2)/(x-1)*result[x-2][y+1].winRate);
            const skip = y <= 0 ? -1 : 1/x + (x-1)/x * result[x-1][y-1].winRate;
            result[x][y] = draw >= skip ? {winRate: draw, move: "draw"} : {winRate: skip, move: "skip"}
        }
    }
    return result;
}
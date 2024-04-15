/*- Let winChance(deckSize, skipCount): win percentage // Assuming opponent never plays cards
- winChance(1, 0) = 0 // You lose: you must draw and die
- winChance(1, y) = 1 // Assuming y > 0; you skip and your opponent loses
- winChance(x, 0) = (x-1)/x * [(1/x-1) + (x-2)/(x-1) * winChance(x-2, y + 1)]
- winChance(x, y) = 
   - draw: (x-1)/x * [1/(x-1) + (x-2)/(x-1) * winChance(x-2, y+1)]
   - skip: 1/x + (x-1)/x * winChance(x-1, y-1)*/
export function winChance(deckSize, skipCount) {
    if (typeof deckSize !== "number" || typeof skipCount !== "number" || deckSize < 1 || skipCount < 0) throw new Error("Invalid input to function winChance");
    // Base cases for draw are deckSize = 1 and deckSize = 2
    const draw = deckSize === 1 ? 0 : (deckSize === 2 ? 1 :(deckSize-1)/deckSize * (1/(deckSize-1) + (deckSize - 2)/(deckSize - 1) * winChance(deckSize - 2, skipCount + 1)));
    // May not skip if you have no skips
    const skip = skipCount <= 0 ? -1 : 1/deckSize + (deckSize - 1)/deckSize * winChance(deckSize - 1, skipCount - 1);
}

export function winChanceDP(deckMax, skipMax) {
    skipMax += deckMax - 1;
    const result = [];     // [deck][skip]
    for (let i = 0; i <= deckMax; i++) result.push(Array(skipMax + 1));
    
    for (let x = 1; x <= deckMax; x++) {
        for (let y = 0; y <= skipMax; y++) {
            if (x === 1) {
                result[x][y] = y > 0 ? 1 : 0;
                continue;
            }
            const draw = x === 2 ? 0.5 : (x-1)/x * (1/(x-1) + (x-2)/(x-1)*result[x-2][y+1]);
            const skip = y <= 0 ? -1 : 1/x + (x-1)/x * result[x-1][y-1];
            result[x][y] = Math.max(draw, skip);
        }
    }
    return result;
}
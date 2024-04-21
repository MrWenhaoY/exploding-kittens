export function winChanceDP(n) {
    const result = {};     // {deck : def : skip}
    
    for (let x = 1; x <= n; x++) { // x = deck size
        result[x] = {};
        for (let d = 0; d <= 1; d++) { // d = defuse count 
            result[x][d] = {};
            for (let y = 0; y <= n; y++) { // y = skip count
                //console.log(result);
                if (x === 1) {
                    result[x][d][y] = y > 0 ? {winRate: 1, move: d > 0 ? "either" : "skip"} : {winRate: d > 0 ? 1 : 0, move: "draw"};
                    continue;
                }
                
                if (x !== 2 && !result[x-2][d][y+1]) {
                    result[x][d][y] = null;
                    continue;
                }
                let draw;
                if (d === 0) {
                    draw = x === 2 ? 0.5 : (x-1)/x * (1/(x-1) + (x-2)/(x-1)*result[x-2][d][y+1].winRate);
                } else {
                    draw = x === 2 ? (0.5 + 0.25 + 0.25 * result[x-1][d-1][y].winRate) : 1/x * (1/x + (x-1)/x * result[x-1][d-1][y].winRate) + (x-1)/x * (1/(x-1) + (x-2)/(x-1)*result[x-2][d][y+1].winRate);
                }
                const skip = y <= 0 ? -1 : 1/x + (x-1)/x * result[x-1][d][y-1].winRate;
                if (Math.abs(draw - skip) < 0.00001) {
                    result[x][d][y] = {winRate: draw, move: "either"};
                    continue;
                }
                result[x][d][y] = draw >= skip ? {winRate: draw, move: "draw", skip: skip} : {winRate: skip, move: "skip", draw: draw};
            }
        }
    }
    return result;
}
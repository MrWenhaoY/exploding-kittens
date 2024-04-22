export function winChanceDP(n) {
    const result = {};     // {deck : yourSkip : oppSkip}
    
    for (let x = 1; x <= n; x++) {
        result[x] = {};
        for (let sum = 0; sum <= n-x+1; sum++) {
            for (let y = 0; y <= sum; y++) {
                //console.log(result);
                if (!result[x][y]) result[x][y] = {};
                const z = sum - y;
                if (x == 1) {
                    result[x][y][z] = y > 0 ? {winRate: y > z ? 1 : 0, move: "skip"} : {winRate: 0, move: "draw"};
                    continue;
                }

                if (!result[x-1][z][y+1]) {
                    result[x][y][z] = null;
                    continue;
                }

                const draw = (x-1)/x * (1 - result[x-1][z][y+1].winRate);
                const skip = y <= 0 ? -1 : (1 - result[x][z][y-1].winRate);
                if (Math.abs(draw - skip) < 0.00001) {
                    result[x][y][z] = {winRate: draw, move: "either"};
                } else {
                    result[x][y][z] = draw > skip ? {winRate: draw, move: "draw", skip} : {winRate: skip, move: "skip", draw};
                }
            }
        }
    }

    return result;
}
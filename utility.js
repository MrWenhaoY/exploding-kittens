export function objAdd(obj, item, qty=1) {
    item in obj ? obj[item] += qty : obj[item] = qty;
}

export function objSum(obj) {
    return Object.keys(obj).reduce((acc, e) => acc + obj[e], 0);
}

export const zeroUndef = x => x ? x : 0;
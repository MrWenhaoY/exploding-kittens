// Does not work for circular references!!! (and functions)
export function deepCopy(x) {
    if (Array.isArray(x)) return x.map(deepCopy);
    if (typeof(x) === "object") {
        const copy = {};
        Object.keys(x).forEach(key => copy[key] = deepCopy(x[key]));
        return copy;
    }
    return x;
}

export function objAdd(obj, item, qty=1) {
    item in obj ? obj[item] += qty : obj[item] = qty;
}

export function objSub(obj, prop, qty=1) {
    if ((obj[prop] -= qty) <= 0) delete obj[prop];
}

export function objComp(obj1, obj2) {
    const k1 = Object.keys(obj1);
    return k1.length === Object.keys(obj2).length && k1.every(k => obj1[k] === obj2[k]);
}

export function objSum(obj) {
    return Object.keys(obj).reduce((acc, e) => acc + obj[e], 0);
}

export function verifyResults(res) {
    return Object.values(res).every(val => {
        if (typeof val === "object" ? verifyResults(val) : typeof val === "string" ? true : (0 <= val && val <= 1) || val === -1) return true;
        else {console.log(res); return false;}
    });
}

export const zeroUndef = x => x ? x : 0; // or alternatively, x => x || 0
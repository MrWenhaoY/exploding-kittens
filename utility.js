export function objAdd(obj, item, qty=1) {
    item in obj ? obj[item] += qty : obj[item] = qty;
}
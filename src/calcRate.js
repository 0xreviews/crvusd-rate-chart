const MAX_EXP = 1000
const ONE_YEAR = 365 * 24 * 60 * 60

export let rate0 = 3022265993; // APY: 10% if PegKeepers are empty, 4% when at target fraction
export let target_debt_fraction = 0.10;
export let sigma = 0.02;
// PEG_KEEPERS = [
//     '0xaA346781dDD7009caa644A4980f044C50cD2ae22',
//     '0xE7cd2b4EB1d98CD6a4A48B6071D46401Ac7DC5C8',
//     '0x6B765d07cf966c745B340AdCa67749fE75B5c345',
//     '0x1ef89Ed0eDd93D1EC09E4c07373f69C49f4dcCae',
//     '0x0000000000000000000000000000000000000000']
// let pegkeeper_debt = 264529.72 + 0 + 762459.89 + 335904.99;
// let total_debt = 9286475.23;

export function calculate_rate(price, pegkeeper_debt, total_debt) {
    let power = (1 - price) / sigma;
    if (pegkeeper_debt > 0) {
        if (total_debt === 0) return 0;
        power -= pegkeeper_debt / total_debt / target_debt_fraction
    }
    let rate = rate0 * Math.min(Math.E ** power, MAX_EXP)
    return rate;
}

export function calculate_rate_yearly(price, pegkeeper_debt, total_debt) {
    let rate = calculate_rate(price, pegkeeper_debt, total_debt);
    return (1 + rate / 10**18) ** ONE_YEAR - 1;
}

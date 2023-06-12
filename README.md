# crvUSD-Rate-Chart

This tool can simulate [crvUSD(Curve StableCoin)](https://github.com/curvefi/curve-stablecoin) loan rate changes.

## crvUSD Loan Rate

${DebtFraction} = \frac{PegKeeperDebt}{TotalDebt}$

${power} = \frac{Price_{Peg} - Price_{crvUSD}}{sigma} - \frac{DebtFraction}{TargetFraction}$

${r} = rate0 * e^{power}$

The loan rate of crvUSD mainly adjusted by two dimensions, crvUSD price and the ratio of PegKeepers' debt to total debt.

- When crvUSD price goes lower, the rate goes higher.

- When crvUSD price goes higher, the rate goes lower.

- When DebtFraction goes lower, the rate goes higher.

- When DebtFraction goes higher, the rate goes lower.

You could find more detials about crvUSD in [Curve Stablecoin Whitepaper](https://github.com/curvefi/curve-stablecoin/blob/master/doc/curve-stablecoin.pdf) and the [contract code calculate_rate()](https://github.com/curvefi/curve-stablecoin/blob/master/contracts/mpolicies/AggMonetaryPolicy.vy#L153-L174).

## Quick Start

```sh
npm install
npm run start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

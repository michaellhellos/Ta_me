# Handover: Simulasi Sell Coin Balance
**Date:** 2026-03-20
**Spec Reference:** `spec/022.simulasi-sell-coin-balance.md`

## Summary of Research
The user requested a feature to display the amount of coins owned by the user on the "Jual" (Sell) tab within the virtual trading simulation page (`Simulasi.tsx`). 

During the analysis of the codebase, it was discovered that:
1. The backend (`trade.js`) does not have an explicit `GET /portfolio` endpoint that returns aggregated coin balances.
2. The `Dashboard.tsx` dynamically calculates portfolio balances on the frontend by fetching the user's trading history (`/api/trade/history`) and aggregating the `BUY` and `SELL` quantities.
3. `Simulasi.tsx` already has logic to fetch this history, but only triggers it when the user switches to the `riwayat` (history) tab.

## Implementation Plan
To fulfill the request in the most efficient and codebase-consistent manner:
1. Modify `Simulasi.tsx` to fetch `history` unconditionally on component mount (not just when `tab === "riwayat"`).
2. Calculate the `ownedQuantity` for the currently selected `coin` using a derived `reduce` function over the `history` array.
3. Display `Tersedia: {ownedQuantity} {Symbol}` inside the `.trade-panel` when the user is in `sell` mode.
4. Add an `onClick` handler to this text so that clicking it automatically fills the `amount` input with the maximum available balance, improving UX per industry standards.
5. Add associated CSS classes (`.owned-balance`) in `Simulasi.css` to style the text appropriately.

## Next Steps
- The specification is drafted and complete.
- Await the user's `kerjakan` prompt to execute the implementation step exactly as specified in `022.simulasi-sell-coin-balance.md`.

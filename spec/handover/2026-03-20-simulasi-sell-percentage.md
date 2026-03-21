# Handover: Simulasi Sell Percentage Buttons
**Date:** 2026-03-20
**Spec Reference:** `spec/023.simulasi-sell-percentage.md`

## Summary of Research
The user requested quick-action percentage buttons (25%, 50%, 75%, 100%) to be available on the "Jual" (Sell) tab in `Simulasi.tsx` so users can easily select portions of their portfolio to sell.

During the previous step, `ownedQuantity` was already calculated efficiently on the frontend. Implementing this request primarily involves frontend manipulation.

## Implementation Plan
1. Add a new row of percentage buttons underneath or adjacent to the `owned-balance` display in `Simulasi.tsx`.
2. Map `onClick` handlers directly computing fractions of `ownedQuantity`:
   - 25% -> `ownedQuantity * 0.25`
   - 50% -> `ownedQuantity * 0.50`
   - 75% -> `ownedQuantity * 0.75`
   - 100% -> `ownedQuantity * 1`
3. Wrap them in `Number((...).toFixed(6))` to ensure precision consistency with the existing logic.
4. Add CSS classes under `Simulasi.css` to style the buttons compactly and match the `sell` design language (subtle danger/red tints on hover to emphasize a sell action).

## Next Steps
- The specification is drafted and complete.
- Waiting for the user's `kerjakan` prompt to execute the file edits.

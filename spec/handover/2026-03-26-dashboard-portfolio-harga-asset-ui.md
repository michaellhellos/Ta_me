# Handover — 2026-03-26 — User Dashboard Portfolio, Harga Asset, UI/UX (spec 033)

## Summary

Polish & refinement pass on the **Dashboard Beranda** tab. Fixed portfolio labels to Indonesian, improved profit display readability, added trend border indicators, standardized price formatting, added market cap display, replaced remaining `alert()` calls with Toast, and added section header icons.

## Changes Made

### Modified Files (2)

**Dashboard.tsx**
- `formatPrice()` helper — standardizes decimal places by price magnitude (≥$1: 2dp, ≥$0.01: 4dp, <$0.01: 6dp)
- Toast component — imported from `./Toast`, added state, replaced 3 `alert()` calls in `handleUpdateProfile`
- Portfolio labels → Indonesian — "Avg Buy" → "Harga Beli Rata²", "Current" → "Harga Sekarang", "Invested" → "Modal"
- Profit/loss 2-line display — dollar amount and percent on separate lines (more readable on mobile)
- Trend border — `.portfolio-card.trend-up / .trend-down` class based on `profitDollar`
- Section icons — `<Briefcase>` for Portofolio, `<BarChart3>` for Pasar Kripto
- Market cap — displays "MCap: $X.XT/B/M" from CoinGecko data (already available in API response)
- Container cards `no-hover` — Portfolio and Market section cards no longer float on hover (individual items still do)
- All prices use `formatPrice()` for consistent formatting

**Dashboard.css**
- Trend border styles — `.trend-up` green left border, `.trend-down` red left border
- Profit 2-line layout — `.profit-dollar` and `.profit-percent` block display
- Portfolio detail gap — 1px → 8px (more breathing room between info boxes)
- Market card margin fix — removed `margin-top: 12px` (`.market-list` `gap: 12px` handles spacing)
- Market cap label — `.market-cap-label` muted small text
- Background consistency — market card `0.6` → `0.5` (matches portfolio-card)
- Section header icons — flex alignment + primary color for SVGs

## Verification

- ✅ `npx tsc --noEmit` — zero errors
- ✅ `npx vite build` — built in 731ms
- ⬜ Manual browser testing pending

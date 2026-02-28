# Handover — Session 2026-02-28 (Leaderboard Weekly Profit)

## Session Summary

Added **weekly leaderboard** to the **Komunitas (Community) page**. Users are ranked by **realized profit** from SELL transactions within the **current week** (Monday 00:00 WIB). Leaderboard resets automatically each week via query-based date filtering (no cron job). Replaced the hardcoded dummy leaderboard data with live data.

## What Was Done

### Research Phase
- Full codebase analysis → `spec/006.leaderboard-weekly-profit.md`
- Identified existing `mentor/students` profit calc pattern in `trade.js`
- Discovered Komunitas.tsx already had leaderboard tab structure with hardcoded dummy data

### Implementation Phase

**Backend:**
- `routes/trade.js` — **MODIFIED** — Added `GET /leaderboard` endpoint: calculates week start (Monday 00:00 WIB), fetches all BUY transactions per user for cost basis, filters SELL transactions to current week, computes profit per user, sorts DESC, returns ranked list with `weekStart` ISO string

**Frontend:**
- `Komunitas.tsx` — **MODIFIED** — Replaced hardcoded dummy leaderboard with live data: added `LeaderboardEntry` interface, `TRADE_API` constant, leaderboard/weekStart/lbLoading state, `useEffect` to fetch leaderboard on tab switch, `formatWeekRange()` helper, podium top-3 visual (🥇🥈🥉), full ranked list with current user highlighting, loading spinner, empty state
- `Komunitas.css` — **MODIFIED** — New leaderboard styles: `.lb-title-bar`, `.week-badge`, `.lb-podium`/`.lb-podium-item` (gold/silver/bronze gradient cards with CSS `order`), `.lb-list-header`, `.lb-rank`, `.lb-user`, `.lb-loading`, `.lb-empty`, updated responsive rules
- `Dashboard.tsx` — **UNCHANGED** (leaderboard tab was initially added then reverted per user request)
- `Dashboard.css` — **UNCHANGED** (leaderboard CSS was initially added then removed)

### Verification
- TypeScript `tsc --noEmit`: ✅ No errors
- Vite build: ✅ Success

## Decisions Made
- **Komunitas page** over separate Dashboard tab — user specifically requested leaderboard in the Community page
- **Query-based weekly reset** over cron job — simpler, stateless, reliable
- **Realized profit only** (SELL transactions) — unrealized gains too complex and volatile
- **Lazy fetch** — leaderboard only fetched when tab is "leaderboard"
- **Current user highlighting** — user's own row gets purple highlight (`.highlight` class)
- **Zero new dependencies** — no new npm packages
- **Zero new models** — uses existing Transaction + User collections

## Files Changed (3 total)

| Action | File |
|--------|------|
| **MODIFY** | `Backend/backend/routes/trade.js` |
| **MODIFY** | `Frontend/frontend/src/pages/Komunitas.tsx` |
| **MODIFY** | `Frontend/frontend/src/pages/Komunitas.css` |

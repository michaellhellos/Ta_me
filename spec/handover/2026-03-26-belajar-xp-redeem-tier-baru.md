# Handover — 2026-03-26 — Belajar XP Redeem Tier Baru (spec 035)

## Summary

Changed XP redeem tiers from 10XP=$100/100XP=$1000 to **40XP=$5,000** and **80XP=$12,000**. XP live update after quiz was verified as already working — no changes needed.

## Changes Made

**nilaiController.js** — Backend redeem conversion: `40→5000`, `80→12000`

**Belajar.tsx** — Frontend redeem modal buttons: labels, `handleRedeem()` amounts, and `disabled` thresholds updated to 40/80.

## Verification

- ✅ `tsc --noEmit` — zero errors
- ✅ `vite build` — success

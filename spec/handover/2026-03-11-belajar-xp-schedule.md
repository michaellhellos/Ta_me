# Handover — 2026-03-11 — Belajar Quiz XP + Jadwal Mentoring (spec 015)

## Summary

Added **Quiz XP display** and **Jadwal Mentoring tab** to the Belajar page. New backend GET endpoint for fetching user scores. Two-tab layout separating Quiz and Mentoring Schedule content.

## Changes Made

### Backend (2 files)

- `controllers/nilaiController.js` — Added `getNilaiByUser`: `GET /api/nilai/user/:userId` returns all quiz scores for a user
- `routes/nilaiRoutes.js` — Registered the new GET route

### Frontend (2 files)

**Belajar.tsx (rewritten)**
- Tab system: "📝 Quiz" | "📅 Jadwal Mentoring" (with schedule count badge)
- Fetch user's XP scores on mount → `nilaiMap` (materiId → {score, totalSoal})
- XP badge on each quiz card: "✅ 8 XP" for completed quizzes
- Total XP summary banner at top: "42 XP Total dikumpulkan"
- Live nilaiMap update after quiz submission (badge appears immediately)
- Fetch schedules from `GET /api/schedule/upcoming`
- Schedule tab: mentor avatar, title, date/time, "Join Zoom Meeting" button
- Empty state for both tabs
- Loading skeletons for both tabs

**Belajar.css (+210 lines)**
- Tab bar (iOS-style segmented control with glassmorphism)
- XP summary banner (green accent)
- XP badge (green pill on card footer)
- Card footer layout (space-between for badge + quiz count)
- Schedule card styles (scoped with `-b` suffix to avoid Ai.css conflicts)

## Verification

- ✅ `npx tsc --noEmit` — zero errors
- ✅ `npx vite build` — built in 548ms
- ⬜ Manual browser testing pending

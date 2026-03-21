# Handover — 2026-03-20 — Belajar Quiz XP Redeem System (spec 020)

## Summary

Researched and created a specification document for the implementation of an XP redemption system in the `Belajar.tsx` page. The objective is to allow users to exchange specific amounts of earned XP (e.g. 10 XP, 100 XP) into monetary balance points via a popup.

## Research & Scope
- **Affected Models:** `Backend/backend/models/user.js` needs a new `redeemedXp` numeric property.
- **Affected Controllers:**
  - `nilaiController.js` logic must calculate the remaining available XP dynamically.
  - A new backend endpoint `POST /api/nilai/redeem` needs to be established to securely execute the reward transaction directly to the User's balance integer.
- **Affected Frontend Components:** `Belajar.tsx` and `Belajar.css`. The standard XP indicator text component represents the optimal target space for presenting a clickable Redeem action bounding block resulting in a newly framed centered `<div className="redeem-modal">` popup displaying interactive conversion buttons.

## Outputs
- **Spec Document:** `spec/020.belajar-quiz-xp-redeem.md` contains the comprehensive architectural scope of additions, the UI logic layout, backend payload structure schemas, test scenarios, and manual testing procedures.

## Next Steps
- Execute the specification guidelines to modify `user.js` and `nilaiController.js` on the backend.
- Execute to modify the components inside `Belajar.tsx` to handle the new state layers and render the new popup visual logic on the frontend.

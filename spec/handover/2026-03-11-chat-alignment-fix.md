# Handover — 2026-03-11 — Chat: Sender Name & Alignment Fix (Spec 016)

## Summary

This update fixes the two critical bugs in `Chat.tsx` that broke the WhatsApp-style experience:
1. **Header Name Bug:** The chat header was incorrectly displaying "User" (the logged-in user's own name) instead of the mentor's name.
2. **Alignment Bug:** All realtime incoming socket messages were rendering on the right side (`wa-msg.me`) as if they were outgoing messages.

## Root Cause & Fix

The bugs were caused by how the user data is stored in `localStorage` by `auth.js`. 
`localStorage.getItem("user")` saves the object with an `id` property, not `_id`. 
In `Chat.tsx`, the code expected `user._id`, which evaluated to `undefined`. 

When a socket message arrived with an unpopulated sender string (e.g. `"65fxyz..."`), the check `msg.sender._id === user._id` became `undefined === undefined` (which evaluates to `true`), forcing all messages to the right side. Similarly, the header name lookup failed to filter out the logged-in user.

### Changes Made

**Frontend (1 file)**
- `Frontend/frontend/src/pages/Chat.tsx`: 
  - Created a helper variable `const myId = user.id || user._id;`
  - Replaced all 4 instances of `user._id` with `myId`. This guarantees the correct participant filter and correct `isMe` boolean evaluation.

## Verification

- ✅ `npx tsc --noEmit` — 0 errors
- ✅ `npx vite build` — Success (550ms)
- ⬜ Manual Testing Required: Open 2 browsers (1 as User, 1 as Mentor) to verify message alignment and typing indicator separation.

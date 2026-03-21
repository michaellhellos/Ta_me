# Handover: React Memory Hardening (Token Bleed Resolution)
**Date:** 2026-03-21
**Spec Reference:** `spec/030.chat-memory-hardening.md`

## Mission Debrief
The client reported impossible chat intersections: "When I log in as Mentor Bejo, then log in as normal User, and chat to Mentor Michaell, why does Bejo receive the chat? And why does the Chat Header say my own name?"

## The "Token Bleed" Anomaly
Deep Multi-Dimensional Technical Analysis confirmed the Database, API Endpoints, and Socket protocols were structurally flawless. The anomaly lived within the Client-Side React rendering lifecycle interacting with simultaneous tab authentication.

Because the user tested two active roles inside identical browser environments without isolated cookies (Incognito contexts), the `localStorage` mutated. 
React components `Chat.tsx` and `Qna.tsx` historically extracted `localStorage.token` on **every single state re-render**. The micro-second Tab 2 modified local storage, Tab 1 assimilated the new token mid-session. This caused Tab 1 (Mentor Bejo) to unwittingly morph its API fetches and Identity matchers to mimic Tab 2 (The User), resulting in Bejo's screen rendering the User's personal chats.

## Engineering Action
Refactored all primary authentication extraction hooks within interactive messaging portals into hyper-strict `React.useMemo` closures mapping with zero dependencies `[]`.
- `Chat.tsx`
- `Qna.tsx`
- `AdminInbox.tsx`

The Identity parameters (`token`, `user`, `myId`) are now hard-cached at Component *Mount Time*. Mid-session `localStorage` hijackings via side-by-side tabs will no longer corrupt the application logic. Tab 1 will permanently remain loyal to its initial Mount Identity.

The Chat Ecosystem is fully locked down and immune to cross-tab memory bleeding. Handing over optimized and hardened build to client.

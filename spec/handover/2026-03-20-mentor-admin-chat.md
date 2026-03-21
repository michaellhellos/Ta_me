# Handover: Mentor-Admin Chat & Inbox Implementation
**Date:** 2026-03-20
**Spec Reference:** `spec/028.mentor-admin-chat.md`

## Summary of Research
The user requested a bridge allowing Mentors to directly chat with the platform Administrators. 

Upon deeply analyzing the database models (`Message`, `Conversation`) and socket controllers inside `chatRoutes.js`, I discovered that the system was already masterfully engineered to be Role-Agnostic. Because `participants` simply accepts any two `User` ObjectIDs, **absolutely zero backend database modifications are necessary**. The architectural challenge lies entirely in Frontend UI Routing and Contact Discovery.

## Implementation Plan
1. **Admin Inbox Setup:** Create an `AdminInbox.tsx` component designed explicitly for the Admin Dashboard. It will poll `/api/chat/conversation` dynamically using the Admin JWT Token, rendering a beautiful glassmorphic queue of support requests. We'll map this view to a new "Pesan Masuk" tab on the Admin Sidebar.
2. **Mentor "SOS" Button (`Qna.tsx`):** On the Mentor's existing Inbox panel, inject a dedicated "Hubungi Admin Support" trigger button. 
3. **Silent ID Resolution:** When the Mentor clicks the trigger button, the frontend will silently poll `GET /api/auth/user?role=admin` to resolve the literal `_id` of the Administrator, instantly ping `POST /api/chat/conversation` to mint the private secure room, and hyperspace the Mentor directly into the existing, live `Chat.tsx` interface. 

## Next Steps
- The specification is meticulously mapped out and heavily prioritizes clean code reusability (we are recycling the powerful `Chat.tsx` without mutating it).
- Awaiting the user's `kerjakan` prompt to commence creating the `AdminInbox.tsx` layout and binding the Mentor Contact logic.

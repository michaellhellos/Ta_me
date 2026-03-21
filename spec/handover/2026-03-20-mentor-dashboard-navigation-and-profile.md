# Handover: Mentor Dashboard Navigation & Profile
**Date:** 2026-03-20
**Spec Reference:** `spec/025.mentor-dashboard-navigation-and-profile.md`

## Summary of Research
The user requested UX enhancements on the Mentor Dashboard: turning specific stat widgets into navigational shortcuts and replacing the generic logout click flow with a comprehensive Mentor Profile settings modal. 

Investigation into the backend `User` schema revealed that mentors uniquely store data in `specialization`, `bio`, `experience`, and `style`. The previously engineered `PUT /api/user/profile` was restricted to base user fields. Therefore, the backend must be upgraded to safely process these optional mentor metadata payloads before the frontend forms can correctly bind and persist data.

## Implementation Plan
1. **Navigational Shortcuts:** Attach React `onClick` event listeners strictly hooked to `setMenu("siswa")` and `setMenu("qna")` onto their respective stat cards.
2. **Backend Payload Expansion:** Append processing for `specialization`, `bio`, `experience`, and `style` within `user.js` endpoint routes for both `GET /me` and `PUT /profile`. This allows dynamic expansion of a single model without requiring complex multi-table joins.
3. **Frontend Forms & Modal:** Build an expansive glassmorphic form array within a scrollable `profile-modal-box`.
4. **Consistency Enforcement:** Transfer the `.logout-btn` from the visible header strictly into the lowest footer of the profile modal, synchronizing the UX seamlessly with the standard User UI.

## Next Steps
- The specification is drafted and complete.
- Waiting for the user's `kerjakan` prompt to weave these intuitive UI and extensive API modifications into the codebase.

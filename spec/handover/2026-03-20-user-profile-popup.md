# Handover: User Profile & Logout Popup
**Date:** 2026-03-20
**Spec Reference:** `spec/024.user-profile-popup.md`

## Summary of Research
The user requested a feature to update their profile and access the logout function by clicking on the header avatar in the Dashboard. 

During research, a critical security finding was made: the existing endpoint for modifying users (`PUT /user/:id` inside `auth.js`) lacks authentication middleware and permits editing roles and balances. It is an admin-only endpoint by design, though unprotected. To securely handle normal user profile updates (name, email, password), a dedicated and secure `PUT /api/user/profile` endpoint must be built in `user.js` utilizing the `auth` token.

## Implementation Plan
1. **Backend Security:** 
   - Add `PUT /profile` to `backend/routes/user.js`.
   - Enforce the `auth` middleware.
   - Limit updates exclusively to `name`, `email`, and securely hash `password` (if provided) using `bcrypt`. 
   - Disallow any payload properties trying to override `balance` or `role`.

2. **Frontend UI/UX:**
   - In `Dashboard.tsx`, set the `.avatar` to be clickable `cursor: pointer`.
   - Render a central Modal Overlay holding the Settings form.
   - Inject the existing `handleLogout` logic into a red, emphasized "Logout" button at the bottom of the modal.
   - Handle form submission caching: update `localStorage` and React state seamlessly upon a 200 OK update response so the user doesn't need to refresh.
   - Apply matching glassmorphic styling inside `Dashboard.css`.

## Next Steps
- The specification is drafted and complete.
- Waiting for the user's `kerjakan` prompt to deploy the secure backend updates and the sleek frontend modal.

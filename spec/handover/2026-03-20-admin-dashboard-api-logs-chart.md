# Handover: Admin Dashboard API Tracking Analytics
**Date:** 2026-03-20
**Spec Reference:** `spec/027.admin-dashboard-api-logs-chart.md`

## Summary of Research
The user wants to monitor the exact server load in real-time by rendering an API tracking Line Chart directly onto the recently modernized Admin Dashboard. 

To achieve this accurately without collapsing the server under I/O pressure, standard monolithic row-inserts (creating 1 Row per API hit) are out of the question. I will engineer an atomic `Daily Bucket Pattern` on MongoDB.

## Implementation Plan
1. **Initialize `ApiStat` Database Schema:** Create a strict `date` -> `count` model binding that acts as a daily bucket.
2. **Global Middleware Injection:** Insert an asynchronous, non-blocking `res.on('finish')` listener right above all `/api` routes inside `server.js`. This will trigger an atomic `$inc` update on the `ApiStat` bucket dedicated to the server's current localized date string (`YYYY-MM-DD`). 
3. **Admin Payload Extension:** Broaden the `GET /api/admin/dashboard-stats` payload to query `ApiStat.find()`, sorted chronologically, plucking the past 7 rolling days of metrics.
4. **Frontend Composition:** Resurrect the `Line` component from `react-chartjs-2` inside `DashboardAdmin.tsx`. Map the returned 7-day array to a full-width, elegantly plotted line graphic directly underneath our modern `Bar` charts grid to perfect the aesthetic UI symmetry.

## Next Steps
- The specification is drafted, and the architectural bottlenecks are safely bypassed.
- Waiting for the user's `kerjakan` prompt to execute the middleware and map the dynamic Line chart.

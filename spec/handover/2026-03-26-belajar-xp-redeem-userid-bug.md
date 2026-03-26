# Handover — 2026-03-26 — Fix Bug Belajar XP Hilang & Redeem User Tidak Ditemukan (spec 038)

## Summary

Memperbaiki isu di mana bar/nilai XP menghilang ketika *user* kembali dari halaman lain ke menu **Belajar**, serta membereskan masalah pesan error "User tidak ditemukan" saat *user* mencoba untuk mencairkan (redeem) XP menjadi uang saldo simulasi. Keduanya memiliki masalah mendasar yang sama (property `user._id` yang *undefined* dari data *auth*).

## Changes Made

### Modified Files (1)

**`Frontend/frontend/src/pages/Belajar.tsx`**
- **Fetch XP (Baris 120-138):**
  Mengganti pembacaan `user?._id` menjadi fallback aman `const currentUserId = user?._id || user?.id;`. Ini memastikan proses `fetch` ke `/api/nilai/user/{id}` berjalan sebagaimana mestinya dan state `nilaiMap`, `totalEarnedXp`, serta history soal yang selesai ter-populate kembali dengan benar saat komponen di-*mount*.
- **Tukar Hadiah / Redeem (Baris 160-184):**
  Mengganti pembacaan `userId` pada payload POST `handleRedeem` menjadi `const redeemUserId = user._id || user.id;`. Ini memastikan request yang dikirim ke endpoint backend `POST /api/nilai/redeem` memiliki parameter *userId* yang valid. Alhasil, error "User tidak ditemukan" lenyap.

## Verification

- ✅ `npx tsc --noEmit` — Zero errors (Berhasil kompilasi TypeScripts).
- ✅ `npx vite build` — Sukses.
- Bug persistensi XP terselesaikan (kembali dari Beranda ke Belajar tidak akan me-reset daftar quiz dan bar nilai).
- Redeem 40 XP / 80 XP berhasil dieksekusi tanpa throw error (uang masuk ke Balance user secara presisi).

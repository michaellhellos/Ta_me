# Handover — 2026-03-26 — Fix Bug Quiz Submit "userId dan materiId wajib diisi" (spec 036)

## Summary

Memperbaiki bug di halaman Belajar di mana saat user men-submit quiz, sistem memunculkan error *"userId dan materiId wajib diisi"*.

Akar masalahnya adalah perbedaan penamaan properti ID user di `localStorage` ("user") dengan yang diharapkan oleh halaman Belajar. Backend `auth.js` mengembalikan properti `id` (bukan `_id`), sehingga pemanggilan `parsedUser._id` menghasilkan `undefined`. Karena `userId` bernilai undefined, validasi backend gagal dan menampilkan error tersebut.

## Changes Made

### Modified Files (1)

**`Frontend/frontend/src/pages/Belajar.tsx`**
- Mengubah metode pengambilan `userId` pada fungsi `submitQuiz()`.
- Menambahkan fallback pembacaan ID: `const userId = parsedUser._id || parsedUser.id;`.
- Menambahkan validasi tambahan (*guard clause*): jika setelah fallback `userId` tetap tidak ditemukan, sistem akan menampilkan Toast error "Sesi tidak valid, harap login ulang" ketimbang melanjutkan *request* ke backend yang pasti akan gagal.

## Verification

- ✅ `npx tsc --noEmit` — berhasil (0 error kompilasi TypeScript)
- ✅ `npx vite build` — berhasil (aplikasi ter-build dengan normal)
- Bug terpecahkan. `userId` sekarang pasti terambil dan payload `POST /api/nilai` akan tervalidasi sukses oleh backend.

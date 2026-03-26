# Handover — 2026-03-26 — Dashboard Portfolio & Market UI UX Improvements (spec 037)

## Summary

Mengimplementasikan request *beautification* untuk bagian Portofolio Kamu dan Pasar Kripto di halaman User Dashboard. Sesuai spesifikasi, portofolio yang ditampilkan maksimal hanya 3, dengan memberikan opsi "Lihat Semua" yang akan membuka sebuah modal popup berdesain *Avant-Garde Glassmorphism* menampilkan seluruh portofolio & harga aset beserta total modal.

## Changes Made

### Modified Files (2)

**`Frontend/frontend/src/pages/Dashboard.tsx`**
- Mengubah fungsi map portofolio di beranda (`slice(0, 3)`).
- Menambah tombol *Lihat Semua* apabila ada lebih dari 3 koin.
- Menambahkan layout modal *showAllPortfolio* di *bottom* halaman untuk menampilkan keseluruhan sisa koin dan memberikan visibilitas penuh harga *Current Asset Price*, modal *Invested*, dan *Average Buy*.

**`Frontend/frontend/src/pages/Dashboard.css`**
- Update UI `.portfolio-card` & `.market-card`: 
  - Backdrop blur yang lebih jernih (`rgba(30, 41, 59, 0.35)`).
  - Tweak box-shadow hover state supaya memancarkan *Neon Glow* di masing-masing warna *Profit* (Hijau) atau *Loss* (Merah). 
- Menambahkan kelas-kelas spesifik untuk Modal pop-up Portofolio beserta *custom scrollbar* yang mewah, tersembunyi, minimalis namun tetap fungsional.
- Perbaikan CSS Linter (penambahan standard `background-clip` prefix).

## Verification

- ✅ `npx tsc --noEmit` — Berhasil. Tidak ada *type error*.
- ✅ `npx vite build` — Berhasil *build chunk* dengan sukses tanpa limitasi error UI.

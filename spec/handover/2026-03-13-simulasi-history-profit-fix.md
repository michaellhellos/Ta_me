# Handover: Simulasi Riwayat Profit Calculation Fix (Perbaikan Bug Profit Terlalu Optimis)

**Tanggal:** 2026-03-13
**Status:** IMPLEMENTATION COMPLETE
**Related Spec:** `spec/018.simulasi-history-profit-fix.md`

## 1. Ringkasan Task
User mendapati sebuah bug di halaman Simulasi pada menu **Riwayat Transaksi**. Masalahnya adalah nilai profit/loss semua transaksi riwayat koin dihitung menggunakan angka harga koin yang saat ini sedang dipilih secara aktif oleh pengguna di menu dropdown *Simulasi Trading*. 

Contoh bug: Jika user baru saja menilik grafik **Bitcoin ($65.000)** di simulasi, maka riwayat transaksi **Ethereum (Membeli di rate awal $3.500)** profitnya dihitung membandingkan harga beli $3.500 dengan harga Bitcoin $65.000 (sangat optimis/ngaco). Seharusnya divalidasi ke harga live Ethereum itu sendiri.

## 2. Perubahan yang Dilakukan

1. **`Frontend/frontend/src/pages/Simulasi.tsx`**
   - **Tipe Data `Transaction`:** Menambahkan typing optional property `coinId?: string;` agar TypeScript mengenali properti *coinId* yang sejatinya dikirim oleh API Backend mongoose scheme ke frontend `history` load.
   - **`history.map` Render Logic Patch:**
     Mengganti dependensi `const currentPrice = selectedCoin.current_price;` untuk dirujuk kepada algoritma *Array Find Localization*.
     ```tsx
     // Mencari profil coin yang PERSIS SAMA dengan nama/id koin dari history item ini
     const txCoinMatch = coins.find((c) => c.id === tx.coinId || c.name === tx.name);
     
     // Set price referensi live ke koin asli tersebut (fallback tx.price jika null agar rate profit return stabil %0 netral)
     const currentPrice = txCoinMatch ? txCoinMatch.current_price : tx.price;
     ```

## 3. Hasil Validasi
- **Kode Berjalan Stabil:** Fungsional react build sukses (Vite, Rollup, & TSC).
- **Logika Kalkulasi Akurat:** Render DOM `Simulasi.tsx` pada loop riwayat akan mengisolisasi live price masing-masing koin yang di render. 
- Nilai `percent` dan `profit` untuk riwayat komoditi **apapun** sekarang aman dan dijamin *tidak lagi terpengaruh* oleh pergantian opsi pada Dropdown `selectedCoin` pengguna.

## 4. Next Step
Fix ini sudah live dapat direview/test oleh User di halaman `http://localhost:5173/dashboard` menekan tab **Simulasi**. Cobalah buka beberapa komoditas dan bandingkan stabilitas profit history card.

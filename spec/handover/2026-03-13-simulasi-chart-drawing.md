# Handover: Simulasi Chart Drawing & Annotation (Fitur Coret-coret Chart)

**Tanggal:** 2026-03-13
**Status:** IMPLEMENTATION COMPLETE
**Related Spec:** `spec/017.simulasi-chart-drawing.md`

## 1. Ringkasan Task
User meminta fitur untuk bisa melakukan coret-coret dan menggambar langsung di atas chart halaman Simulasi (`/simulasi`). Implementasinya menggunakan `<canvas>` HTML5 yang dilekatkan secara `absolute` overlay di atas Recharts container.

## 2. Perubahan yang Dilakukan

1. **`Frontend/frontend/src/pages/Simulasi.tsx`**
   - Menambahkan state `drawMode` (`none`, `draw`, `text`) dan `isDrawing`.
   - Menambahkan reference ke `<canvas>` dan rendering context 2D.
   - Menambahkan event listeners pada canvas (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`) untuk merender stroke warna hijau (`#22c55e`) yang seragam dengan aksen desain chart.
   - Menambahkan fungsionalitas insert text prompt menggunakan `ctx.fillText()`.
   - Memasukkan toolbar aksi gambar (Pointer, Draw, Text, Clear) ke dalam `.chart-wrapper` menggunakan absolute positioning.
   - Pointer mutasi `pointer-events: none` pada kanvas ketika `drawMode === 'none'` agar tooltip harga interaktif Recharts tetap berjalan di layar belakang coretan ketika user melepas mode gambar.

2. **`Frontend/frontend/src/pages/Simulasi.css`**
   - Membuat container `.chart-wrapper` memilki `position: relative`.
   - Mengatur styling `.drawing-toolbar` transparan melayang di sudut atas chart.
   - Mengatur layer CSS z-index, pointer-events, top/left positioning dari `.drawing-canvas` supaya tepat menempel pas menutupi Recharts.

3. **`Frontend/frontend/src/App.tsx`**
   - *Fixing Build Errors:* Terdapat TypeScript JSX mismatch syntax di deklarasi `PrivateRoute` dan `AdminRoute` yang mencegah build Rolldown berhasil. Elemen ini diperbaiki menggunakan `React.ReactNode` untuk dependensi standar.

## 3. Hasil Validasi
- **Struktur Tools UI:** Mampu ter-render tepat di atas chart tanpa merusak DOM structure.
- **Draw Tool:** Tool pensil berhasil mencatat garis coretan real-time dan ter-retain dengan baik saat mode di switch ke 'none'.
- **Text Tool:** Berhasil meng-invoke browser prompt dan mencetak string string native di koordinat mouse click.
- **Clear Tool:** Canvas clear API ter-panggil dan bersih seketika.
- **Pointer Fallback:** Custom tooltip default dari `Recharts` tetap tampil jika mode dikembalikan ke default cursor (Pointer), membuktikan DOM Overlay berhasil ditembus secara pointer-event CSS.
- **Build Passed:** `tsc -b && vite build` sukses total.

## 4. Next Step
Sudah production-ready dan dapat direview oleh User. Tidak ada instalasi dependensi atau konfigurasi library pihak ketiga tambahan.

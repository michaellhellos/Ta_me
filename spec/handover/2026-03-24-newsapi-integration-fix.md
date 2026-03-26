# Handover: Integrasi Personal API Key dari NewsAPI
**Tipe Dokumen:** Handover Eksekusi Harian
**Spesifikasi Acuan:** spec/032.newsapi-integration-fix.md
**Tanggal Eksekusi:** 2026-03-24

## 1. Ringkasan Eksekusi (Task Summary)
Setelah dilakukan re-evaluasi atas permintaan klien, arsitektur `fetch` pada `CryptoNewsWidget` berhasil dipindahkan jalurnya dari *fallback API* menuju ke titik **NewsAPI Endpoint Utama**. Kunci otorisasi klien (`82f66afc...`) telah disematkan secara utuh dan sukses, diiringi dengan rekognisi struktur data JSON kustom bawaan entitas NewsAPI.

## 2. Riwayat Perubahan Modifikatif (Changes Orchestrated)
*   **[MODIFIKASI] `Frontend/frontend/src/components/CryptoNewsWidget.tsx`**: 
    1. Pembahuruan *TypeScript Interface* `NewsArticle`, mensubstitusi variabel skema lawas (`imageurl` $\rightarrow$ `urlToImage`, `source_info` $\rightarrow$ `source`, `published_on` $\rightarrow$ `publishedAt`).
    2. Evaluasi blok fetch `data.status === "ok"` dipasang untuk mendeteksi *success parameter*.
    3. Penyulingan respon (`filter`): Meniadakan headline berita transparan/botak yang tiada mengandung elemen gambar (`urlToImage == null`), hal ini sangat vital mempertahankan keutuhan desain grid *glassmorphism* kita.
    4. Mutasi logika `formatTimeAgo` agar mendudukung parameter masukan *ISO-String Date Time* milik NewsAPI.

## 3. Pertimbangan Eksekutor "ULTRATHINK" & Kewaspadaan (Vigilance)
*   **UI Resiliency:** NewsAPI terkadang membludak mengembalikan *junk articles* tanpa thumbnail cover `urlToImage`. Jika tidak difilter, `<img>` elemen akan pecah (*broken link icon*). Oleh karena eksekusi `.filter(a => a.urlToImage)` disusupkan sebelum `.slice(0, 4)` untuk memberikan sensasi antarmuka yang bebas-cacat.
*   **Waktu Relatif:** Waktu sekarang yang terinjeksi melalui UTC di-'parse' sedemikian rupa sehingga klien pada zona waktu (WIB) tetap melihat *relative timing* ("2h ago", "10m ago") dengan sempurna.

## 4. Status Final & Rekomendasi
*   **Status Codebase:** Bersih dan Terefleksikan.
*   **Perhatian API Premium:** Karena menggunakan model otentikasi konvensional, harap awasi jumlah kuota (requests per day) di panel *NewsAPI developer account* Anda. Jika layar menunjukan label "*Gagal memuat berita pasar.*", artinya batas laju permintaan per hari (*Rate Limit/429*) telah ditabrak.

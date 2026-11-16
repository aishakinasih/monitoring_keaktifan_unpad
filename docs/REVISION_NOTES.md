# Catatan revisi berbasis repository asli

## Baseline
ZIP ini diturunkan dari repository yang diberikan pada 16 November 2026. File UI asli, logo, CSS, navigasi, halaman, dan struktur komponen dipertahankan. Tidak menggunakan ZIP redesign sebelumnya sebagai baseline.

## Lingkup perubahan
1. Data contoh mahasiswa di halaman dosen/mahasiswa diganti dengan query MySQL.
2. Dataset diambil dari 100 baris data pada sheet `Halaman 1 - Bobot` workbook Excel.
3. Kolom yang diimpor: NPM, nama, skor kehadiran yang tersimpan pada workbook, nilai tugas, nilai UTS. Kolom Jumlah Alpa dan kolom hasil formula lain tidak diimpor.
4. Kriteria awal dan bobot diinisialisasi dari konfigurasi: Presensi, Tugas, UTS. Dosen dapat menambah kriteria, mengubah bobot, mengecualikan, dan mengaktifkan kembali kriteria. Exclude tidak menghapus nilai.
5. Login dan registrasi menggunakan tabel `users` dan password hash scrypt.
6. Dashboard admin mengambil jumlah akun dan ambang kategori dari database.

## Bagian UI yang sengaja dipertahankan
- Login dan register.
- Dashboard dosen: ringkasan, kelas & presensi, perwalian & EWS, bobot keaktifan, kesiapan audit.
- Panel Buat QR yang memang ada di baseline.
- Dashboard mahasiswa dan dashboard admin.
- Logo, warna, spacing, card, tabel, sidebar, dan gaya visual existing.

## Batasan baseline yang tidak diubah
Pada repository asli, panel QR hanya menampilkan placeholder dan belum terhubung ke API generate/scan QR. Form koreksi presensi juga belum menyimpan koreksi ke backend. Keduanya dipertahankan karena instruksi revisi membatasi perubahan pada database/dataset/kriteria, bukan implementasi fitur baru.

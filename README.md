# Dashboard Monitoring Keaktifan Unpad

Project ini mempertahankan halaman dan susunan UI dari repository asli. Perubahan dibatasi pada penggantian data contoh menjadi data database, import 100 mahasiswa dari Excel, dan konfigurasi kriteria penilaian yang dapat ditambah atau dikecualikan.

## Yang dipertahankan

- Login, registrasi, dashboard dosen, dashboard mahasiswa, dan dashboard admin.
- Navigasi dashboard dosen: Ringkasan, Kelas & Presensi, Perwalian & EWS, Bobot Keaktifan, dan Kesiapan Audit.
- Panel Buat QR pada halaman Kelas & Presensi tetap ada dengan tampilan dan alur UI baseline. Pada repository asli, panel QR tersebut masih berupa placeholder UI dan belum memiliki API pembuat/scan QR; revisi ini tidak menghapus atau mengklaim mengaktifkan alur tersebut.
- Logo, warna, layout, dan styling existing.

## Perubahan yang dilakukan

- Dataset mahasiswa berasal dari 100 baris pada sheet `Halaman 1 - Bobot` file Excel. Yang diambil hanya NPM, Nama, Skor Kehadiran, Nilai Tugas, dan Nilai UTS. Kolom Jumlah Alpa tidak diimpor dan tidak disimpan.
- Kriteria awal: Presensi (15%), Tugas (35%), UTS (50%). Bobot awal berasal dari workbook.
- Dosen dapat mengubah bobot, menambah kriteria, mengecualikan kriteria dari perhitungan, dan mengaktifkannya kembali. Exclude hanya mengubah status aktif; nilai lama tidak dihapus.
- Dashboard dosen dan mahasiswa mengambil mahasiswa, mata kuliah, kriteria, nilai, dan skor dari MySQL.
- Login dan registrasi menggunakan akun database dengan password hash scrypt.

## Persyaratan

- Node.js 20.9 atau lebih baru.
- MySQL 8 / MariaDB yang kompatibel.

## Instalasi Windows + XAMPP

1. Extract ZIP.
2. Start MySQL pada XAMPP. Apache diperlukan jika menggunakan phpMyAdmin.
3. Buka `http://localhost/phpmyadmin`.
4. Import `database/schema.sql`. File ini membuat database baru `db_monitoring_keaktifan_app` dan tidak menghapus database lama lain.
5. Copy `.env.example` menjadi `.env.local` di root project.
6. Isi `INITIAL_COURSE_CODE`, `INITIAL_COURSE_NAME`, dan `INITIAL_CLASS_NAME` sesuai mata kuliah sebenarnya. Isi juga password dosen, admin, dan password awal mahasiswa.
7. Jalankan:

```bash
npm install
npm run db:seed
npm run dev
```

8. Buka `http://localhost:3000/login`.

## Akun awal

- Dosen: email dari `SEED_DOSEN_USERNAME`, password dari `SEED_DOSEN_PASSWORD`.
- Admin: email dari `SEED_ADMIN_USERNAME`, password dari `SEED_ADMIN_PASSWORD`.
- Mahasiswa: email berbentuk `<NPM>@mail.unpad.ac.id`, password dari `STUDENT_INITIAL_PASSWORD`.

Seed memuat tepat 100 NPM unik. Menjalankan seed ulang tidak membuat akun/relasi ganda dan tidak menimpa password maupun nilai yang sudah diedit.

## Catatan data

Workbook tidak menyediakan nama mata kuliah, kelas, jadwal, atau email mahasiswa. Nama mata kuliah/kelas diambil dari `.env.local`. Email mahasiswa dibentuk konsisten dari NPM (`NPM@mail.unpad.ac.id`) agar dapat memakai halaman login email existing. Tidak ada kolom atau kriteria Alpa di database baru.

## Deployment Vercel

Aplikasi membutuhkan MySQL yang dapat diakses dari internet (managed MySQL), bukan MySQL lokal XAMPP. Buat database dari `database/schema.sql`, jalankan seed terhadap database production satu kali dari lingkungan lokal yang memiliki akses ke database tersebut, lalu masukkan variabel DB dan akun awal yang diperlukan ke Vercel Project Settings → Environment Variables. Jangan mengunggah `.env.local` ke GitHub.

## Batasan yang diwarisi dari repository asli

Panel QR dan form koreksi presensi pada baseline belum terhubung ke API presensi. Revisi ini mempertahankan tampilannya dan tidak menambahkan implementasi fitur lain di luar lingkup yang diminta.

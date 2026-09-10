# ImpactQuest

Aplikasi web misi sosial. Pengguna mengikuti misi, mengunggah bukti
berupa foto, melewati verifikasi oleh admin, kemudian memperoleh XP,
Impact Points, badge, dan reward simulasi. Angka dampak yang tampil
di halaman publik hanya dihitung dari submission yang disetujui.

Repositori ini merupakan prototype lomba. Aplikasi dirancang agar
dapat berjalan luring sepenuhnya: satu aplikasi Next.js, database
SQLite satu berkas, tanpa layanan eksternal yang perlu dijalankan.

## Menjalankan aplikasi

Membutuhkan Node.js 22 ke atas.

```bash
npm install
npm run db:setup
npm run dev
```

Kemudian buka http://localhost:3000.

Build produksi:

```bash
npm run build
npm run start
```

## Akun demo

Perintah `npm run db:reset` mengembalikan database ke kondisi awal
sesuai tabel berikut.

| Email | Password | Kondisi awal |
|---|---|---|
| demo@impactquest.local | demo1234 | USER, XP 1900, 470 poin |
| admin@impactquest.local | admin1234 | ADMIN |
| org@impactquest.local | org1234 | ORGANIZATION |

## Skenario demo lima menit

Gunakan dua peramban atau dua profil berbeda, satu untuk demo dan
satu untuk admin.

1. Masuk sebagai demo. Buka "Clean Your Neighborhood", klik Ikut.
   Simpan kode bukti yang tampil (`IQ-XXXXXX`).
2. Buka Misi Saya, klik Submit bukti. Unggah foto sebelum dan
   sesudah, tulis deskripsi, masukkan kode bukti, isi 3 kg.
   Kirim. Status menjadi PENDING.
3. Masuk sebagai admin di peramban kedua. Buka Antrian, klik
   submission tersebut. Klik Mulai review, isi verified 3 kg,
   klik Approve.
4. Kembali ke peramban demo:
   - XP berubah dari 1900 menjadi 2000, level naik dari Advocate
     menjadi Changemaker
   - poin berubah dari 470 menjadi 500
   - badge Eco Starter terbuka dan tiga notifikasi masuk
5. Buka Reward. Tukarkan Coffee Voucher seharga 500 poin. Saldo
   menjadi 0 dan kode demo tampil di Riwayat.
6. Buka Community. Sampah terkumpul bertambah 3 kg dari baseline
   (12.000 menjadi 12.003).

## Pemeriksaan mandiri oleh juri

Misi berstatus DRAFT tidak tampil kepada pengguna, hanya misi
ACTIVE. Satu misi hanya memiliki satu slot aktif per pengguna,
dilengkapi proof code unik dan batas waktu submit, serta dapat
dibatalkan sebelum submit. Foto yang diterima terbatas pada JPG,
PNG, dan WEBP dengan ukuran maksimal 5 MB per berkas, dan isi
berkas diperiksa selain ekstensinya. Kode bukti yang salah atau
pengiriman ganda ditolak disertai pesan yang jelas. Berkas bukti
hanya dapat dibuka oleh pemilik dan admin melalui route khusus.

Setiap submission memperoleh skor risiko beserta penjelasan flag:
berkas kembar, kode salah, pengiriman terlalu sering, dan akun
baru. Skor tersebut tidak menyetujui atau menolak apa pun,
keputusan tetap berada pada admin. Halaman review admin memuat
bukti foto, perbandingan reported dan verified yang dapat
dikoreksi, riwayat pengguna, dan jejak audit.

Approve dieksekusi dalam satu transaksi yang mencakup status,
verified impact, XP dan poin yang dibaca dari data misi (bukan
dari input peramban), ledger, badge, notifikasi level, dan log.
Approve yang dikirim dua kali tidak memberikan reward ganda.
Penolakan wajib menyertakan alasan. Revisi hanya diperbolehkan
sekali, berkas lama digantikan berkas baru, kemudian submission
kembali ke antrian.

Penukaran poin mengurangi stok tepat satu dan mencatat ledger,
kode demo, serta notifikasi. Saldo yang kurang dan stok yang
habis ditangani dengan pesan yang jelas. XP tidak berkurang
ketika poin ditukarkan. Tersedia pula portfolio terverifikasi,
dampak komunitas, leaderboard berbasis XP, notifikasi, kelola
misi dan reward oleh admin, analitik, halaman campaign, dan
dashboard organisasi.

Pengujian E2E sebanyak 22 langkah mencakup loop demo di atas
beserta kasus negatif. Seluruhnya lolos di Brave. Skrip tersedia
di `e2e/` dan dijalankan dengan `npm run test:e2e` selagi server
berjalan.

## Aturan yang dijaga oleh kode

Submission yang belum disetujui tidak menghasilkan XP, poin,
badge, maupun dampak. Identitas pengguna selalu diambil dari
sesi di server, bukan dari parameter request.

## Isi repositori

Logika domain berada di `lib/` (auth, missions, participation,
submissions, evidence, risk, verification, gamification,
rewards, impact, campaigns, analytics), sedangkan halaman
mengikuti konvensi App Router di `app/`. Skema database ada di
`db/schema.sql` dan seed di `scripts/db-setup.mjs`. Dokumen
perancangan: `PRD.md`, `BUSINESS_RULES.md`, `DATABASE.md`,
`IMPLEMENTATION_PLAN.md`.

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | server development |
| `npm run build` | build produksi |
| `npm run start` | menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | pemeriksaan TypeScript |
| `npm run db:setup` / `db:reset` | membuat dan mengisi database |
| `npm run test:e2e` | E2E Playwright dan Brave |

## Batasan

Reward bersifat simulasi. Tidak terdapat uang nyata, payment,
KYC, maupun dompet. Tidak ada AI yang menyetujui atau menolak.
Tidak tersedia feed, chat, komentar, maupun video. Database satu
berkas dan bukti di folder lokal memadai untuk demo luring,
tetapi bukan arsitektur produksi. Grafik analitik dirender di
sisi klien.

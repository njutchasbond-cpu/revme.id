# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Tap to Review: Kartu NFC + QR Google Review dengan Sistem First-Tap Claim

* **Dokumen:** Product Requirement Document (PRD) — Final Specification
* **Target Audience:** UMKM, Kafe, Restoran, Klinik, Salon, & Toko Retail
* **Tech Stack:** Next.js (App Router, TypeScript, Tailwind CSS), Supabase (Auth & PostgreSQL), Google Places API
* **Status:** Approved / Ready for Development

---

## 1. Executive Summary & Objective

### 1.1 Latar Belakang
Mengumpulkan ulasan Google Maps (Google Review) adalah cara paling efektif bagi bisnis lokal untuk meningkatkan ranking SEO lokal dan mendatangkan pelanggan baru. Namun, meminta ulasan secara manual memiliki tingkat gesekan (*friction*) yang tinggi: pelanggan harus membuka aplikasi Google Maps, mencari nama toko secara manual, masuk ke tab ulasan, baru menulis ulasan.

### 1.2 Solusi Produk
Produk fisik berupa **Kartu PVC / Acrylic Stand** yang dilengkapi:
1. **Chip NFC (NTAG213)**: Sentuh bagian belakang smartphone ke kartu untuk membuka ulasan instan.
2. **Dynamic QR Code**: Alternatif bagi smartphone tanpa fitur NFC aktif.

### 1.3 Keunggulan Utama: Sistem First-Tap Claim
Kartu diproduksi secara massal dengan desain generik dan tautan unik serial (`ulas.id/c/[KODE]`).
* **Zero Pre-Order (Ready Stock):** Tidak perlu menunggu link Google dari pembeli saat proses produksi kartu.
* **First-Tap Claim:** Pembeli pertama yang men-tap/scan kartu langsung menjadi pemilik sah dan mengunci kartu tersebut ke bisnisnya hanya dengan mencari nama toko di Google Maps (< 60 detik).
* **Zero PIN / Voucher Gosok:** Tidak ada kode rahasia fisik yang merepotkan. Kartu otomatis terkunci setelah pemilik pertama menyelesaikan onboarding singkat.

---

## 2. Peran Pengguna (User Roles)

| Peran | Deskripsi | Akses & Wewenang |
| :--- | :--- | :--- |
| **Super Admin (DW)** | Pemilik platform / tim operasional | Generate batch kode kartu, ekspor CSV untuk vendor cetak, monitoring status kartu, *force reset* kartu jika salah klaim. |
| **Business Owner (Merchant)** | Pemilik toko/UMKM pembeli kartu | Mengklaim kartu via First-Tap Claim, memperbarui Place ID/link ulasan, melihat statistik total tap harian/bulanan. |
| **End Customer** | Pelanggan toko yang berkunjung | Men-tap/scan kartu di kasir; langsung diarahkan ke form ulasan Google bintang 5. |

---

## 3. Alur Pengguna (User Journey)

### 3.1 Alur Aktivasi Mandiri (First-Tap Claim Journey)
1. Pembeli menerima paket kartu fisik dari kurir.
2. Pembeli menempelkan HP ke chip NFC atau memindai QR Code di kartu.
3. Browser HP membuka URL `https://ulas.id/c/[KODE]`.
4. Sistem mendeteksi `status == 'unclaimed'`:
   * Mengalihkan pengunjung ke halaman onboarding `/claim/[KODE]`.
5. Pembeli menyelesaikan 3 langkah dalam 1 layar:
   * **Langkah 1:** Ketik nama bisnis di kotak pencarian (didukung Google Places Autocomplete). Pilih toko yang sesuai.
   * **Langkah 2:** Masukkan nomor WhatsApp atau Login dengan Google/Email untuk mengikat kepemilikan akun.
   * **Langkah 3:** Klik tombol **"Kunci & Aktifkan Kartu"**.
6. Sistem menyimpan data, mengubah status kartu menjadi `active`.
7. Kartu langsung siap diletakkan di meja kasir.

### 3.2 Alur Pemakaian Sehari-hari (Customer Tap Journey)
1. Pelanggan selesai melakukan pembayaran di meja kasir.
2. Kasir mempersilakan pelanggan melakukan tap atau scan kartu ulasan.
3. Browser HP pelanggan mengakses `https://ulas.id/c/[KODE]`.
4. Sistem mendeteksi `status == 'active'`:
   * Mencatat data analitik (timestamp, jenis perangkat, OS).
   * Melakukan HTTP Redirect 302 seketika (< 200 ms) ke URL ulasan resmi:
     `https://search.google.com/local/writereview?placeid=[PLACE_ID]`.
5. Di HP pelanggan, aplikasi Google Maps atau browser langsung menampilkan modal pop-up bintang 5 siap kirim.

---

## 4. Arsitektur Sistem & Spesifikasi Teknis

### 4.1 Tech Stack
* **Frontend & Backend Framework:** Next.js 14+ (App Router, Server Actions, Edge Middleware).
* **Styling & UI:** Tailwind CSS, Lucide React Icons, Shadcn UI / Radix Primitives.
* **Database & Auth:** Supabase (PostgreSQL + Supabase Auth OTP/OAuth).
* **External API:** Google Places API (Place Autocomplete & Place Details).
* **Deployment:** Vercel (Edge Network untuk latensi redirect global < 100ms) atau VPS / Cloudflare Workers.

### 4.2 Skema Database (Supabase PostgreSQL)

```sql
-- 1. Tabel Kartu (Cards)
CREATE TYPE card_status AS ENUM ('unclaimed', 'active', 'inactive');

CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,       -- Kode unik, misal: 'A1B2C3' atau '0001'
    status card_status DEFAULT 'unclaimed',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_name VARCHAR(255),
    business_address TEXT,
    google_place_id VARCHAR(255),
    review_url TEXT,                              -- https://search.google.com/local/writereview?placeid=...
    batch_number VARCHAR(50),                     -- Batch produksi, misal: 'BATCH-2026-11'
    tap_count INT DEFAULT 0,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cards_short_code ON cards(short_code);
CREATE INDEX idx_cards_owner_id ON cards(owner_id);

-- 2. Tabel Log Tap (Analytics)
CREATE TABLE tap_logs (
    id BIGSERIAL PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    device_type VARCHAR(20),                      -- 'iOS', 'Android', 'Desktop', 'Unknown'
    user_agent TEXT,
    ip_hash VARCHAR(64),                          -- Anonymized IP hash untuk deteksi bot/spam
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tap_logs_card_id ON tap_logs(card_id);
CREATE INDEX idx_tap_logs_created_at ON tap_logs(created_at);
```

### 4.3 Spesifikasi Modul Software

#### Modul 1: Ultra-Fast Redirect Engine (`/c/[code]`)
* Rute dinamis berlatensi rendah.
* Menggunakan Next.js Edge Runtime / Route Handler.
* Mengecek status kartu:
  * Jika `unclaimed` -> Redirect 307 ke `/claim/[code]`.
  * Jika `inactive` -> Menampilkan halaman bahwa kartu dinonaktifkan sementara.
  * Jika `active` -> Menambah hitungan `tap_count` (asynchronous fire-and-forget), lalu redirect 302 ke `review_url`.

#### Modul 2: First-Tap Claim Wizard (`/claim/[code]`)
* Antarmuka bersih, responsif, dan optimal di layar smartphone.
* Input autocomplete Google Places:
  * Mengetik nama bisnis -> memanggil Google Places API via route server internal (API key terproteksi).
  * Menampilkan nama toko, alamat, dan thumbnail foto lokasi agar pembeli tidak salah pilih cabang.
* Mengunci akun:
  * Integrasi Supabase Auth (OTP WhatsApp / Magic Link / Google Sign-In).
  * Begitu terkonfirmasi, status kartu di database berubah menjadi `active` secara atomic.

#### Modul 3: Portal Merchant (`/dashboard`)
* Ringkasan performa:
  * Total tap sepanjang waktu.
  * Grafik tap harian / mingguan.
  * Preview link Google Review aktif.
* Pengaturan Toko:
  * Kemampuan mengubah target Place ID jika toko pindah alamat.
  * Unduh salinan QR code digital (resolusi tinggi).

#### Modul 4: Super Admin Portal (`/admin`)
* **Batch Generator:**
  * Masukkan jumlah kartu (misal: 100, 500, 1.000).
  * Tentukan format serial (misal prefix: `DW-` + 5 karakter alfanumerik acak atau nomor urut).
  * Sistem membuat data kartu di database dengan status `unclaimed`.
  * Tombol **"Download CSV untuk Percetakan"** berisi kolom:
    * `Short Code`
    * `Full Redirect URL` (`https://ulas.id/c/[KODE]`)
    * `Batch Number`
* **Card Management:**
  * Pencarian kartu berdasarkan short code atau email pemilik.
  * Fitur **"Force Reset to Unclaimed"**: Membatalkan klaim kartu jika ada kesalahan aktivasi, mengembalikan status kartu seperti baru keluar dari pabrik.

---

## 5. Spesifikasi Fisik & Produksi Massal

### 5.1 Spesifikasi Kartu Fisik
* **Ukuran Fisik:** Standard CR80 / ISO 7810 ID-1 (85.6 mm x 54 mm, ketebalan 0.84 mm).
* **Material:** PVC Premium dengan pelapis tahan air & anti gores (Laminated Matte / Glossy finish).
* **Chip NFC:** **NXP NTAG213**
  * Frekuensi: 13.56 MHz (ISO/IEC 14443 Type A).
  * Memori NDEF: 144 Bytes (sangat cukup untuk URL pendek `https://ulas.id/c/XXXX`).
  * Kompatibel penuh: iPhone (iOS 11+ background tag reading) dan Android NFC.
* **Cetak QR Code:**
  * Minimal ukuran 1.8 x 1.8 cm di bagian belakang/depan kartu dengan kontras tinggi (hitam di atas putih).
  * Dicetak dengan metode *Variable Data Printing (VDP)* sesuai CSV serial batch.

### 5.2 Standar Operasional Prosedur (SOP) Produksi
1. Admin men-generate 1.000 kode unik di Super Admin Dashboard dan mengekspor CSV.
2. File CSV diserahkan ke vendor percetakan kartu PVC pintar:
   * Vendor memprogram chip NFC secara massal (*bulk NDEF encoding*).
   * Vendor mencetak QR code berurutan pada tiap kartu sesuai URL di CSV.
3. Kartu diterima oleh tim DW.
4. Tim DW mengambil 5 kartu sampel acak untuk uji coba (*tap & scan test*).
5. Kartu dimasukkan ke kemasan amplop petunjuk dan langsung masuk ke gudang *ready stock*.

---

## 6. Kepatuhan Kebijakan Google & Mitigasi Risiko

### 6.1 Google Review Policy Compliance
* **Tidak Ada Review Gating:** Sistem ini mengarahkan 100% pengguna langsung ke halaman ulasan resmi Google tanpa menyaring rating bintang (1–5). Hal ini mematuhi sepenuhnya kebijakan ulasan Google Maps (*Google Customer Review Guidelines*) dan mencegah akun Google Bisnis pembeli terkena penangguhan (*suspension*).

### 6.2 Mitigasi Risiko Khusus First-Tap Claim

| Risiko Potensial | Dampak | Solusi & Mitigasi |
| :--- | :--- | :--- |
| **Kartu di-tap oleh kurir/orang lain di jalan** | Orang asing membuka halaman aktivasi | Kartu hanya akan terkunci jika orang tersebut menyelesaikan login nomor HP/Google dan menyimpan nama toko. Jika sekadar dibuka lalu ditutup, status kartu tetap `unclaimed`. |
| **Kartu terlanjur diaktifkan orang yang salah** | Pembeli asli tidak bisa klaim | Pembeli menghubungi layanan bantuan DW -> Admin mencari nomor seri kartu di Admin Portal -> Klik *"Force Reset"* -> Kartu langsung bisa diklaim kembali oleh pembeli asli. |
| **Pembeli pindah lokasi toko** | Link ulasan mengarah ke alamat lama | Pembeli cukup login ke dashboard `ulas.id` dan memperbarui lokasi usahanya secara instan tanpa perlu ganti kartu fisik. |
| **Domain ulas.id kadaluarsa** | Kartu fisik mati | Domain redirect wajib didaftarkan multi-tahun (3–5 tahun) dengan sistem auto-renewal aktif. |

---

## 7. Roadmap Implementasi Teknis

### Fase 1: MVP Core (Fokus Utama Sekarang)
- [ ] Inisialisasi Project Next.js (App Router, Tailwind CSS, TypeScript).
- [ ] Setup Supabase (Skema tabel `cards` & `tap_logs`, RLS Policy, Supabase Auth).
- [ ] Bangun Endpoint Redirect Engine ultra-cepat (`/c/[code]`).
- [ ] Bangun Halaman Onboarding First-Tap Claim (`/claim/[code]`) dengan Google Places Autocomplete.
- [ ] Bangun Dashboard Super Admin sederhana untuk generate batch kode kartu & ekspor CSV.
- [ ] Pengujian end-to-end (Simulasi Tap -> Claim -> Redirect).

### Fase 2: Merchant Experience & Analytics
- [ ] Dashboard analitik untuk merchant (total tap, perbandingan mingguan).
- [ ] Notifikasi ringkasan mingguan via WhatsApp ke merchant.



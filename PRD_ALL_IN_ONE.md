# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Smart Business Hub: Kartu NFC dan Dynamic QR All-in-One dengan Sistem First-Tap Claim

* Dokumen: Product Requirement Document (PRD) - All-in-One Specification
* Target Audiens: Kafe, Restoran, Klinik, Salon, Toko Ritel, dan UMKM
* Tech Stack: Next.js (App Router, TypeScript, Tailwind CSS), Supabase (PostgreSQL dan Auth), Google Places API
* Status: Draft Final / Ready for Review

---

## 1. Executive Summary dan Objective

### 1.1 Latar Belakang
Pelaku usaha lokal menghadapi tantangan dalam menyajikan informasi penting kepada pelanggan yang datang langsung ke gerai fisik. Membagikan informasi terpisah seperti password WiFi, akun media sosial, buku menu, tautan situs web, hingga permintaan ulasan Google sering kali tidak efektif dan membuat area kasir atau meja makan dipenuhi oleh berbagai macam akrilik dan stiker promosi yang terpisah.

### 1.2 Solusi Produk
Menghadirkan satu kartu fisik pintar (PVC Card atau Acrylic Table Stand) yang dilengkapi dengan:
1. Chip NFC (NTAG213): Cukup ditempelkan ke bagian belakang ponsel pintar pengunjung.
2. Dynamic QR Code: Dapat dipindai menggunakan kamera ponsel bagi perangkat tanpa sensor NFC.

Kartu ini mengarahkan pengunjung ke satu halaman profil digital (Smart Business Hub) yang cepat, terpusat, dan responsif, memuat seluruh kanal interaksi bisnis dalam satu layar.

### 1.3 Keunggulan Utama
1. Ready Stock dan Produksi Massal: Kartu dicetak menggunakan tautan unik generik (misalnya: ulas.id/c/[KODE]) tanpa perlu mengumpulkan data bisnis sebelum pencetakan.
2. First-Tap Claim: Pembeli kartu mengaktifkan kepemilikan bisnisnya secara mandiri hanya dalam 1 menit saat kartu pertama kali disentuh atau dipindai.
3. Dual Mode Operation: Pemilik toko dapat beralih antara Mode Smart Hub (All-in-One) dan Mode Direct Review (langsung menuju form ulasan Google) sesuai kebutuhan kampanye toko.

---

## 2. Fitur Utama Smart Business Hub (All-in-One Links)

Halaman profil bisnis yang diakses pengunjung memuat komponen-komponen berikut:

1. Profil Bisnis:
   * Logo atau foto toko
   * Nama bisnis resmi
   * Alamat singkat dan jam operasional

2. Tautan Ulasan Google Maps:
   * Tombol sorotan utama (bintang ulasan)
   * Mengarahkan langsung ke jendela ulasan Google Maps resmi

3. Koneksi WiFi Instan:
   * Menampilkan nama jaringan (SSID)
   * Tombol satu klik untuk menyalin kata sandi WiFi
   * Opsi kode QR khusus protokol jaringan WiFi untuk koneksi otomatis

4. Menu dan Katalog Produk:
   * Tautan langsung ke dokumen menu digital (PDF, Google Drive, atau portal menu online)

5. Portofolio Layanan dan Reservasi:
   * Tautan daftar harga dan jenis layanan
   * Tombol pintas pemesanan via WhatsApp

6. Kanal Media Sosial:
   * Tombol profil Instagram dengan deep link (langsung membuka aplikasi Instagram jika terpasang)
   * Tombol profil TikTok dengan deep link serupa

7. Situs Web dan Informasi Tambahan:
   * Tautan ke situs resmi toko
   * Peta penunjuk arah via Google Maps

---

## 3. Peran Pengguna (User Roles)

| Peran | Deskripsi | Hak Akses dan Fungsi |
| :--- | :--- | :--- |
| Super Admin | Tim operasional platform | Menghasilkan kode kartu secara massal, ekspor CSV percetakan, monitoring kartu, serta reset paksa kepemilikan kartu. |
| Merchant (Pemilik Toko) | Pemilik atau pengelola bisnis | Melakukan klaim kartu via First-Tap Claim, mengelola tautan All-in-One, memilih mode operasional kartu, dan memantau analitik interaksi. |
| End Customer | Pengunjung toko fisik | Menempelkan atau memindai kartu untuk mengakses hub informasi dan memberikan ulasan. |

---

## 4. Alur Pengguna (User Journey)

### 4.1 Alur Aktivasi Mandiri (First-Tap Claim)
1. Pembeli menerima paket kartu fisik dari kurir.
2. Pembeli menempelkan ponsel ke chip NFC atau memindai QR Code di kartu.
3. Sistem mendeteksi status kartu masih 'unclaimed' dan mengarahkan ke halaman aktivasi /claim/[KODE].
4. Pembeli menyelesaikan proses aktivasi dalam 3 tahap singkat:
   * Tahap 1: Mencari nama bisnis menggunakan Google Places Autocomplete untuk mengisi data nama, alamat, dan link ulasan otomatis.
   * Tahap 2: Mengisi informasi tambahan (akun Instagram, TikTok, SSID/Password WiFi, tautan menu, dan situs web).
   * Tahap 3: Melakukan verifikasi login akun pemilik (Google Sign-In atau nomor telepon/WhatsApp).
5. Sistem mengubah status kartu menjadi 'active'. Kartu siap dipajang di meja toko.

### 4.2 Alur Pemakaian Pelanggan (Customer Tap Journey)
1. Pelanggan menempelkan ponsel ke kartu di meja atau area kasir.
2. Sistem mengevaluasi mode kartu:
   * Jika Mode 'smart_hub': Sistem menampilkan halaman web profil toko yang memuat seluruh tautan.
   * Jika Mode 'direct_review': Sistem langsung mengalihkan browser ke halaman form ulasan Google Maps.
3. Setiap tap dan interaksi klik pada masing-masing tombol dicatat ke dalam database untuk keperluan analitik merchant.

---

## 5. Arsitektur Teknis dan Skema Database

### 5.1 Tech Stack
* Frontend dan Backend: Next.js (App Router, Server Actions, Edge Handlers)
* UI dan Desain: Tailwind CSS, Shadcn UI / Radix Primitives
* Basis Data dan Autentikasi: Supabase (PostgreSQL dan Supabase Auth)
* Integrasi Eksternal: Google Places API (Autocomplete dan Details)
* Infrastruktur: Vercel Edge Network untuk kecepatan loading halaman di bawah 1 detik

### 5.2 Skema Database (Supabase PostgreSQL)

```sql
-- 1. Tipe Data Enum
CREATE TYPE card_status AS ENUM ('unclaimed', 'active', 'inactive');
CREATE TYPE card_mode AS ENUM ('smart_hub', 'direct_review');

-- 2. Tabel Kartu dan Konfigurasi Bisnis
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,
    status card_status DEFAULT 'unclaimed',
    mode card_mode DEFAULT 'smart_hub',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Informasi Dasar Bisnis
    business_name VARCHAR(255),
    business_category VARCHAR(100),
    business_address TEXT,
    logo_url TEXT,
    google_place_id VARCHAR(255),
    google_review_url TEXT,
    
    -- Konfigurasi Tautan All-in-One
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    menu_url TEXT,
    services_url TEXT,
    instagram_username VARCHAR(100),
    tiktok_username VARCHAR(100),
    website_url TEXT,
    whatsapp_number VARCHAR(30),
    
    -- Pengaturan Tampilan
    theme_preset VARCHAR(50) DEFAULT 'default',
    
    -- Data Produksi dan Operasional
    batch_number VARCHAR(50),
    total_taps INT DEFAULT 0,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cards_short_code ON cards(short_code);
CREATE INDEX idx_cards_owner_id ON cards(owner_id);

-- 3. Tabel Log Analitik Tap dan Klik Tombol
CREATE TABLE interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'card_tap', 'click_review', 'click_wifi', 'click_menu', 'click_instagram', dsb.
    device_type VARCHAR(20),               -- 'iOS', 'Android', 'Desktop', 'Unknown'
    user_agent TEXT,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interaction_logs_card_id ON interaction_logs(card_id);
CREATE INDEX idx_interaction_logs_type ON interaction_logs(interaction_type);
CREATE INDEX idx_interaction_logs_created_at ON interaction_logs(created_at);
```

---

## 6. Spesifikasi Fisik dan Produksi

### 6.1 Spesifikasi Kartu Fisik
* Dimensi: Standar ID-1 / CR80 (85.6 mm x 54.0 mm, ketebalan 0.84 mm)
* Material: PVC Solid berdaya tahan tinggi, tahan air, dan lapisan anti pudar
* Chip NFC: NXP NTAG213
  * Frekuensi: 13.56 MHz
  * Memori NDEF: 144 Bytes (mencukupi untuk URL pendek ulas.id/c/[KODE])
  * Kompatibilitas: Seluruh varian iPhone (iOS 11+) dan ponsel pintar Android ber-NFC
* Pencetakan QR Code: Variable Data Printing (VDP) presisi tinggi dengan rasio kontras maksimal

### 6.2 Standar Operasional Produksi Massal
1. Super Admin membuat batch nomor seri kartu baru di dashboard dan mengunduh berkas CSV.
2. Vendor percetakan menyuntikkan data URL ke chip NFC serta mencetak QR Code unik pada setiap unit kartu.
3. Tim melakukan kendali mutu (quality check) pada unit sampel sebelum didistribusikan ke gudang penyimpanan.

---

## 7. Kepatuhan Kebijakan dan Keamanan

1. Kepatuhan Google Maps: Tidak menggunakan sistem penyaringan ulasan (review gating). Tombol ulasan tetap mengarahkan secara transparan ke form resmi Google.
2. Keamanan WiFi: Kata sandi WiFi yang disimpan di basis data hanya ditampilkan pada halaman profil milik pelanggan fisik yang men-tap kartu.
3. Integritas Kepemilikan: Pembeli yang keliru memasukkan data atau mengalami kendala klaim dapat meminta pemulihan (Force Reset) melalui Super Admin.

---

## 8. Rencana Tahap Implementasi

### Fase 1: MVP Core (Smart Hub dan Onboarding)
* Inisialisasi proyek Next.js, Supabase, dan TypeScript.
* Pembangunan skema database dan autentikasi.
* Pembangunan mesin redirect dan halaman render Smart Business Hub (/c/[KODE]).
* Pembangunan wizard aktivasi mandiri First-Tap Claim (/claim/[KODE]).
* Pembuatan portal Super Admin untuk membuat batch kartu dan ekspor berkas percetakan.

### Fase 2: Pengaturan Merchant dan Analitik Interaksi
* Dashboard pengelola bagi pemilik toko untuk mengubah tautan (menu, password WiFi, media sosial).
* Fitur pengalihan mode kartu (Smart Hub atau Direct Review).
* Halaman analitik metrik (jumlah tap kartu, tombol tautan yang paling sering diklik pengunjung).


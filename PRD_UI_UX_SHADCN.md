# PRODUCT REQUIREMENT DOCUMENT (PRD)
## SmartHub Card 2.0: Redesign UI/UX & Arsitektur Multi-Komponen (`React`, `Tailwind CSS`, `shadcn/ui`)

* **Dokumen:** Product Requirement Document (PRD) — UI/UX Redesign & Component Architecture
* **Cakupan Utama:**
  1. **Landing Page & Interactive Simulator (`/`)** — `src/app/page.tsx`
  2. **Customer SmartHub Microsite (`/c/[code]`)** — `src/app/c/[code]/SmartHubClient.tsx`
* **Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, `shadcn/ui` Primitives, Lucide Icons
* **Status:** Approved & Implemented

---

## 1. Struktur Arsitektur Multi-Komponen

### 1.1 Komponen `shadcn/ui` (`src/components/ui/`)
* `button.tsx` — Komponen tombol aksesibel dengan varian (`default`, `primary`, `emerald`, `amber`, `outline`, `secondary`, `ghost`), ukuran sentuh minimum `44px`, dan indikator fokus keyboard (`focus-visible:ring-2`).
* `badge.tsx` — Pill status & label kategori dengan rasio kontras tinggi di atas permukaan gelap.
* `card.tsx` — Container kartu glassmorphism gelap (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
* `tabs.tsx` — Komponen tab aksesibel (`role="tablist"`, `role="tab"`, `role="tabpanel"`) dengan `defaultValue`.
* `slider.tsx` — Input rentang interaktif dengan indikator track visual.
* `dialog.tsx` — Modal berbasis elemen `<dialog closedby="any">` native dengan `showModal()`, `::backdrop` blur, dan *light-dismiss* fallback.

### 1.2 Suite Komponen Landing Page (`src/components/landing/`)
* `NavbarHeader.tsx` — Navigasi atas *sticky* dengan tautan seksi dan akses cepat ke Admin Portal.
* `InteractiveSimulator.tsx` — Simulator interaktif 2 kolom (Kartu NFC 3D + Layar Smartphone Interaktif) lengkap dengan:
  * Sakelar `Tabs` (*1. Mode Smart Hub* vs *2. Mode Direct Review*).
  * 4 Preset Persona Bisnis 1-Klik (*Distro & Retail - Alone Wear Brand*, *Kafe & Roastery*, *Barbershop & Salon*, *Restoran & Kuliner*).
  * Simulasi tombol `Salin Sandi` langsung di dalam layar HP.
* `ReviewGapCalculator.tsx` — Kalkulator target rating Google Maps (4.7 / 4.8 / 4.9 Bintang) dengan slider interaktif.
* `SmartBundleRecommender.tsx` — Rekomendasi formasi titik pasang kartu berdasarkan jenis usaha.
* `HowItWorksSection.tsx` — 3 langkah aktivasi mandiri *First-Tap Claim* 60 detik & CTA konversi bawah.

### 1.3 Suite Komponen SmartHub Pelanggan (`src/components/smarthub/`)
* `theme.ts` — Konfigurasi multi-tema (`default`, `emerald`, `amber`, `rose`).
* `ProfileHeaderCard.tsx` — Kartu identitas bisnis terverifikasi, badge kategori, tautan alamat Google Maps langsung, dan tombol *Bagikan*.
* `GoogleReviewHeroCTA.tsx` — Tombol utama ulasan bintang 5 Google Maps dengan efek kilau (*shimmer*) dan indikator 5 bintang.
* `WifiConnectCard.tsx` — Kartu WiFi pengunjung dengan tombol **Salin Sandi** instan serta tombol **QR WiFi** (membuka modal QR Code standar `WIFI:T:WPA;S:...` untuk koneksi otomatis).
* `BentoActionGrid.tsx` — Mengelompokkan tautan menjadi 2 tingkat hierarki:
  1. **Layanan Utama (Full-Width):** Buku Menu & Katalog, Layanan & Reservasi, Hubungi via WhatsApp, Situs Web.
  2. **Kanal Media Sosial & Official Store (Bento Grid 2 Kolom + Sakelar Grid/List):** Instagram, TikTok, Shopee, Tokopedia, ShopeeFood, GoFood.
* `ShareProfileDialog.tsx` — Modal bagikan profil toko lengkap dengan QR Code halaman, salin tautan, dan integrasi *Web Share API*.


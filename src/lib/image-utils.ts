import type { Card } from './types';

/**
 * Mengompres dan memotong (center-crop) gambar secara instan di sisi klien (browser)
 * menggunakan HTML5 Canvas agar ukuran data sangat ringan (< 30 KB) dan cepat dimuat.
 */
export function compressAndResizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas yang dipilih harus berupa gambar (JPG, PNG, atau WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Gagal memproses kanvas gambar.'));
            return;
          }

          // Center-crop (object-fit: cover) sesuai rasio target
          const targetRatio = targetWidth / targetHeight;
          const imgRatio = img.width / img.height;

          let sw = img.width;
          let sh = img.height;
          let sx = 0;
          let sy = 0;

          if (imgRatio > targetRatio) {
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }

          // Latar belakang gelap bersih jika PNG transparan
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

          // Utamakan format WebP yang jauh lebih ringan, fallback ke JPEG
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Gagal memuat berkas gambar.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Mengemas logo_url dan banner_url ke dalam satu kolom TEXT (logo_url)
 * sebagai fallback otomatis jika kolom banner_url belum dimigrasi di Supabase.
 */
export function packMediaFallback(
  logoUrl?: string | null,
  bannerUrl?: string | null
): string | null {
  const cleanLogo = logoUrl?.trim() || null;
  const cleanBanner = bannerUrl?.trim() || null;

  if (!cleanLogo && !cleanBanner) return null;
  if (cleanLogo && !cleanBanner) return cleanLogo;

  return JSON.stringify({
    __packed_media: true,
    logo_url: cleanLogo,
    banner_url: cleanBanner,
  });
}

/**
 * Mengekstrak logo_url dan banner_url dari objek Card (mendukung kolom terpisah maupun format fallback).
 */
export function normalizeCardMedia(card: Card): Card {
  if (!card) return card;

  let resolvedLogo = card.logo_url || null;
  let resolvedBanner = card.banner_url || null;

  if (resolvedLogo && resolvedLogo.startsWith('{"__packed_media":true')) {
    try {
      const parsed = JSON.parse(resolvedLogo);
      resolvedLogo = parsed.logo_url || null;
      resolvedBanner = resolvedBanner || parsed.banner_url || null;
    } catch {
      // Biarkan apa adanya jika bukan JSON valid
    }
  }

  return {
    ...card,
    logo_url: resolvedLogo,
    banner_url: resolvedBanner,
  };
}


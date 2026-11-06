'use client';

import * as React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export interface ReviewGapCalculatorProps {
  brandName: string;
  buildOrderWhatsAppUrl: (customNote?: string) => string;
}

/**
 * Mengonversi posisi slider (0 - 100) ke jumlah ulasan secara proporsional (multi-skala):
 * - 0..35   => 5 s/d 200 ulasan (presisi tinggi untuk toko baru/UMKM)
 * - 35..70  => 200 s/d 1.000 ulasan (menengah)
 * - 70..100 => 1.000 s/d 5.000 ulasan (restoran ramai, klinik, hotel, retail besar)
 */
function sliderPosToReviews(pos: number): number {
  if (pos <= 35) {
    const raw = 5 + (pos / 35) * 195;
    return Math.max(5, Math.round(raw / 5) * 5);
  }
  if (pos <= 70) {
    const raw = 200 + ((pos - 35) / 35) * 800;
    return Math.round(raw / 25) * 25;
  }
  const raw = 1000 + ((pos - 70) / 30) * 4000;
  return Math.round(raw / 100) * 100;
}

function reviewsToSliderPos(reviews: number): number {
  if (reviews <= 5) return 0;
  if (reviews <= 200) {
    return ((reviews - 5) / 195) * 35;
  }
  if (reviews <= 1000) {
    return 35 + ((reviews - 200) / 800) * 35;
  }
  if (reviews >= 5000) return 100;
  return 70 + ((reviews - 1000) / 4000) * 30;
}

const REVIEW_PRESETS = [25, 100, 500, 1500, 5000];

export function ReviewGapCalculator({
  brandName,
  buildOrderWhatsAppUrl,
}: ReviewGapCalculatorProps) {
  const [currentRating, setCurrentRating] = React.useState<number>(4.2);
  const [currentReviews, setCurrentReviews] = React.useState<number>(25);
  const [reviewInputStr, setReviewInputStr] = React.useState<string>('25');
  const [targetRating, setTargetRating] = React.useState<number>(4.8);
  const [dailyTaps, setDailyTaps] = React.useState<number>(10);

  const handleSetReviews = (val: number) => {
    const clamped = Math.max(1, Math.min(50000, Math.round(val)));
    setCurrentReviews(clamped);
    setReviewInputStr(String(clamped));
  };

  const handleManualReviewTyping = (raw: string) => {
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    setReviewInputStr(digitsOnly);
    const parsed = Number(digitsOnly);
    if (digitsOnly !== '' && parsed >= 1) {
      setCurrentReviews(Math.min(50000, parsed));
    }
  };

  const handleManualReviewBlur = () => {
    const parsed = Number(reviewInputStr);
    if (!parsed || parsed < 1) {
      handleSetReviews(5);
    } else if (parsed > 50000) {
      handleSetReviews(50000);
    } else {
      setReviewInputStr(String(currentReviews));
    }
  };

  const safeTarget = Math.max(targetRating, currentRating + 0.1);
  const rawNeeded = Math.ceil(
    (currentReviews * (safeTarget - currentRating)) / (5 - safeTarget)
  );
  const reviewsNeeded = Math.max(
    5,
    isFinite(rawNeeded) && rawNeeded > 0 ? rawNeeded : 15
  );
  const daysWithCard = Math.max(1, Math.ceil(reviewsNeeded / dailyTaps));
  const monthsWithoutCard = Math.max(1, Math.round(reviewsNeeded / 3));

  const formatWithoutCardDuration = (months: number) => {
    if (months >= 24) {
      const years = (months / 12).toFixed(1).replace(/\.0$/, '');
      return `~${years} Tahun`;
    }
    return `~${months.toLocaleString('id-ID')} Bulan`;
  };

  const formatWithCardDuration = (days: number) => {
    if (days > 90) {
      const months = (days / 30).toFixed(1).replace(/\.0$/, '');
      return `~${months} Bulan (${days.toLocaleString('id-ID')} Hari)`;
    }
    return `${days.toLocaleString('id-ID')} Hari Saja!`;
  };

  return (
    <section
      id="rating-analyzer"
      className="bg-gradient-to-br from-[#071326] via-[#040d1f] to-[#024aad]/35 border border-[#024aad]/50 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl"
    >
      <div className="max-w-2xl space-y-2">
        <Badge
          variant="blue"
          className="uppercase tracking-wider text-xs font-extrabold text-white"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#8ebeff]" aria-hidden="true" />
          <span>Diagnosa Kebutuhan Ulasan Google Maps</span>
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Berapa Lama Toko Anda Mencapai Rating 4.8+ Bintang?
        </h2>
        <p className="text-xs sm:text-sm text-[#d9e8ff] leading-relaxed">
          Pelanggan yang kecewa hampir selalu menulis ulasan buruk, sedangkan 95% pelanggan yang puas lupa memberi ulasan karena malas mencari nama toko secara manual di Google Maps. Hitung perbedaannya di bawah ini:
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 7 Columns: Interactive Parameters */}
        <Card className="lg:col-span-7 space-y-5 bg-[#040d1f]/90 border-[#024aad]/50 p-5 sm:p-6">
          {/* 1. Current Rating */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white">
                1. Rating Google Maps Toko Saat Ini:
              </span>
              <span className="text-amber-300 font-extrabold">
                {currentRating.toFixed(1)} Bintang
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[3.8, 4.0, 4.2, 4.4, 4.6].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setCurrentRating(val);
                    if (targetRating <= val) {
                      setTargetRating(
                        Number(Math.min(4.9, val + 0.3).toFixed(1))
                      );
                    }
                  }}
                  aria-pressed={currentRating === val}
                  className={`min-h-[40px] py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    currentRating === val
                      ? 'bg-[#024aad] border-white text-white shadow-md shadow-[#024aad]/40'
                      : 'bg-[#071326] border-[#024aad]/40 text-[#d9e8ff] hover:text-white'
                  }`}
                >
                  {val.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Total Reviews (Multi-Scale Slider up to 5.000 + Direct Input up to 50.000) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <label htmlFor="input-current-reviews" className="text-white">
                2. Total Ulasan yang Sudah Ada Sekarang:
              </label>
              <div className="inline-flex items-center gap-1.5 bg-[#071326] border border-[#1d6ff2]/60 rounded-lg px-2.5 py-1">
                <input
                  id="input-current-reviews"
                  type="text"
                  inputMode="numeric"
                  value={reviewInputStr}
                  onChange={(e) => handleManualReviewTyping(e.target.value)}
                  onBlur={handleManualReviewBlur}
                  aria-label="Ketik jumlah ulasan saat ini"
                  className="w-16 bg-transparent text-right font-mono font-extrabold text-white text-xs outline-none focus:text-[#8ebeff]"
                />
                <span className="text-[#8ebeff] font-extrabold text-xs">
                  Ulasan
                </span>
              </div>
            </div>

            <Slider
              id="slider-current-reviews"
              min={0}
              max={100}
              step={1}
              value={reviewsToSliderPos(currentReviews)}
              onValueChange={(pos) => handleSetReviews(sliderPosToReviews(pos))}
              ariaLabel="Geser total ulasan saat ini hingga ribuan ulasan"
            />

            <div className="flex justify-between text-[10px] text-[#bcd7ff] font-medium">
              <span>5 Ulasan</span>
              <span>200 Ulasan</span>
              <span>1.000 Ulasan</span>
              <span>5.000+ Ulasan</span>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-[#bcd7ff] mr-0.5">Pilih cepat:</span>
              {REVIEW_PRESETS.map((preset) => {
                const isSelected = currentReviews === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetReviews(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#024aad] border-white text-white'
                        : 'bg-[#071326] border-[#024aad]/40 text-[#bcd7ff] hover:text-white hover:border-[#599bff]'
                    }`}
                  >
                    {preset.toLocaleString('id-ID')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Target Rating */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white">3. Target Rating Impian Anda:</span>
              <span className="text-[#8ebeff] font-extrabold">
                {safeTarget.toFixed(1)} Bintang
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[4.7, 4.8, 4.9].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetRating(val)}
                  aria-pressed={targetRating === val}
                  className={`min-h-[40px] py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    targetRating === val
                      ? 'bg-white border-white text-[#024aad] shadow-md'
                      : 'bg-[#071326] border-[#024aad]/40 text-[#d9e8ff] hover:text-white'
                  }`}
                >
                  Target {val.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Daily Taps Slider (Expanded up to 100 Taps/Day for Busy Venues) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <label htmlFor="slider-daily-taps" className="text-white">
                4. Estimasi Pelanggan Tap Kartu per Hari:
              </label>
              <span className="text-[#8ebeff] font-extrabold">
                {dailyTaps} Pelanggan / Hari
              </span>
            </div>
            <Slider
              id="slider-daily-taps"
              min={2}
              max={100}
              step={1}
              value={dailyTaps}
              onValueChange={setDailyTaps}
              ariaLabel="Estimasi tap kartu per hari"
            />
            <div className="flex justify-between text-[10px] text-[#bcd7ff]">
              <span>2 Tap/Hari (Sepi)</span>
              <span>25 Tap/Hari (Normal)</span>
              <span>100 Tap/Hari (Ramai / Banyak Meja)</span>
            </div>
          </div>
        </Card>

        {/* Right 5 Columns: Diagnostic Output */}
        <Card className="lg:col-span-5 bg-[#040d1f] border-2 border-[#1d6ff2]/70 p-6 space-y-5 shadow-2xl shadow-[#024aad]/30">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#bcd7ff]">
              Hasil Diagnosa untuk {brandName}
            </div>
            <div className="text-sm text-[#eef5ff]">
              Dari{' '}
              <span className="font-extrabold text-white">
                {currentReviews.toLocaleString('id-ID')} ulasan ({currentRating.toFixed(1)}★)
              </span>{' '}
              menuju{' '}
              <span className="font-extrabold text-[#8ebeff]">
                {safeTarget.toFixed(1)} Bintang
              </span>
              , Anda membutuhkan:
            </div>
            <div className="text-3xl font-black text-white pt-1">
              +{reviewsNeeded.toLocaleString('id-ID')} Ulasan Bintang 5
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#024aad]/40">
            <div className="p-3.5 rounded-xl bg-[#071326] border border-white/15 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#bcd7ff]">
                  Cara Lama (Tanpa Kartu NFC)
                </div>
                <div className="text-[11px] text-slate-300">
                  Pelanggan harus cari manual di aplikasi Maps
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-rose-300">
                  {formatWithoutCardDuration(monthsWithoutCard)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#024aad]/40 border border-[#599bff] flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-white">
                  Dengan SmartHub Card ({dailyTaps} Tap/Hari)
                </div>
                <div className="text-[11px] text-[#d9e8ff]">
                  Pop-up bintang 5 terbuka dalam 1 detik
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-white">
                  {formatWithCardDuration(daysWithCard)}
                </span>
              </div>
            </div>
          </div>

          <a
            href={buildOrderWhatsAppUrl(
              `Halo Admin Studio Kalcer, toko saya *${brandName}* saat ini punya ${currentReviews.toLocaleString(
                'id-ID'
              )} ulasan (${currentRating.toFixed(
                1
              )} bintang) dan ingin mengejar target rating ${safeTarget.toFixed(
                1
              )} Bintang (+${reviewsNeeded.toLocaleString(
                'id-ID'
              )} ulasan baru). Mohon info pemesanan SmartHub Card.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-[#d9e8ff] text-[#024aad] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Kejar Target Rating {safeTarget.toFixed(1)} Sekarang</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </Card>
      </div>
    </section>
  );
}

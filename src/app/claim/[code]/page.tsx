'use client';

import React, { useState, useEffect, use } from 'react';
import { Search, MapPin, CheckCircle, Sparkles, AlertCircle, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import type { PlacePrediction } from '@/lib/types';

export default function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = (resolvedParams?.code || '').toUpperCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    place_id: string;
    name: string;
    address: string;
  } | null>(null);

  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounced Place Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || selectedPlace) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.predictions) {
          setPredictions(data.predictions);
        }
      } catch (err) {
        console.error('Failed to search places', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPlace]);

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setSelectedPlace({
      place_id: prediction.place_id,
      name: prediction.main_text,
      address: prediction.secondary_text || prediction.description,
    });
    setSearchQuery(prediction.main_text);
    setPredictions([]);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      setErrorMsg('Silakan cari dan pilih nama toko/bisnis Anda terlebih dahulu.');
      return;
    }
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Masukkan nomor WhatsApp yang aktif untuk keamanan kepemilikan.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/cards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          short_code: code,
          business_name: selectedPlace.name,
          business_address: selectedPlace.address,
          google_place_id: selectedPlace.place_id,
          owner_phone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengaktifkan kartu.');
      }

      setIsClaimed(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-900 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-6">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> First-Tap Activation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Aktifkan Kartu Ulasan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hubungkan kartu fisik <span className="font-mono font-semibold text-blue-600">#{code}</span> ke Google Maps bisnismu.
          </p>
        </div>

        {/* Tampilan Jika Berhasil Di-Claim */}
        {isClaimed ? (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Kartu Berhasil Aktif!</h2>
            <p className="text-sm text-gray-600 mb-4">
              Kartu ini sekarang resmi terkunci untuk <br />
              <b className="text-gray-900">{selectedPlace?.name}</b>.
            </p>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-left text-xs text-blue-800 mb-5 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-blue-900">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Siap Digunakan:
              </div>
              <p>Mulai sekarang, siapapun yang menempelkan HP ke kartu atau scan QR akan langsung membuka ulasan tokomu di Google Maps.</p>
            </div>

            <div className="space-y-2.5">
              <a
                href={`/c/${code}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Uji Coba Tap Sekarang <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-gray-400">
                Letakkan kartu ini di meja kasir Anda agar pelanggan mudah memberikan ulasan.
              </p>
            </div>
          </div>
        ) : (
          /* Form Aktivasi Mandiri */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              {/* Step 1: Cari Nama Usaha */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  1. Cari Nama Bisnis di Google Maps
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedPlace) setSelectedPlace(null);
                    }}
                    placeholder="Contoh: Kopi Kenangan Senopati"
                    className="w-full px-3.5 py-2.5 pl-10 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>

                {/* Dropdown Pencarian */}
                {isSearching && (
                  <p className="text-xs text-blue-600 mt-1.5 animate-pulse pl-1">
                    Mencari lokasi di Google Maps...
                  </p>
                )}

                {predictions.length > 0 && !selectedPlace && (
                  <div className="mt-2 border border-gray-100 rounded-xl bg-white shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50 z-20">
                    {predictions.map((p) => (
                      <button
                        type="button"
                        key={p.place_id}
                        onClick={() => handleSelectPlace(p)}
                        className="w-full text-left p-3 hover:bg-blue-50 flex items-start gap-2.5 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{p.main_text}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">{p.secondary_text}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tempat Terpilih */}
                {selectedPlace && (
                  <div className="mt-2.5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-green-900">{selectedPlace.name}</div>
                        <div className="text-[11px] text-green-700">{selectedPlace.address}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlace(null);
                        setSearchQuery('');
                      }}
                      className="text-[11px] text-gray-400 hover:text-red-600 underline shrink-0"
                    >
                      Ubah
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Nomor WhatsApp Pemilik */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  2. Nomor WhatsApp Pemilik
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1 pl-1">
                  Digunakan untuk mengelola atau mengubah link jika tokomu pindah alamat.
                </p>
              </div>

              {/* Step 3: Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPlace}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Kunci & Aktifkan Kartu
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-gray-400">
                  ⚡ Sistem First-Tap Claim: Kartu otomatis terkunci dan langsung siap digunakan.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-gray-400 py-3">
        &copy; {new Date().getFullYear()} Tap to Review Platform. Powered by Google Maps Place ID.
      </footer>
    </div>
  );
}


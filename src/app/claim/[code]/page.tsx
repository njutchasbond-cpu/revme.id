'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Star, 
  ShieldCheck,
  Wifi,
  Instagram,
  Globe,
  BookOpen,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { PlacePrediction, CardMode } from '@/lib/types';

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
  const [placeAddress, setPlaceAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState<CardMode>('smart_hub');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // All-in-One Fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [servicesUrl, setServicesUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

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
    const isCustom = prediction.place_id.startsWith('custom_');
    const addr = isCustom ? '' : (prediction.secondary_text || prediction.description || '');

    setSelectedPlace({
      place_id: prediction.place_id,
      name: prediction.main_text,
      address: addr,
    });
    setPlaceAddress(addr);
    setIsEditingAddress(isCustom);
    setSearchQuery(prediction.main_text);
    setPredictions([]);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      setErrorMsg('Silakan cari dan pilih nama toko atau bisnis Anda terlebih dahulu.');
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
          business_category: category,
          business_address: placeAddress.trim() || selectedPlace.address || null,
          google_place_id: selectedPlace.place_id,
          owner_phone: phone,
          mode,
          wifi_ssid: wifiSsid,
          wifi_password: wifiPassword,
          menu_url: menuUrl,
          services_url: servicesUrl,
          instagram_username: instagram,
          tiktok_username: tiktok,
          website_url: websiteUrl,
          whatsapp_number: phone,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-lg w-full mx-auto my-auto py-6">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> First-Tap Activation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Aktivasi Kartu Pintar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hubungkan kartu fisik seri <span className="font-mono font-semibold text-blue-400">#{code}</span> ke profil tokomu.
          </p>
        </div>

        {/* Tampilan Jika Berhasil Di-Claim */}
        {isClaimed ? (
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Kartu Berhasil Aktif</h2>
            <p className="text-sm text-slate-300 mb-4">
              Kartu ini sekarang resmi terhubung ke <br />
              <strong className="text-white font-semibold">{selectedPlace?.name}</strong>.
            </p>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-left text-xs text-slate-300 mb-5 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-blue-400">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Siap Digunakan
              </div>
              <p className="text-slate-400">
                {mode === 'smart_hub'
                  ? 'Saat pelanggan menempelkan ponsel ke kartu atau scan QR, seluruh portal All-in-One toko akan terbuka.'
                  : 'Saat pelanggan menempelkan ponsel ke kartu atau scan QR, ulasan Google Maps langsung terbuka.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={`/c/${code}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition active:scale-95"
              >
                Uji Coba Tampilan Kartu <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-slate-500">
                Letakkan kartu ini di meja kasir atau meja tunggu untuk digunakan pelanggan.
              </p>
            </div>
          </div>
        ) : (
          /* Form Aktivasi Mandiri */
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-5 sm:p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              
              {/* Step 1: Cari Nama Usaha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  1. Nama Bisnis di Google Maps
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedPlace) {
                        setSelectedPlace(null);
                        setPlaceAddress('');
                        setIsEditingAddress(false);
                      }
                    }}
                    placeholder="Contoh: Kopi Kenangan Senopati"
                    className="w-full px-3.5 py-2.5 pl-10 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-slate-500 outline-none transition"
                    required
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>

                {isSearching && (
                  <p className="text-xs text-blue-400 mt-1.5 animate-pulse pl-1">
                    Mencari lokasi di Google Maps...
                  </p>
                )}

                {predictions.length > 0 && !selectedPlace && (
                  <div className="mt-2 border border-slate-800 rounded-xl bg-slate-950 shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800/60 z-20">
                    {predictions.map((p) => (
                      <button
                        type="button"
                        key={p.place_id}
                        onClick={() => handleSelectPlace(p)}
                        className="w-full text-left p-3 hover:bg-slate-900 flex items-start gap-2.5 transition"
                      >
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{p.main_text}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{p.secondary_text}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPlace && (
                  <div className="mt-2.5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">{selectedPlace.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {selectedPlace.place_id.startsWith('custom_')
                              ? 'Nama brand / toko mandiri'
                              : 'Lokasi terverifikasi di peta'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlace(null);
                          setPlaceAddress('');
                          setIsEditingAddress(false);
                          setSearchQuery('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400 underline shrink-0"
                      >
                        Ganti Nama
                      </button>
                    </div>

                    {/* Alamat Resmi Toko */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" /> Alamat Resmi Toko
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(!isEditingAddress)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                        >
                          {isEditingAddress ? 'Selesai' : 'Sesuaikan Alamat'}
                        </button>
                      </div>

                      {isEditingAddress ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={placeAddress}
                            onChange={(e) => setPlaceAddress(e.target.value)}
                            placeholder="Contoh: Jl. Ahmad Yani No. 10, Pringsewu, Lampung"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <p className="text-[10px] text-slate-400">
                            Sistem mengambil alamat resmi otomatis. Anda dapat melengkapi nomor ruko atau patokan detail jika diperlukan.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-200 bg-slate-900/70 px-3 py-2 rounded-lg border border-slate-800/80">
                          {placeAddress || 'Belum ada alamat terdeteksi. Klik "Sesuaikan Alamat" untuk mengisi.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Kategori Bisnis Singkat */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Kategori Bisnis (Opsional)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Kafe, Resto, Salon, Klinik"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 outline-none transition"
                />
              </div>

              {/* Step 2: Mode Operasional Kartu */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  2. Mode Kartu
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMode('smart_hub')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      mode === 'smart_hub'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> All-in-One Hub
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Membuka portal lengkap (WiFi, Menu, Medsos, Review).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('direct_review')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      mode === 'direct_review'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Direct Review
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Langsung membuka ulasan Google Maps tanpa jeda.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Tautan All-in-One (Bisa di-expand) */}
              {mode === 'smart_hub' && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      Lengkapi Info WiFi, Menu & Medsos
                    </span>
                    {showAdvanced ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="p-4 space-y-3.5 border-t border-slate-800">
                      
                      {/* WiFi */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nama WiFi (SSID)</label>
                          <input
                            type="text"
                            value={wifiSsid}
                            onChange={(e) => setWifiSsid(e.target.value)}
                            placeholder="WiFi_Tamu"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Kata Sandi WiFi</label>
                          <input
                            type="text"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                            placeholder="sandiwifi"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Instagram & TikTok */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Username Instagram</label>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="namatoko"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Username TikTok</label>
                          <input
                            type="text"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder="namatoko"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Menu & Layanan */}
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Link Buku Menu / PDF</label>
                        <input
                          type="url"
                          value={menuUrl}
                          onChange={(e) => setMenuUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Link Layanan / Reservasi</label>
                        <input
                          type="url"
                          value={servicesUrl}
                          onChange={(e) => setServicesUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Situs Web Resmi</label>
                        <input
                          type="text"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://namatoko.com"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                        />
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Nomor WhatsApp Pemilik */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  3. Nomor WhatsApp Pemilik
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 outline-none transition"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1 pl-1">
                  Digunakan untuk keamanan kepemilikan dan autentikasi pengelolaan kartu.
                </p>
              </div>

              {/* Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPlace}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Kunci dan Aktifkan Kartu
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-500">
                  Sistem First-Tap Claim: Kartu otomatis terkunci dan langsung siap digunakan.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-slate-600 py-3">
        Diberdayakan oleh{' '}
        <a
          href="https://studiokalcer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition"
        >
          studiokalcer.com
        </a>
      </footer>
    </div>
  );
}

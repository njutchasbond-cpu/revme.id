'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  CreditCard,
  Download,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  QrCode,
  X,
  FileArchive,
  Pencil,
  RotateCcw,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import type { Card } from '@/lib/types';

export default function AdminPage() {
  // Auth State
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unclaimed' | 'active'>('all');

  // Edit State
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(25);
  const [prefix, setPrefix] = useState('DW');
  const [batchName, setBatchName] = useState('BATCH-01');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // QR Code Export State
  const [isExportingQR, setIsExportingQR] = useState(false);
  const [qrProgress, setQrProgress] = useState<{ current: number; total: number } | null>(null);

  // Single QR Preview Modal State
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string>('');

  const fetchCards = async (activeSecret?: string) => {
    setIsLoading(true);
    const keyToUse = activeSecret !== undefined ? activeSecret : adminSecret;

    try {
      const res = await fetch(`/api/admin/cards?t=${Date.now()}`, {
        headers: { 'x-admin-key': keyToUse },
        cache: 'no-store',
      });

      if (res.status === 401) {
        handleLockPortal();
        setAuthError('Sesi berakhir atau kunci rahasia tidak valid. Silakan login kembali.');
        return;
      }

      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cek status autentikasi saat pertama kali dimuat
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const savedKey = typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret_key') : null;
        if (savedKey) {
          const res = await fetch('/api/admin/auth', {
            headers: { 'x-admin-key': savedKey },
            cache: 'no-store',
          });
          const data = await res.json();
          if (data.authenticated) {
            setAdminSecret(savedKey);
            setIsAuthenticated(true);
            fetchCards(savedKey);
            return;
          }
        }
      } catch (err) {
        console.error('Check auth error:', err);
      } finally {
        setIsCheckingAuth(false);
      }
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kunci rahasia admin tidak sesuai.');
      }

      const validatedKey = inputKey.trim();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_secret_key', validatedKey);
      }
      setAdminSecret(validatedKey);
      setIsAuthenticated(true);
      setInputKey('');
      await fetchCards(validatedKey);
    } catch (err: any) {
      setAuthError(err.message || 'Gagal memverifikasi kunci rahasia.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLockPortal = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_secret_key');
    }
    setAdminSecret('');
    setIsAuthenticated(false);
    setCards([]);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSecret,
        },
        body: JSON.stringify({
          count: batchCount,
          prefix,
          batch_name: batchName,
        }),
      });

      if (res.status === 401) {
        handleLockPortal();
        setAuthError('Sesi Anda berakhir. Masukkan kembali ADMIN_SECRET_KEY.');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal generate kartu.');

      setMessage({ text: `Berhasil generate ${data.count} kartu baru!`, type: 'success' });
      await fetchCards();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetCard = async (short_code: string) => {
    if (!confirm(`Yakin ingin reset kartu ${short_code}? Status akan kembali menjadi unclaimed.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSecret,
        },
        body: JSON.stringify({ short_code }),
      });

      if (res.status === 401) {
        handleLockPortal();
        setAuthError('Sesi Anda berakhir. Masukkan kembali ADMIN_SECRET_KEY.');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal reset kartu');

      setMessage({ text: `Kartu ${short_code} berhasil di-reset menjadi unclaimed.`, type: 'success' });
      await fetchCards();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenEdit = (c: Card) => {
    setEditingCard({ ...c });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSecret,
        },
        body: JSON.stringify(editingCard),
      });

      if (res.status === 401) {
        handleLockPortal();
        setAuthError('Sesi Anda berakhir. Masukkan kembali ADMIN_SECRET_KEY.');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan.');

      setMessage({ text: `Data kartu #${editingCard.short_code} berhasil diperbarui!`, type: 'success' });
      setEditingCard(null);
      await fetchCards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExportCSV = () => {
    if (cards.length === 0) return;
    const appUrl = window.location.origin;

    const headers = ['Short Code', 'URL Redirect', 'Status', 'Mode', 'Nama Bisnis', 'WhatsApp', 'Batch', 'Tap Count'];
    const rows = cards.map((c) => [
      c.short_code,
      `${appUrl}/c/${c.short_code}`,
      c.status,
      c.mode || 'smart_hub',
      `"${c.business_name || ''}"`,
      `"${c.owner_phone || ''}"`,
      c.batch_number || '',
      c.tap_count || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kartu_nfc_${batchName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportQRCodesZip = async () => {
    if (cards.length === 0) return;
    setIsExportingQR(true);
    setQrProgress({ current: 0, total: cards.length });

    try {
      const zip = new JSZip();
      const appUrl = window.location.origin;
      const folderName = `qrcodes_${batchName || 'batch'}`;
      const folder = zip.folder(folderName);

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const targetUrl = `${appUrl}/c/${c.short_code}`;

        // Generate data URL QR Code dengan resolusi cetak tinggi (width 800px)
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        // Potong header base64 dan simpan ke zip
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        folder?.file(`${c.short_code}.png`, base64Data, { base64: true });

        setQrProgress({ current: i + 1, total: cards.length });
      }

      // Tambahkan catatan informasi batch di dalam zip
      folder?.file(
        'README_INFORMASI.txt',
        `Batch Produksi: ${batchName}\nTotal Gambar QR: ${cards.length}\nTanggal Export: ${new Date().toLocaleString('id-ID')}\nFormat URL: ${appUrl}/c/[KODE_SERIAL]\n\nDiberdayakan oleh studiokalcer.com`
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `qrcodes_${batchName}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({
        text: `Berhasil mengunduh ${cards.length} file QR Code dalam format ZIP!`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: `Gagal men-generate ZIP: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsExportingQR(false);
      setQrProgress(null);
    }
  };

  const handleOpenQrPreview = async (c: Card) => {
    setPreviewCard(c);
    const appUrl = window.location.origin;
    const targetUrl = `${appUrl}/c/${c.short_code}`;
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    setPreviewQrDataUrl(dataUrl);
  };

  const filteredCards = cards.filter((c) => {
    const matchSearch =
      c.short_code.toLowerCase().includes(search.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.status === 'active').length;
  const unclaimedCards = cards.filter((c) => c.status === 'unclaimed').length;
  const totalTaps = cards.reduce((sum, c) => sum + (c.tap_count || 0), 0);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Memeriksa otorisasi Super Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Area Terbatas Super Admin
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Portal Super Admin Terkunci</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal ini dilindungi dengan sistem keamanan kunci rahasia. Masukkan <code className="text-blue-400 font-mono">ADMIN_SECRET_KEY</code> untuk mengakses pengelolaan kartu.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Kunci Rahasia Admin
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Masukkan ADMIN_SECRET_KEY"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none pr-10 font-mono transition"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  title={showSecret ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating || !inputKey.trim()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memvalidasi Kunci...
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" /> Buka Kunci Portal
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              Kembali ke Beranda
            </Link>
            <div className="text-[10px] text-slate-600">
              Diberdayakan oleh studiokalcer.com
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Super Admin: Kartu Pintar & Review</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Kelola stok kartu, generate batch cetak, export CSV & QR Code, dan pantau status First-Tap Claim.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Tombol Export QR Codes ZIP */}
            <button
              onClick={handleExportQRCodesZip}
              disabled={cards.length === 0 || isExportingQR}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              title="Unduh seluruh gambar QR Code dalam berkas ZIP"
            >
              {isExportingQR ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {qrProgress ? `${qrProgress.current}/${qrProgress.total}` : 'Memproses...'}
                  </span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Export QR Code (ZIP)</span>
                </>
              )}
            </button>

            {/* Tombol Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={cards.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              title="Unduh data tabel CSV untuk vendor percetakan"
            >
              <Download className="w-4 h-4" /> Export CSV Percetakan
            </button>

            {/* Tombol Refresh */}
            <button
              onClick={() => fetchCards()}
              className="p-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>

            {/* Tombol Kunci Portal (Logout) */}
            <button
              onClick={handleLockPortal}
              className="p-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
              title="Kunci Portal Admin (Keluar)"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifikasi Message */}
        {message && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Kartu</div>
            <div className="text-2xl font-bold mt-1">{totalCards}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">Aktif (Diklaim)</div>
            <div className="text-2xl font-bold text-green-700 mt-1">{activeCards}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Ready Stock (Unclaimed)</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{unclaimedCards}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Tap Ulasan</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{totalTaps}</div>
          </div>
        </div>

        {/* Grid: Generator Form & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Generator Form */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" /> Generate Batch Baru
            </h2>
            <form onSubmit={handleGenerateBatch} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Jumlah Kartu</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Prefix Kode</label>
                <input
                  type="text"
                  maxLength={5}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DW"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Nama Batch</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="BATCH-NOV2026"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Membuat Batch...' : 'Generate Kartu'}
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kode atau toko..."
                    className="w-full px-3 py-2 pl-9 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => setStatusFilter('unclaimed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'unclaimed' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Ready
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 border-y border-gray-100 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Kode Serial</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Bisnis Terhubung</th>
                      <th className="py-2.5 px-3 text-center">Tap</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          {isLoading ? 'Memuat data kartu...' : 'Belum ada kartu ditemukan.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCards.map((c) => (
                        <tr key={c.short_code} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                            #{c.short_code}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase ${
                                c.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                  : c.status === 'unclaimed'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 max-w-[180px] truncate">
                            {c.business_name ? (
                              <div>
                                <div className="font-semibold">{c.business_name}</div>
                                <div className="text-[10px] text-gray-400">{c.owner_phone || '-'}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Belum diklaim</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                            {c.tap_count || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                            
                            {/* Tombol Edit Data */}
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="inline-flex items-center gap-1 p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit Data Kartu"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Reset Data */}
                            <button
                              onClick={() => handleResetCard(c.short_code)}
                              className="inline-flex items-center gap-1 p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Reset Data Kartu ke Unclaimed"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Preview & Unduh QR Satuan */}
                            <button
                              onClick={() => handleOpenQrPreview(c)}
                              className="inline-flex items-center gap-1 p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Lihat & Unduh QR Code Kartu Ini"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Test Tap Redirect */}
                            <a
                              href={`/c/${c.short_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Buka Halaman Kartu"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Edit Data Kartu */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 my-8 overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    #{editingCard.short_code}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    Edit Data Kartu
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Perbarui profil bisnis, status, dan seluruh tautan All-in-One.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Edit */}
            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                
                {/* Status & Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status Kartu</label>
                    <select
                      value={editingCard.status}
                      onChange={(e) => setEditingCard({ ...editingCard, status: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="unclaimed">UNCLAIMED (Belum Diklaim)</option>
                      <option value="active">ACTIVE (Aktif Terhubung)</option>
                      <option value="inactive">INACTIVE (Nonaktif)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mode Operasional</label>
                    <select
                      value={editingCard.mode || 'smart_hub'}
                      onChange={(e) => setEditingCard({ ...editingCard, mode: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="smart_hub">All-in-One Smart Hub</option>
                      <option value="direct_review">Direct Review (Langsung Google Review)</option>
                    </select>
                  </div>
                </div>

                {/* Profil Bisnis */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-blue-600">
                    Profil Bisnis
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Nama Bisnis</label>
                      <input
                        type="text"
                        value={editingCard.business_name || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, business_name: e.target.value })}
                        placeholder="Contoh: Alone Wear Brand"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Kategori Bisnis</label>
                      <input
                        type="text"
                        value={editingCard.business_category || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, business_category: e.target.value })}
                        placeholder="Contoh: Denim House, Kafe, Resto"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Alamat Resmi</label>
                    <textarea
                      rows={2}
                      value={editingCard.business_address || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, business_address: e.target.value })}
                      placeholder="Contoh: Jl. Sukoharjo III, Pringsewu, Lampung"
                      className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Nomor WhatsApp Pemilik</label>
                      <input
                        type="text"
                        value={editingCard.owner_phone || editingCard.whatsapp_number || ''}
                        onChange={(e) => setEditingCard({ 
                          ...editingCard, 
                          owner_phone: e.target.value,
                          whatsapp_number: e.target.value 
                        })}
                        placeholder="081234567890"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Google Place ID (Opsional)</label>
                      <input
                        type="text"
                        value={editingCard.google_place_id || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, google_place_id: e.target.value })}
                        placeholder="ChIJ..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* WiFi Pengunjung */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-blue-600">
                    Akses WiFi Pengunjung
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Nama WiFi (SSID)</label>
                      <input
                        type="text"
                        value={editingCard.wifi_ssid || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, wifi_ssid: e.target.value })}
                        placeholder="WiFi_Tamu"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Kata Sandi WiFi</label>
                      <input
                        type="text"
                        value={editingCard.wifi_password || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, wifi_password: e.target.value })}
                        placeholder="sandiwifi"
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Tautan Layanan & Media Sosial */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-blue-600">
                    Menu, Layanan & Media Sosial
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Link Buku Menu / PDF</label>
                      <input
                        type="text"
                        value={editingCard.menu_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, menu_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link Layanan / Reservasi</label>
                      <input
                        type="text"
                        value={editingCard.services_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, services_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Username IG</label>
                      <input
                        type="text"
                        value={editingCard.instagram_username || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, instagram_username: e.target.value })}
                        placeholder="username"
                        className="w-full px-2.5 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Username TikTok</label>
                      <input
                        type="text"
                        value={editingCard.tiktok_username || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, tiktok_username: e.target.value })}
                        placeholder="username"
                        className="w-full px-2.5 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Situs Web</label>
                      <input
                        type="text"
                        value={editingCard.website_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, website_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2.5 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Marketplace & Delivery */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-blue-600">
                    Marketplace & Food Delivery
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Link Toko Shopee</label>
                      <input
                        type="text"
                        value={editingCard.shopee_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, shopee_url: e.target.value })}
                        placeholder="https://shopee.co.id/..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link Toko Tokopedia</label>
                      <input
                        type="text"
                        value={editingCard.tokopedia_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, tokopedia_url: e.target.value })}
                        placeholder="https://tokopedia.com/..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Link ShopeeFood</label>
                      <input
                        type="text"
                        value={editingCard.shopeefood_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, shopeefood_url: e.target.value })}
                        placeholder="https://shopeefood..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link GoFood</label>
                      <input
                        type="text"
                        value={editingCard.gofood_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, gofood_url: e.target.value })}
                        placeholder="https://gofood..."
                        className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition shadow-sm"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal Preview QR Code Satuan */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 relative">
            
            <button
              onClick={() => setPreviewCard(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-3">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                #{previewCard.short_code}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">
                QR Code Kartu
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {previewCard.business_name || 'Kartu Belum Diklaim (Ready Stock)'}
              </p>
            </div>

            {/* Gambar QR Code */}
            {previewQrDataUrl && (
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 inline-block my-2">
                <img
                  src={previewQrDataUrl}
                  alt={`QR Code ${previewCard.short_code}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}

            <div className="text-[11px] font-mono text-gray-500 break-all px-2 mb-4">
              {window.location.origin}/c/{previewCard.short_code}
            </div>

            <div className="flex gap-2">
              <a
                href={previewQrDataUrl}
                download={`QR_${previewCard.short_code}.png`}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Gambar PNG
              </a>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

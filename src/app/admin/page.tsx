'use client';

import React, { useState, useEffect } from 'react';
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
  FileArchive
} from 'lucide-react';
import type { Card } from '@/lib/types';

export default function AdminPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unclaimed' | 'active'>('all');

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

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cards');
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

  useEffect(() => {
    fetchCards();
  }, []);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: batchCount,
          prefix,
          batch_name: batchName,
        }),
      });

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal reset kartu');

      setMessage({ text: `Kartu ${short_code} berhasil di-reset menjadi unclaimed.`, type: 'success' });
      await fetchCards();
    } catch (err: any) {
      alert(err.message);
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
              onClick={fetchCards}
              className="p-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
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
                              title="Test Tap Redirect"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Tombol Force Reset */}
                            {c.status === 'active' && (
                              <button
                                onClick={() => handleResetCard(c.short_code)}
                                className="inline-flex items-center gap-1 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Force Reset to Unclaimed"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                            )}
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

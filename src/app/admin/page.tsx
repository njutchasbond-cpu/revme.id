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
  EyeOff,
  Upload,
  Trash2,
  Image as ImageIcon,
  BarChart3,
  TrendingUp,
  Layers,
  Filter,
  Star,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { Card } from '@/lib/types';
import { compressAndResizeImage, normalizeCardMedia } from '@/lib/image-utils';

interface RawInteractionLog {
  id: number | string;
  card_id: string;
  interaction_type: string;
  device_type?: string;
  created_at: string;
}

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
  const [interactionLogs, setInteractionLogs] = useState<RawInteractionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unclaimed' | 'active'>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');

  // Analitik & Audit Trail State
  const [chartDays, setChartDays] = useState<7 | 14>(7);
  const [auditFilter, setAuditFilter] = useState<'all' | 'tap' | 'claim'>('all');

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
      if (Array.isArray(data.logs)) {
        setInteractionLogs(data.logs);
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
    setEditingCard(normalizeCardMedia({ ...c }));
  };

  const handleEditLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;
    try {
      const compressed = await compressAndResizeImage(file, 256, 256, 0.85);
      setEditingCard({ ...editingCard, logo_url: compressed });
    } catch (err: any) {
      alert(err.message || 'Gagal memproses logo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleEditBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;
    try {
      const compressed = await compressAndResizeImage(file, 960, 360, 0.82);
      setEditingCard({ ...editingCard, banner_url: compressed });
    } catch (err: any) {
      alert(err.message || 'Gagal memproses banner.');
    } finally {
      e.target.value = '';
    }
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

  const getResolvedReviewUrl = (c: Card): string => {
    if (c.google_place_id && c.google_place_id.startsWith('ChIJ')) {
      return `https://search.google.com/local/writereview?placeid=${c.google_place_id}`;
    }
    if (c.review_url && c.review_url.trim().length > 0) {
      return c.review_url.trim();
    }
    if (c.business_name) {
      const q = [c.business_name, c.business_address].filter(Boolean).join(' ');
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    }
    return '';
  };

  const isDirectReviewValid = (c: Card): boolean => {
    if (c.google_place_id && c.google_place_id.startsWith('ChIJ')) return true;
    if (
      c.review_url &&
      (c.review_url.includes('writereview') || c.review_url.includes('g.page/r/'))
    ) {
      return true;
    }
    return false;
  };

  const handleExportCSV = (specificBatch?: string) => {
    const targetBatch = specificBatch || (batchFilter !== 'all' ? batchFilter : undefined);
    const listToExport = targetBatch
      ? cards.filter((c) => (c.batch_number || 'TANPA-BATCH') === targetBatch)
      : cards;

    if (listToExport.length === 0) return;
    const appUrl = window.location.origin;
    const label = targetBatch || batchName || 'ALL';

    const headers = ['Short Code', 'URL Redirect', 'Status', 'Mode', 'Nama Bisnis', 'WhatsApp', 'Batch', 'Tap Count', 'Review URL'];
    const rows = listToExport.map((c) => [
      c.short_code,
      `${appUrl}/c/${c.short_code}`,
      c.status,
      c.mode || 'smart_hub',
      `"${c.business_name || ''}"`,
      `"${c.owner_phone || ''}"`,
      c.batch_number || 'TANPA-BATCH',
      c.tap_count || 0,
      `"${getResolvedReviewUrl(c)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kartu_nfc_${label}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportQRCodesZip = async (specificBatch?: string) => {
    const targetBatch = specificBatch || (batchFilter !== 'all' ? batchFilter : undefined);
    const listToExport = targetBatch
      ? cards.filter((c) => (c.batch_number || 'TANPA-BATCH') === targetBatch)
      : cards;

    if (listToExport.length === 0) return;
    const label = targetBatch || batchName || 'ALL';

    setIsExportingQR(true);
    setQrProgress({ current: 0, total: listToExport.length });

    try {
      const zip = new JSZip();
      const appUrl = window.location.origin;
      const folderName = `qrcodes_${label}`;
      const folder = zip.folder(folderName);

      for (let i = 0; i < listToExport.length; i++) {
        const c = listToExport[i];
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

        setQrProgress({ current: i + 1, total: listToExport.length });
      }

      // Tambahkan catatan informasi batch di dalam zip
      folder?.file(
        'README_INFORMASI.txt',
        `Batch Produksi: ${label}\nTotal Gambar QR: ${listToExport.length}\nTanggal Export: ${new Date().toLocaleString('id-ID')}\nFormat URL: ${appUrl}/c/[KODE_SERIAL]\n\nDiberdayakan oleh studiokalcer.com`
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `qrcodes_${label}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({
        text: `Berhasil mengunduh ${listToExport.length} file QR Code (${label}) dalam format ZIP!`,
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

  // Ringkasan Manajemen & Riwayat Batch
  const batchSummaries = React.useMemo(() => {
    const map = new Map<
      string,
      {
        batchName: string;
        total: number;
        active: number;
        unclaimed: number;
        taps: number;
        createdAt: string;
      }
    >();

    for (const c of cards) {
      const bName = c.batch_number || 'TANPA-BATCH';
      const existing = map.get(bName);
      const cardDate = c.created_at || new Date().toISOString();

      if (!existing) {
        map.set(bName, {
          batchName: bName,
          total: 1,
          active: c.status === 'active' ? 1 : 0,
          unclaimed: c.status === 'unclaimed' ? 1 : 0,
          taps: c.tap_count || 0,
          createdAt: cardDate,
        });
      } else {
        existing.total += 1;
        if (c.status === 'active') existing.active += 1;
        if (c.status === 'unclaimed') existing.unclaimed += 1;
        existing.taps += c.tap_count || 0;
        if (cardDate > existing.createdAt) {
          existing.createdAt = cardDate;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [cards]);

  const filteredCards = cards.filter((c) => {
    const matchSearch =
      c.short_code.toLowerCase().includes(search.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.batch_number && c.batch_number.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    const matchBatch =
      batchFilter === 'all' ? true : (c.batch_number || 'TANPA-BATCH') === batchFilter;
    return matchSearch && matchStatus && matchBatch;
  });

  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.status === 'active').length;
  const unclaimedCards = cards.filter((c) => c.status === 'unclaimed').length;
  const totalTaps = cards.reduce((sum, c) => sum + (c.tap_count || 0), 0);

  // Perhitungan Grafik Tren Tap Harian (7 atau 14 Hari Terakhir)
  const dailyTrendData = React.useMemo(() => {
    const days: Array<{
      dateKey: string;
      label: string;
      taps: number;
      clicks: number;
    }> = [];

    const now = new Date();
    const dateMap = new Map<string, { taps: number; clicks: number }>();

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      days.push({ dateKey, label, taps: 0, clicks: 0 });
      dateMap.set(dateKey, { taps: 0, clicks: 0 });
    }

    // Hitung dari interaction_logs
    const loggedTapsPerCard = new Map<string, number>();
    for (const log of interactionLogs) {
      if (!log.created_at) continue;
      const key = log.created_at.slice(0, 10);
      if (log.interaction_type === 'card_tap') {
        loggedTapsPerCard.set(log.card_id, (loggedTapsPerCard.get(log.card_id) || 0) + 1);
      }
      const bucket = dateMap.get(key);
      if (bucket) {
        if (log.interaction_type === 'card_tap') {
          bucket.taps += 1;
        } else {
          bucket.clicks += 1;
        }
      }
    }

    // Jika ada selisih tap_count pada kartu yang belum tercatat di interaction_logs,
    // distribusikan ke tanggal updated_at / claimed_at / hari ini agar grafik selalu akurat
    const todayKey = now.toISOString().slice(0, 10);
    for (const c of cards) {
      const cardTaps = c.tap_count || 0;
      const loggedTaps = loggedTapsPerCard.get(c.id) || 0;
      const unloggedDiff = Math.max(0, cardTaps - loggedTaps);
      if (unloggedDiff > 0) {
        const refDate = (c.updated_at || c.claimed_at || c.created_at || todayKey).slice(0, 10);
        const targetBucket = dateMap.get(refDate) || dateMap.get(todayKey);
        if (targetBucket) {
          targetBucket.taps += unloggedDiff;
        }
      }
    }

    return days.map((d) => {
      const val = dateMap.get(d.dateKey) || { taps: 0, clicks: 0 };
      return {
        ...d,
        taps: val.taps,
        clicks: val.clicks,
      };
    });
  }, [cards, interactionLogs, chartDays]);

  const maxDailyTap = Math.max(1, ...dailyTrendData.map((d) => d.taps + d.clicks));
  const peakDay = [...dailyTrendData].sort((a, b) => b.taps - a.taps)[0];

  // Top Bisnis Paling Aktif
  const topActiveCards = React.useMemo(() => {
    return [...cards]
      .filter((c) => c.status === 'active' || (c.tap_count || 0) > 0)
      .sort((a, b) => (b.tap_count || 0) - (a.tap_count || 0))
      .slice(0, 5);
  }, [cards]);

  // Log Aktivitas / Audit Trail Real-Time
  const auditEvents = React.useMemo(() => {
    const cardById = new Map<string, Card>();
    for (const c of cards) {
      cardById.set(c.id, c);
    }

    const events: Array<{
      id: string;
      category: 'tap' | 'claim';
      title: string;
      subtitle: string;
      shortCode: string;
      businessName: string;
      timestamp: string;
      badgeColor: string;
    }> = [];

    const interactionLabelMap: Record<string, { title: string; color: string }> = {
      card_tap: { title: 'Tap / Scan Kartu NFC & QR', color: 'bg-blue-100 text-blue-700' },
      click_review: { title: 'Klik Tombol Review Google 5 Bintang', color: 'bg-amber-100 text-amber-800' },
      click_wifi_copy: { title: 'Salin Kata Sandi WiFi', color: 'bg-emerald-100 text-emerald-700' },
      click_whatsapp: { title: 'Klik Hubungi WhatsApp', color: 'bg-green-100 text-green-700' },
      click_instagram: { title: 'Klik Profil Instagram', color: 'bg-pink-100 text-pink-700' },
      click_tiktok: { title: 'Klik Profil TikTok', color: 'bg-cyan-100 text-cyan-700' },
      click_menu: { title: 'Buka Buku Menu / Katalog', color: 'bg-orange-100 text-orange-700' },
      click_services: { title: 'Buka Halaman Reservasi / Layanan', color: 'bg-purple-100 text-purple-700' },
      click_website: { title: 'Buka Situs Web Resmi', color: 'bg-indigo-100 text-indigo-700' },
      click_shopee: { title: 'Buka Toko Shopee', color: 'bg-orange-100 text-orange-800' },
      click_tokopedia: { title: 'Buka Toko Tokopedia', color: 'bg-green-100 text-green-800' },
      click_shopeefood: { title: 'Buka ShopeeFood', color: 'bg-amber-100 text-amber-800' },
      click_gofood: { title: 'Buka GoFood', color: 'bg-rose-100 text-rose-700' },
    };

    // 1. Masukkan log interaksi nyata dari tabel interaction_logs
    for (const log of interactionLogs) {
      const card = cardById.get(log.card_id);
      const meta = interactionLabelMap[log.interaction_type] || {
        title: `Interaksi: ${log.interaction_type}`,
        color: 'bg-gray-100 text-gray-700',
      };
      events.push({
        id: `log-${log.id}`,
        category: 'tap',
        title: meta.title,
        subtitle: card?.business_name
          ? `Pelanggan berinteraksi pada kartu milik ${card.business_name}`
          : 'Interaksi pengunjung pada kartu',
        shortCode: card?.short_code || 'UNKNOWN',
        businessName: card?.business_name || 'Belum Diklaim',
        timestamp: log.created_at,
        badgeColor: meta.color,
      });
    }

    // 2. Masukkan riwayat klaim & perubahan data bisnis dari tabel cards
    for (const c of cards) {
      if (c.claimed_at && c.status === 'active') {
        events.push({
          id: `claim-${c.short_code}`,
          category: 'claim',
          title: 'Kartu Berhasil Diklaim (First-Tap Claim)',
          subtitle: `Diklaim oleh ${c.business_name || 'Pemilik'} (WA: ${c.owner_phone || '-'}) dalam mode ${
            c.mode === 'direct_review' ? 'Direct Review' : 'Smart Hub'
          }`,
          shortCode: c.short_code,
          businessName: c.business_name || '-',
          timestamp: c.claimed_at,
          badgeColor: 'bg-green-100 text-green-800',
        });
      }

      if (
        c.updated_at &&
        c.claimed_at &&
        new Date(c.updated_at).getTime() - new Date(c.claimed_at).getTime() > 5000
      ) {
        events.push({
          id: `update-${c.short_code}-${c.updated_at}`,
          category: 'claim',
          title: 'Pembaruan Data Bisnis / Mode Kartu',
          subtitle: `Profil kartu #${c.short_code} (${c.business_name || 'Unclaimed'}) diperbarui (Total Tap: ${
            c.tap_count || 0
          })`,
          shortCode: c.short_code,
          businessName: c.business_name || 'Unclaimed',
          timestamp: c.updated_at,
          badgeColor: 'bg-purple-100 text-purple-800',
        });
      }
    }

    return events
      .filter((ev) => (auditFilter === 'all' ? true : ev.category === auditFilter))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .slice(0, 40);
  }, [cards, interactionLogs, auditFilter]);

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
                  placeholder="Masukkan kunci akses"
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
    <div className="min-h-screen bg-gray-50 text-gray-900 [color-scheme:light] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <span className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl shrink-0">
              <CreditCard className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                Super Admin: Kartu Pintar & Review
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Kelola stok kartu, generate batch cetak, export CSV & QR Code, dan pantau status First-Tap Claim.
              </p>
            </div>
          </div>

          {/* Action Buttons — Satu Baris Rapi & Sejajar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* Tombol Export QR Codes ZIP */}
            <button
              onClick={() => handleExportQRCodesZip()}
              disabled={cards.length === 0 || isExportingQR}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold transition-all shadow-sm whitespace-nowrap"
              title="Unduh gambar QR Code dalam berkas ZIP"
            >
              {isExportingQR ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {qrProgress ? `${qrProgress.current}/${qrProgress.total}` : 'Memproses...'}
                  </span>
                </>
              ) : (
                <>
                  <FileArchive className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {batchFilter !== 'all' ? `Export QR (${batchFilter})` : 'Export QR Code (ZIP)'}
                  </span>
                </>
              )}
            </button>

            {/* Tombol Export CSV */}
            <button
              onClick={() => handleExportCSV()}
              disabled={cards.length === 0}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm whitespace-nowrap"
              title="Unduh data tabel CSV untuk vendor percetakan"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>
                {batchFilter !== 'all' ? `Export CSV (${batchFilter})` : 'Export CSV Percetakan'}
              </span>
            </button>

            {/* Tombol Refresh */}
            <button
              onClick={() => fetchCards()}
              className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>

            {/* Tombol Kunci Portal (Logout) */}
            <button
              onClick={handleLockPortal}
              className="inline-flex items-center justify-center w-10 h-10 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shrink-0"
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

        {/* =====================================================================
            FITUR 1: GRAFIK & ANALITIK TREN TAP + TOP BISNIS PALING AKTIF
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grafik Tren Tap Harian (7 Kolom) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" /> Grafik & Analitik Tren Tap
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Visualisasi lonjakan tap kartu NFC/QR dan klik layanan harian.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChartDays(7)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      chartDays === 7 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartDays(14)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      chartDays === 14 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    14 Hari
                  </button>
                </div>
              </div>

              {/* Bar Chart Visualisasi */}
              <div className="h-44 pt-6 pb-2 px-2 bg-gray-50/70 border border-gray-100 rounded-xl flex items-end justify-between gap-1.5 sm:gap-2">
                {dailyTrendData.map((day) => {
                  const totalDay = day.taps + day.clicks;
                  const heightPercent = Math.max(8, Math.round((totalDay / maxDailyTap) * 100));
                  const isToday = day.dateKey === new Date().toISOString().slice(0, 10);

                  return (
                    <div
                      key={day.dateKey}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      title={`${day.label}: ${day.taps} Tap Kartu, ${day.clicks} Klik Layanan`}
                    >
                      {/* Angka di atas batang */}
                      <span
                        className={`text-[10px] font-bold mb-1 transition ${
                          totalDay > 0
                            ? 'text-blue-700'
                            : 'text-gray-300 group-hover:text-gray-500'
                        }`}
                      >
                        {totalDay}
                      </span>

                      {/* Batang Grafik */}
                      <div className="w-full max-w-[28px] bg-gray-200/70 rounded-t-lg h-28 flex items-end overflow-hidden">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            totalDay > 0
                              ? isToday
                                ? 'bg-gradient-to-t from-blue-600 to-indigo-500'
                                : 'bg-blue-500 group-hover:bg-blue-600'
                              : 'bg-gray-200'
                          }`}
                        />
                      </div>

                      {/* Label Tanggal */}
                      <span
                        className={`text-[9px] mt-1.5 truncate ${
                          isToday ? 'font-bold text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ringkasan Analitik Bawah Grafik */}
            <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-gray-100 text-xs">
              <div className="bg-blue-50/60 rounded-xl p-2.5">
                <div className="text-[10px] text-gray-500">Hari Puncak (Peak)</div>
                <div className="font-bold text-blue-700 mt-0.5">
                  {peakDay && peakDay.taps > 0 ? `${peakDay.label} (${peakDay.taps} Tap)` : 'Belum ada lonjakan'}
                </div>
              </div>
              <div className="bg-green-50/60 rounded-xl p-2.5">
                <div className="text-[10px] text-gray-500">Rata-rata Tap</div>
                <div className="font-bold text-green-700 mt-0.5">
                  {(totalTaps / Math.max(1, activeCards)).toFixed(1)} Tap / Toko Aktif
                </div>
              </div>
              <div className="bg-amber-50/60 rounded-xl p-2.5">
                <div className="text-[10px] text-gray-500">Rasio Aktivasi</div>
                <div className="font-bold text-amber-700 mt-0.5">
                  {totalCards > 0 ? Math.round((activeCards / totalCards) * 100) : 0}% Kartu Diklaim
                </div>
              </div>
            </div>
          </div>

          {/* Peringkat Bisnis Paling Aktif (5 Kolom) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" /> Bisnis Paling Aktif
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Urutan toko dengan jumlah tap & interaksi tertinggi.
                  </p>
                </div>
              </div>

              {topActiveCards.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Belum ada aktivitas tap pada kartu.
                </div>
              ) : (
                <div className="space-y-3">
                  {topActiveCards.map((c, idx) => {
                    const maxCardTap = Math.max(1, topActiveCards[0]?.tap_count || 1);
                    const pct = Math.max(6, Math.round(((c.tap_count || 0) / maxCardTap) * 100));
                    const reviewHref = getResolvedReviewUrl(c);
                    const valid5Star = isDirectReviewValid(c);

                    return (
                      <div
                        key={c.short_code}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-gray-900">
                                {c.business_name || `Kartu #${c.short_code}`}
                              </span>
                              <span className="ml-1.5 font-mono text-[10px] text-gray-500">
                                #{c.short_code}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-blue-700">{c.tap_count || 0} Tap</span>
                            {reviewHref && (
                              <a
                                href={reviewHref}
                                target="_blank"
                                rel="noreferrer"
                                title={
                                  valid5Star
                                    ? 'Tes Link Review: Valid Langsung 5 Bintang'
                                    : 'Tes Link Review: Masih Peta Biasa'
                                }
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-1 transition ${
                                  valid5Star
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Tes Review</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Total Interaksi Tersimpan: {interactionLogs.length} log</span>
              <span className="text-green-600 font-semibold">Real-Time Aktif</span>
            </div>
          </div>
        </div>

        {/* Grid: Generator Form & Filter */}
        <div id="tabel-kartu-utama" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card Generator Form */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#024aad]" /> Generate Batch Baru
            </h2>
            <form onSubmit={handleGenerateBatch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Jumlah Kartu</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-[#024aad] focus:border-[#024aad]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Prefix Kode</label>
                <input
                  type="text"
                  maxLength={5}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-[#024aad] focus:border-[#024aad]"
                  placeholder="DW"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Nama Batch</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-[#024aad] focus:border-[#024aad]"
                  placeholder="BATCH-NOV2026"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-[#024aad] hover:bg-[#1d6ff2] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Membuat Batch...' : 'Generate Kartu'}
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              {/* Baris Filter: Cari, Filter Batch, dan Filter Status */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2.5 mb-4">
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kode, toko, batch..."
                    className="w-full px-3 py-2 pl-8 text-xs font-medium bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-[#024aad] focus:border-[#024aad]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                </div>

                {/* FITUR 3: Filter Berdasarkan Batch */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <div className="relative flex items-center w-full sm:w-auto">
                    <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 pointer-events-none" />
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      aria-label="Filter Berdasarkan Batch"
                      className="w-full sm:w-auto pl-8 pr-6 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200/70 text-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">Semua Batch ({cards.length})</option>
                      {batchSummaries.map((b) => (
                        <option key={b.batchName} value={b.batchName}>
                          {b.batchName} ({b.total})
                        </option>
                      ))}
                    </select>
                  </div>

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
                      <th className="py-2.5 px-3">Kode & Batch</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Bisnis & Validasi Review</th>
                      <th className="py-2.5 px-3 text-center">Tap</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          {isLoading ? 'Memuat data kartu...' : 'Belum ada kartu ditemukan untuk filter ini.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCards.map((c) => {
                        const reviewHref = getResolvedReviewUrl(c);
                        const valid5Star = isDirectReviewValid(c);

                        return (
                          <tr key={c.short_code} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-mono font-bold text-gray-900">#{c.short_code}</div>
                              <div className="text-[10px] text-gray-400 font-medium">
                                {c.batch_number || 'TANPA-BATCH'}
                              </div>
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
                              {c.status === 'active' && (
                                <div className="text-[9px] text-gray-400 mt-0.5 uppercase font-semibold">
                                  {c.mode === 'direct_review' ? 'Direct Review' : 'Smart Hub'}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 max-w-[220px]">
                              {c.business_name ? (
                                <div className="space-y-1">
                                  <div className="font-semibold truncate">{c.business_name}</div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400">{c.owner_phone || '-'}</span>
                                    {/* FITUR 4: Indikator Validasi Link Bisnis */}
                                    <span
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        valid5Star
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                      title={
                                        valid5Star
                                          ? 'Tautan Google Review sudah valid mengarah ke pop-up 5 bintang (ChIJ / g.page)'
                                          : 'Tautan masih mengarah ke pencarian peta biasa'
                                      }
                                    >
                                      {valid5Star ? (
                                        <>
                                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                          <span>5 Bintang Valid</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                                          <span>Peta Biasa</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Belum diklaim</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                              {c.tap_count || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                              {/* FITUR 4: Tombol Validasi & Preview Link Review Bisnis */}
                              {c.business_name && reviewHref && (
                                <a
                                  href={reviewHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                                    valid5Star
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                  }`}
                                  title="Tes langsung apakah link ulasan Google Maps bisnis ini membuka pop-up 5 bintang"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>Tes Review</span>
                                </a>
                              )}

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
                                title="Buka Halaman Kartu (/c/KODE)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* =====================================================================
            FITUR 2 & FITUR 5: MANAJEMEN RIWAYAT BATCH & LOG AKTIVITAS (AUDIT TRAIL)
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Manajemen & Riwayat Batch (6 Kolom) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> Manajemen & Riwayat Batch
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Daftar seluruh batch produksi yang pernah dibuat beserta progres klaim dan unduhan per batch.
                  </p>
                </div>
                {batchFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setBatchFilter('all')}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Reset Filter Batch
                  </button>
                )}
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 border-y border-gray-100 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Nama Batch</th>
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3">Aktif / Ready</th>
                      <th className="py-2.5 px-3 text-center">Tap</th>
                      <th className="py-2.5 px-3 text-right">Aksi Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          Belum ada riwayat batch.
                        </td>
                      </tr>
                    ) : (
                      batchSummaries.map((b) => {
                        const isSelected = batchFilter === b.batchName;
                        const claimPct = b.total > 0 ? Math.round((b.active / b.total) * 100) : 0;

                        return (
                          <tr
                            key={b.batchName}
                            className={`transition-colors ${
                              isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50/80'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-gray-900">{b.batchName}</div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(b.createdAt).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                              {b.total}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-green-700 font-semibold">{b.active} Aktif</span>
                                <span className="text-gray-300">/</span>
                                <span className="text-amber-700 font-semibold">{b.unclaimed} Ready</span>
                              </div>
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                                <div
                                  style={{ width: `${claimPct}%` }}
                                  className="h-full bg-green-500 rounded-full"
                                />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-blue-700">
                              {b.taps}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setBatchFilter(isSelected ? 'all' : b.batchName);
                                  document
                                    .getElementById('tabel-kartu-utama')
                                    ?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                title="Filter tabel kartu utama untuk batch ini"
                              >
                                {isSelected ? 'Terfilter' : 'Filter'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExportCSV(b.batchName)}
                                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                title={`Unduh CSV khusus batch ${b.batchName}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExportQRCodesZip(b.batchName)}
                                disabled={isExportingQR}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title={`Unduh QR Code ZIP khusus batch ${b.batchName}`}
                              >
                                <FileArchive className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Log Aktivitas / Audit Trail Real-Time (6 Kolom) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" /> Log Aktivitas & Audit Trail
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Pantau siapa yang klaim, kapan kartu di-tap, serta riwayat perubahan data bisnis.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAuditFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      auditFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('tap')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      auditFilter === 'tap' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Tap & Klik
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('claim')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      auditFilter === 'claim' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Klaim & Edit
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {auditEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    Belum ada catatan aktivitas pada kategori ini.
                  </div>
                ) : (
                  auditEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-900">
                            #{ev.shortCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${ev.badgeColor}`}>
                            {ev.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">{ev.subtitle}</p>
                      </div>

                      <div className="text-right shrink-0 text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>
                          {new Date(ev.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Kategori Bisnis</label>
                      <input
                        type="text"
                        value={editingCard.business_category || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, business_category: e.target.value })}
                        placeholder="Contoh: Denim House, Kafe, Resto"
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Google Place ID (Kode ChIJ...)</label>
                      <input
                        type="text"
                        value={editingCard.google_place_id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const trimmed = val.trim();
                          const nextReviewUrl = trimmed.startsWith('ChIJ')
                            ? `https://search.google.com/local/writereview?placeid=${trimmed}`
                            : editingCard.review_url;
                          setEditingCard({
                            ...editingCard,
                            google_place_id: val,
                            review_url: nextReviewUrl,
                          });
                        }}
                        placeholder="Contoh: ChIJ..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Link Langsung Pop-up Review Bintang 5 */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block font-semibold text-gray-800">
                        Link Tujuan Review Google (Pop-up 5 Bintang)
                      </label>
                      {editingCard.review_url &&
                      (editingCard.review_url.includes('writereview') ||
                        editingCard.review_url.includes('g.page/r/') ||
                        editingCard.google_place_id?.startsWith('ChIJ')) ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                          Aktif: Langsung Buka Pop-up 5 Bintang
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Hanya Buka Peta Biasa (Belum Ada ChIJ / g.page)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingCard.review_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, review_url: e.target.value })}
                        placeholder="https://g.page/r/.../review atau https://search.google.com/local/writereview?placeid=ChIJ..."
                        className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                      />
                      {getResolvedReviewUrl(editingCard) && (
                        <a
                          href={getResolvedReviewUrl(editingCard)}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[11px] transition"
                          title="Tes buka link review di tab baru"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Tes Link</span>
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                      Agar mode <strong>Direct Review</strong> langsung memunculkan pop-up 5 bintang (bukan sekadar titik peta), isi <strong>Google Place ID</strong> dengan kode <code>ChIJ...</code> di atas ATAU tempelkan link <code>https://g.page/r/.../review</code> dari profil Google Bisnis toko di kolom ini.
                    </p>
                  </div>

                  {/* Logo & Banner di Modal Edit Admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Logo Toko (1:1)
                          </div>
                          <div className="text-[10px] text-blue-600 font-medium">
                            Rekomendasi: 500 x 500 px (Persegi)
                          </div>
                        </div>
                        {editingCard.logo_url && (
                          <img
                            src={editingCard.logo_url}
                            alt="Logo"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-300"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium transition">
                          <Upload className="w-3 h-3 text-blue-600" />
                          <span>{editingCard.logo_url ? 'Ganti Logo' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleEditLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {editingCard.logo_url && (
                          <button
                            type="button"
                            onClick={() => setEditingCard({ ...editingCard, logo_url: null })}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                            title="Hapus Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Banner Header (16:6)
                          </div>
                          <div className="text-[10px] text-blue-600 font-medium">
                            Rekomendasi: 1200 x 450 px (Landscape)
                          </div>
                        </div>
                        {editingCard.banner_url && (
                          <img
                            src={editingCard.banner_url}
                            alt="Banner"
                            className="w-16 h-8 rounded-lg object-cover border border-gray-300"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium transition">
                          <Upload className="w-3 h-3 text-blue-600" />
                          <span>{editingCard.banner_url ? 'Ganti Banner' : 'Upload Banner'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleEditBannerUpload}
                            className="hidden"
                          />
                        </label>
                        {editingCard.banner_url && (
                          <button
                            type="button"
                            onClick={() => setEditingCard({ ...editingCard, banner_url: null })}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                            title="Hapus Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Kata Sandi WiFi</label>
                      <input
                        type="text"
                        value={editingCard.wifi_password || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, wifi_password: e.target.value })}
                        placeholder="sandiwifi"
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link Layanan / Reservasi</label>
                      <input
                        type="text"
                        value={editingCard.services_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, services_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-2.5 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Username TikTok</label>
                      <input
                        type="text"
                        value={editingCard.tiktok_username || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, tiktok_username: e.target.value })}
                        placeholder="username"
                        className="w-full px-2.5 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Situs Web</label>
                      <input
                        type="text"
                        value={editingCard.website_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, website_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2.5 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link Toko Tokopedia</label>
                      <input
                        type="text"
                        value={editingCard.tokopedia_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, tokopedia_url: e.target.value })}
                        placeholder="https://tokopedia.com/..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Link GoFood</label>
                      <input
                        type="text"
                        value={editingCard.gofood_url || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, gofood_url: e.target.value })}
                        placeholder="https://gofood..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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

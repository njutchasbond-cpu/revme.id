'use client';

import * as React from 'react';
import { Check, Copy, QrCode, Wifi } from 'lucide-react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export interface WifiConnectCardProps {
  ssid: string;
  password?: string | null;
  businessName?: string | null;
  onLogInteraction: (type: string) => void;
}

export function WifiConnectCard({
  ssid,
  password,
  businessName,
  onLogInteraction,
}: WifiConnectCardProps) {
  const [copiedWifi, setCopiedWifi] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [wifiQrDataUrl, setWifiQrDataUrl] = React.useState<string>('');

  const handleCopyWifi = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedWifi(true);
    onLogInteraction('click_wifi_copy');
    setTimeout(() => setCopiedWifi(false), 2200);
  };

  React.useEffect(() => {
    if (!qrOpen) return;
    const escapedSsid = ssid.replace(/([\\;,:])/g, '\\$1');
    const escapedPass = (password || '').replace(/([\\;,:])/g, '\\$1');
    const authType = password ? 'WPA' : 'nopass';
    const wifiPayload = `WIFI:T:${authType};S:${escapedSsid};P:${escapedPass};;`;

    QRCode.toDataURL(wifiPayload, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setWifiQrDataUrl(url))
      .catch(() => {});
  }, [qrOpen, ssid, password]);

  return (
    <>
      <Card className="p-4 border-slate-800/90 bg-slate-900/90 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 shrink-0">
              <Wifi className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-100">
                Koneksi WiFi Pengunjung
              </div>
              <div className="text-xs text-slate-300 font-mono font-semibold">
                {ssid}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="emerald" className="text-[10px] py-0.5 px-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Tersedia</span>
            </Badge>
          </div>
        </div>

        {password && (
          <div className="flex items-center justify-between gap-2 bg-slate-950/85 border border-slate-800/90 rounded-xl px-3.5 py-2.5 text-xs">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-medium text-slate-400">Kata Sandi</span>
              <span className="font-mono text-slate-100 font-semibold tracking-wide truncate">
                {password}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQrOpen(true);
                  onLogInteraction('click_wifi_qr');
                }}
                aria-label="Tampilkan QR WiFi untuk koneksi otomatis"
                className="min-h-[36px] px-2.5 py-1.5 rounded-lg border-slate-700 text-slate-200"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="hidden xs:inline">QR</span>
              </Button>

              <Button
                variant="emerald"
                size="sm"
                onClick={handleCopyWifi}
                className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                {copiedWifi ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{copiedWifi ? 'Tersalin' : 'Salin Sandi'}</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title="Scan QR Koneksi WiFi"
        description={`Arahkan kamera ponsel ke QR ini untuk terhubung otomatis ke WiFi ${
          businessName || ssid
        }.`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3.5 bg-white rounded-2xl shadow-inner border border-slate-200">
            {wifiQrDataUrl ? (
              <img
                src={wifiQrDataUrl}
                alt={`QR Code WiFi ${ssid}`}
                className="w-48 h-48 rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">
                Memuat QR...
              </div>
            )}
          </div>

          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1">
            <div className="text-xs text-slate-300">
              Nama Jaringan (SSID): <span className="font-mono font-bold text-white">{ssid}</span>
            </div>
            {password && (
              <div className="text-xs text-slate-300">
                Sandi: <span className="font-mono font-bold text-emerald-400">{password}</span>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}


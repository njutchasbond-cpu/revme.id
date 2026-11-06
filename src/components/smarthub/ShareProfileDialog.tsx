'use client';

import * as React from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ShareProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  shortCode: string;
}

export function ShareProfileDialog({
  open,
  onOpenChange,
  businessName,
  shortCode,
}: ShareProfileDialogProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  const [shareUrl, setShareUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const currentUrl = window.location.href;
    setShareUrl(currentUrl);

    QRCode.toDataURL(currentUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [open]);

  const handleCopyUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: businessName,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Bagikan ${businessName}`}
      description="Pindai QR Code atau salin tautan di bawah untuk membagikan halaman SmartHub ini."
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3.5 bg-white rounded-2xl shadow-inner border border-slate-200">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code ${businessName}`}
              className="w-44 h-44 rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-500">
              Membuat QR...
            </div>
          )}
        </div>

        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-200 truncate">
            {shareUrl || `/c/${shortCode}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="min-h-[34px] px-2.5 py-1 text-xs shrink-0"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={handleNativeShare}
          className="w-full"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span>Bagikan ke WhatsApp / Aplikasi Lain</span>
        </Button>
      </div>
    </Dialog>
  );
}


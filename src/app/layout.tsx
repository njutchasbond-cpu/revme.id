import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tap to Review — Kartu NFC & QR Google Review',
  description: 'Bantu bisnis lokal mengumpulkan ulasan Google Maps dalam 1 detik dengan kartu tap NFC dan scan QR.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartHub Card by Studio Kalcer — Kartu NFC & Dynamic QR',
  description:
    'Bantu bisnis lokal mengumpulkan ulasan Google Maps bintang 5, membagikan WiFi, menu, dan kanal bisnis dalam 1 detik dengan kartu tap NFC dan scan QR.',
  icons: {
    icon: '/logo-kalcer.png',
    shortcut: '/logo-kalcer.png',
    apple: '/logo-kalcer.png',
  },
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

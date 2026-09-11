import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import { PWARegister } from '@/components/PWARegister';
import './globals.css';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Accountability · Habit & Goal Partner App',
  description: 'Calm, accountability-first habit and goal app designed for trusted relationships.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Accountability' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0b3a5d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}

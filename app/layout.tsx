import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { defaultMetadata } from './seo.config';
import { Suspense } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'  // Optimize font loading
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={`bg-slate-50 ${inter.className}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <Toaster position='top-right' />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Youkhana',
  description:
    'Youkhana is a Sydney based designer that specialises in making one of a kind garments for the bold and diverse community in which we live in today',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={`bg-slate-50 ${inter.className}`}>
        <Header />
        {children}
        <Footer />
        <Toaster position='top-right' />
        <SpeedInsights />
      </body>
    </html>
  );
}

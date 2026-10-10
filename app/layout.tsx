import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StateProvider } from '@/lib/state';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ELRN — Emergency LoRa Rescue Network',
  description:
    'Emergency communication and incident coordination when conventional networks fail.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <StateProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </StateProvider>
      </body>
    </html>
  );
}

import { reportWebVitals as _report } from '@/lib/observability/web-vitals-reporter';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TabSeed',
  description: 'Manage tabs frictionlessly',
};

// Next.js will call this on the client in production
export function reportWebVitals(metric: unknown) {
  _report(metric as any);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

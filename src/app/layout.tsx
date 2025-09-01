import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import type { Metric } from 'web-vitals';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ToastProvider } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { reportWebVitals as _report } from '@/lib/observability/web-vitals-reporter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const plemolJP = localFont({
  src: [
    { path: './fonts/PlemolJP-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/PlemolJP-Medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/PlemolJP-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-plemoljp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TabSeed',
  description: 'Manage tabs frictionlessly',
};

// Next.js will call this on the client in production
export function reportWebVitals(metric: Metric) {
  _report(metric as any);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plemolJP.variable} ${geistSans.variable} ${geistMono.variable}`}>
        <TooltipProvider>
          <ThemeProvider>
            <ToastProvider>
              <div className="fixed right-4 top-4 z-50">
                <ThemeToggle />
              </div>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

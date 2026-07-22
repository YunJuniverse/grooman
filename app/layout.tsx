export const dynamic = 'force-dynamic'

import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import ThemeProvider from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: '그루맨 - 남성 그루밍 커뮤니티',
    template: '%s | 그루맨',
  },
  description: '대한민국 남성 그루밍 전문 커뮤니티. 헤어케어, 탈모, 스킨케어, 쉐이빙, 향수, 시술 후기까지.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grooman.kr'),
  openGraph: {
    siteName: '그루맨',
    type: 'website',
    locale: 'ko_KR',
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#10131a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-[var(--bg-base)] text-[var(--text-1)] min-h-screen flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}

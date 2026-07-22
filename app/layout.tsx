export const dynamic = 'force-dynamic'

import type { Metadata, Viewport } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
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

// 미설정 시 GTM 자체가 렌더되지 않는다 — preview·로컬 트래픽이
// 프로덕션 컨테이너를 오염시키지 않도록 Production 환경에만 설정할 것.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="bg-[var(--bg-base)] text-[var(--text-1)] min-h-screen flex flex-col transition-colors duration-200">
        {/* @next/third-parties는 noscript 폴백을 렌더하지 않아 직접 둔다 */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
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

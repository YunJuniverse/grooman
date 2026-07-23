import localFont from 'next/font/local'

// self-host — 원래 globals.css의 @import(cdn.jsdelivr.net)가 렌더 블로킹 +
// 서드파티 origin이라 LCP·CLS 저하의 주 원인이었다(40_dev/snapshots/lighthouse-measurement-2026-07-24.md).
// 45~920는 Pretendard Variable이 실제로 지원하는 weight axis 범위(패키지 CSS 원본 값).
export const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

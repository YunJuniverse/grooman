import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? '그루맨 - 남성 그루밍 커뮤니티'
  const category = searchParams.get('category') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 패턴 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 60%)',
        }} />

        {/* 카테고리 */}
        {category && (
          <div style={{
            fontSize: 20,
            color: '#94a3b8',
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}>
            {category}
          </div>
        )}

        {/* 제목 */}
        <div style={{
          fontSize: title.length > 30 ? 42 : 52,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.2,
          maxWidth: '90%',
          marginBottom: 32,
        }}>
          {title}
        </div>

        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#60a5fa',
            letterSpacing: 2,
          }}>
            GROOMAN
          </div>
          <div style={{ color: '#475569', fontSize: 18 }}>
            남성 그루밍 커뮤니티
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

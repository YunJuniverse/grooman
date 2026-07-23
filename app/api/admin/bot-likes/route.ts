import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/require-admin'
import { BOT_PROFILES } from '@/lib/bots/data'

// 어드민 대시보드의 수동 트리거 버튼 — 세션 기반 관리자 인증 (크론 없음, 사람 전용)
export async function POST() {
  const authClient = createClient()
  const admin = await requireAdmin(authClient)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  let likes = 0
  const errors: string[] = []

  // 봇 ID 조회
  const { data: botProfiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('username', BOT_PROFILES.map(b => b.username))

  if (!botProfiles?.length) {
    return NextResponse.json({ error: '봇 계정 없음' }, { status: 400 })
  }

  const botIds = botProfiles.map(b => b.id)

  // 최근 50개 게시글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select('id, user_id')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!posts?.length) return NextResponse.json({ likes: 0 })

  // 각 봇이 랜덤 게시글에 좋아요 (자기 글 제외)
  for (const bot of botProfiles) {
    const eligible = posts.filter(p => p.user_id !== bot.id)
    // 랜덤 3~8개 게시글에 좋아요
    const count = Math.floor(Math.random() * 6) + 3
    const targets = [...eligible].sort(() => Math.random() - 0.5).slice(0, count)

    for (const post of targets) {
      try {
        await supabase
          .from('post_likes')
          .insert({ user_id: bot.id, post_id: post.id })
          .throwOnError()
        likes++
      } catch {
        // 이미 좋아요한 경우 무시
      }
    }
  }

  return NextResponse.json({ success: true, likes, message: `봇 좋아요 ${likes}개 완료` })
}

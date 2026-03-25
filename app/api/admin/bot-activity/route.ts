import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOT_PROFILES } from '@/lib/bots/data'
import { generateBotPost, generateBotComments } from '@/lib/bots/generator'
import { generateSlug } from '@/lib/utils/slug'
import type { CategoryEnum } from '@/types/supabase'

// 하루 2~3개 새 게시글, 기존 게시글에 댓글 추가
export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({ secret: '' }))
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = { posts: 0, comments: 0, errors: [] as string[] }

  // 봇 ID 조회
  const { data: botProfiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('username', BOT_PROFILES.map(b => b.username))

  if (!botProfiles?.length) {
    return NextResponse.json({ error: '봇 계정이 없습니다. /api/admin/seed-bots를 먼저 실행하세요.' }, { status: 400 })
  }

  const botUserIds: Record<string, string> = {}
  botProfiles.forEach(p => { botUserIds[p.username] = p.id })

  // ── 새 게시글 2-3개 ──────────────────────────────────────────
  const newPostCount = Math.floor(Math.random() * 2) + 2
  const shuffledBots = [...BOT_PROFILES].sort(() => Math.random() - 0.5).slice(0, newPostCount)

  for (const bot of shuffledBots) {
    const userId = botUserIds[bot.username]
    if (!userId) continue

    try {
      const generated = await generateBotPost(bot)
      const slug = generateSlug(generated.title)

      const { data: post } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          category: bot.specialty as CategoryEnum,
          title: generated.title,
          content: generated.content,
          content_text: generated.content_text,
          thumbnail_url: generated.thumbnail_url,
          tags: generated.tags,
          slug,
          status: 'published',
          ai_summary: generated.ai_summary,
        })
        .select('id')
        .single()

      if (post) results.posts++
      await sleep(500)
    } catch (e) {
      results.errors.push(`새 게시글 오류: ${String(e)}`)
    }
  }

  // ── 기존 게시글에 댓글 추가 ──────────────────────────────────
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, ai_summary, comment_count')
    .eq('status', 'published')
    .lt('comment_count', 8) // 댓글 8개 미만인 글에만
    .order('created_at', { ascending: false })
    .limit(20)

  if (recentPosts?.length) {
    // 랜덤으로 3-5개 게시글에 댓글
    const targetPosts = [...recentPosts]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3)

    for (const post of targetPosts) {
      try {
        const commentingBots = [...BOT_PROFILES]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)

        const comments = await generateBotComments(
          post.title,
          post.ai_summary ?? post.title,
          commentingBots,
          Math.floor(Math.random() * 2) + 2
        ) as Array<{ content: string; authorName?: string; replyTo?: number }>

        const insertedIds: string[] = []

        for (const comment of comments) {
          const authorBot = commentingBots.find(b => b.username === comment.authorName)
            ?? commentingBots[Math.floor(Math.random() * commentingBots.length)]
          const authorId = botUserIds[authorBot.username]
          if (!authorId) continue

          const parentId = comment.replyTo !== undefined && comment.replyTo < insertedIds.length
            ? insertedIds[comment.replyTo]
            : null

          const { data: inserted } = await supabase
            .from('comments')
            .insert({
              post_id: post.id,
              user_id: authorId,
              content: comment.content,
              parent_id: parentId,
            })
            .select('id')
            .single()

          if (inserted) {
            insertedIds.push(inserted.id)
            results.comments++
          }
          await sleep(100)
        }
      } catch (e) {
        results.errors.push(`댓글 오류: ${String(e)}`)
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    message: `게시글 ${results.posts}개, 댓글 ${results.comments}개 추가 완료`,
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

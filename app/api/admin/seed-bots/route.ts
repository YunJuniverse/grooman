import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOT_PROFILES, CATEGORY_IMAGES } from '@/lib/bots/data'
import { generateBotPost, generateBotComments } from '@/lib/bots/generator'
import { generateSlug } from '@/lib/utils/slug'
import type { CategoryEnum } from '@/types/supabase'

const POSTS_PER_BOT = 13 // 8 bots × 13 = 104 posts

export async function POST(req: Request) {
  // 시크릿 검증
  const { secret } = await req.json().catch(() => ({ secret: '' }))
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = { bots: 0, posts: 0, comments: 0, errors: [] as string[] }

  // ── 1. 봇 계정 생성 ──────────────────────────────────────────
  const botUserIds: Record<string, string> = {}

  for (const bot of BOT_PROFILES) {
    try {
      // 이미 있으면 스킵
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', bot.username)
        .single()

      if (existing) {
        botUserIds[bot.username] = existing.id
        continue
      }

      // auth 유저 생성 (user_metadata 없이 → 트리거가 user_XXXXXXXX 임시 username 생성)
      const botEmail = `bot.${Math.random().toString(36).slice(2)}@grooman.kr`
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: botEmail,
        password: `Grooman!${Math.random().toString(36).slice(2)}`,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        results.errors.push(`봇 생성 실패 ${bot.username}: ${authError?.message}`)
        continue
      }

      // 트리거가 생성한 임시 username을 봇 username으로 업데이트
      await supabase
        .from('profiles')
        .update({
          username: bot.username,
          bio: bot.bio,
          level: bot.level,
          avatar_url: bot.avatarUrl,
        })
        .eq('id', authData.user.id)

      botUserIds[bot.username] = authData.user.id
      results.bots++
    } catch (e) {
      results.errors.push(`봇 오류 ${bot.username}: ${String(e)}`)
    }
  }

  // ── 2. 게시글 생성 (봇당 POSTS_PER_BOT개) ────────────────────
  const allCategories: CategoryEnum[] = ['hair', 'skin', 'shaving', 'fragrance', 'clinic', 'deals']
  const createdPosts: Array<{ id: string; title: string; summary: string; authorIds: string[] }> = []

  for (const bot of BOT_PROFILES) {
    const userId = botUserIds[bot.username]
    if (!userId) continue

    for (let i = 0; i < POSTS_PER_BOT; i++) {
      try {
        // 카테고리는 전문 분야 70%, 다른 분야 30%
        const useSpecialty = Math.random() < 0.7
        const category: CategoryEnum = useSpecialty
          ? bot.specialty
          : allCategories[Math.floor(Math.random() * allCategories.length)]

        const generated = await generateBotPost(bot)

        // created_at을 과거 날짜로 분산 (최대 60일 전)
        const daysAgo = Math.floor(Math.random() * 60)
        const hoursAgo = Math.floor(Math.random() * 24)
        const createdAt = new Date(Date.now() - (daysAgo * 86400 + hoursAgo * 3600) * 1000).toISOString()

        const slug = generateSlug(generated.title)

        const { data: post, error } = await supabase
          .from('posts')
          .insert({
            user_id: userId,
            category,
            title: generated.title,
            content: generated.content,
            content_text: generated.content_text,
            thumbnail_url: generated.thumbnail_url,
            tags: generated.tags,
            slug,
            status: 'published',
            ai_summary: generated.ai_summary,
            is_auto_crawled: false,
            created_at: createdAt,
          })
          .select('id')
          .single()

        if (error) {
          results.errors.push(`게시글 오류: ${error.message}`)
          continue
        }

        results.posts++
        createdPosts.push({
          id: post.id,
          title: generated.title,
          summary: generated.ai_summary,
          authorIds: BOT_PROFILES.filter(b => b.username !== bot.username)
            .map(b => botUserIds[b.username])
            .filter(Boolean),
        })

        // API 제한 방지
        await sleep(300)
      } catch (e) {
        results.errors.push(`게시글 생성 오류: ${String(e)}`)
      }
    }
  }

  // ── 3. 댓글 생성 ─────────────────────────────────────────────
  for (const post of createdPosts) {
    try {
      const commentingBots = BOT_PROFILES.filter(b => {
        const uid = botUserIds[b.username]
        return uid && post.authorIds.includes(uid)
      }).slice(0, 4)

      if (commentingBots.length < 2) continue

      const comments = await generateBotComments(
        post.title,
        post.summary,
        commentingBots,
        Math.floor(Math.random() * 3) + 3 // 3-5개
      ) as Array<{ content: string; authorName?: string; replyTo?: number }>

      const insertedCommentIds: string[] = []

      for (const comment of comments) {
        const authorBot = commentingBots.find(b => b.username === comment.authorName)
          ?? commentingBots[Math.floor(Math.random() * commentingBots.length)]
        const authorId = botUserIds[authorBot.username]
        if (!authorId) continue

        const parentId = comment.replyTo !== undefined && comment.replyTo < insertedCommentIds.length
          ? insertedCommentIds[comment.replyTo]
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
          insertedCommentIds.push(inserted.id)
          results.comments++
        }

        await sleep(100)
      }
    } catch (e) {
      results.errors.push(`댓글 오류: ${String(e)}`)
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    message: `봇 ${results.bots}개 생성, 게시글 ${results.posts}개, 댓글 ${results.comments}개 완료`,
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

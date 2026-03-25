import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fetchRssFeed } from '@/lib/crawlers/rss'
import { analyzeCrawledContent } from '@/lib/ai/claude'
import { generateSlug } from '@/lib/utils/slug'
import type { CategoryEnum } from '@/types/supabase'

export const maxDuration = 60

function md5Hash(str: string): string {
  // 간단한 해시 (브라우저 없이 동작하는 버전)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
    ?? request.nextUrl.searchParams.get('secret')

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let processed = 0, skipped = 0, failed = 0

  // 활성화된 크롤링 소스 가져오기
  const { data: sources } = await supabase
    .from('crawl_sources')
    .select('*')
    .eq('is_active', true) as { data: import('@/types/supabase').CrawlSource[] | null }

  if (!sources?.length) {
    return NextResponse.json({ message: '활성 소스 없음', processed: 0, skipped: 0, failed: 0 })
  }

  for (const source of sources) {
    try {
      const items = await fetchRssFeed(source.rss_url)

      for (const item of items.slice(0, 10)) { // 소스당 최대 10개
        const urlHash = md5Hash(item.link)

        // 중복 체크
        const { data: existing } = await supabase
          .from('crawl_queue')
          .select('id')
          .eq('url_hash', urlHash)
          .single()

        if (existing) { skipped++; continue }

        // 글자 수 필터
        if (item.description.length < 200) { skipped++; continue }

        // crawl_queue에 추가
        await supabase.from('crawl_queue').insert({
          source_id: source.id,
          source_url: item.link,
          url_hash: urlHash,
          status: 'processing',
        })

        // Claude Haiku AI 분석
        const analysis = await analyzeCrawledContent(item.title, item.description)

        if (!analysis || analysis.spam_score >= 0.7 || analysis.is_advertisement) {
          await supabase.from('crawl_queue').update({ status: 'failed', error_msg: 'spam_or_ad' })
            .eq('url_hash', urlHash)
          skipped++
          continue
        }

        // posts 테이블에 저장
        const slug = generateSlug(item.title)
        const content = {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: item.description.slice(0, 2000) }] }
          ]
        }

        const { error: insertError } = await supabase.from('posts').insert({
          user_id: null,
          category: analysis.category as CategoryEnum,
          title: item.title,
          content,
          content_text: item.description.slice(0, 2000),
          slug,
          tags: analysis.tags.slice(0, 5),
          status: 'published',
          is_auto_crawled: true,
          source_url: item.link,
          ai_summary: analysis.summary,
        })

        if (insertError) {
          await supabase.from('crawl_queue').update({ status: 'failed', error_msg: insertError.message })
            .eq('url_hash', urlHash)
          failed++
        } else {
          await supabase.from('crawl_queue').update({ status: 'done', processed_at: new Date().toISOString() })
            .eq('url_hash', urlHash)
          processed++
        }
      }

      // last_crawled_at 업데이트
      await supabase.from('crawl_sources')
        .update({ last_crawled_at: new Date().toISOString() })
        .eq('id', source.id)

    } catch (err) {
      console.error(`소스 처리 실패 [${source.source_name}]:`, err)
      failed++
    }
  }

  return NextResponse.json({ processed, skipped, failed, sources: sources.length })
}

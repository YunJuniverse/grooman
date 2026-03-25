'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Flame, TrendingUp, Calendar, Eye, ThumbsUp, MessageSquare, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

type Period = 'realtime' | 'daily' | 'weekly'

const PERIODS: { key: Period; label: string; icon: React.ReactNode; hours: number }[] = [
  { key: 'realtime', label: '실시간',   icon: <Flame size={12} />,      hours: 3   },
  { key: 'daily',    label: '일간 HOT', icon: <TrendingUp size={12} />, hours: 24  },
  { key: 'weekly',   label: '주간 HOT', icon: <Calendar size={12} />,   hours: 168 },
]

const CATEGORY_LABELS: Record<string, string> = {
  hair: '헤어케어', skin: '스킨케어', shaving: '쉐이빙',
  fragrance: '향수', clinic: '시술·성형', deals: '핫딜',
}

const CATEGORY_COLORS: Record<string, string> = {
  hair:      'text-amber-600  dark:text-amber-400',
  skin:      'text-sky-600    dark:text-sky-400',
  shaving:   'text-violet-600 dark:text-violet-400',
  fragrance: 'text-pink-600   dark:text-pink-400',
  clinic:    'text-emerald-600 dark:text-emerald-400',
  deals:     'text-red-600    dark:text-red-400',
}

type HotPost = {
  id: string; title: string; slug: string; category: string
  like_count: number; view_count: number; comment_count: number
  hot_rank: number; created_at: string; thumbnail_url: string | null
  profiles?: { username: string } | null
}

export default function HotBoard() {
  const [period, setPeriod] = useState<Period>('daily')
  const [posts, setPosts] = useState<HotPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchPosts = useCallback(async (p: Period) => {
    setLoading(true)
    const hours = PERIODS.find(x => x.key === p)!.hours
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, category, like_count, view_count, comment_count, hot_rank, created_at, thumbnail_url, profiles!user_id(username)')
      .eq('status', 'published')
      .gte('created_at', since)
      .order(p === 'realtime' ? 'hot_rank' : 'like_count', { ascending: false })
      .limit(10)
    setPosts((data ?? []) as unknown as HotPost[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPosts(period) }, [period, fetchPosts])

  return (
    <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
              <Flame size={13} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-[var(--text-1)]">인기 게시글</h2>
          </div>
          <Link href="/search?sort=hot" className="text-xs text-[var(--text-3)] hover:text-[var(--accent)] flex items-center gap-0.5 transition-colors">
            전체보기 <ChevronRight size={13} />
          </Link>
        </div>

        {/* 기간 탭 */}
        <div className="flex gap-1 border-b border-[var(--border-sub)]">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors',
                period === p.key
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
              )}
            >
              {p.icon}{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 리스트 */}
      <div className="divide-y divide-[var(--border-sub)]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-5 h-5 bg-[var(--border)] rounded flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-[var(--border)] rounded w-4/5" />
                <div className="h-2.5 bg-[var(--border-sub)] rounded w-1/3" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[var(--text-3)]">
            아직 인기 게시글이 없습니다
          </div>
        ) : (
          posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors group"
            >
              {/* 순위 */}
              <span className={cn(
                'flex-shrink-0 w-5 text-center text-xs',
                i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : 'text-[var(--text-4)] font-bold'
              )}>
                {i + 1}
              </span>

              {/* 썸네일 */}
              {post.thumbnail_url && (
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--border)]">
                  <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                </div>
              )}

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-1)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[10px] font-semibold', CATEGORY_COLORS[post.category])}>
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-rose-500 dark:text-rose-400">
                    <ThumbsUp size={9} />{post.like_count}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)]">
                    <Eye size={9} />{post.view_count}
                  </span>
                  {post.comment_count > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)]">
                      <MessageSquare size={9} />{post.comment_count}
                    </span>
                  )}
                </div>
              </div>

              {/* TOP3 뱃지 */}
              {i < 3 && (
                <span className={cn(
                  'flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full',
                  i === 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                  i === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                  'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
                )}>
                  {i === 0 ? 'HOT' : i === 1 ? '2nd' : '3rd'}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

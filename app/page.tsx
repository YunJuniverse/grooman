import type { Metadata } from 'next'
import Link from 'next/link'
import { Scissors, Droplets, Zap, Wind, Stethoscope, Tag } from 'lucide-react'
import PostList from '@/components/posts/PostList'
import HotBoard from '@/components/posts/HotBoard'
import Sidebar from '@/components/layout/Sidebar'
import PopularTags from '@/components/layout/PopularTags'
import AdBanner from '@/components/layout/AdBanner'
import { getHotPosts } from '@/lib/utils/posts'
import { createClient } from '@/lib/supabase/server'
import type { Post } from '@/types/supabase'

export const metadata: Metadata = {
  title: '그루맨 - 남성 그루밍 커뮤니티',
  description: '대한민국 남성 그루밍 전문 커뮤니티. 헤어케어, 탈모, 스킨케어, 쉐이빙, 향수, 시술 후기까지 모든 그루밍 정보.',
}

export const revalidate = 60

const CATEGORIES = [
  { slug: 'hair', label: '헤어케어·탈모', icon: Scissors, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50' },
  { slug: 'skin', label: '스킨케어', icon: Droplets, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50' },
  { slug: 'shaving', label: '쉐이빙', icon: Zap, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50' },
  { slug: 'fragrance', label: '향수', icon: Wind, color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50' },
  { slug: 'clinic', label: '시술·성형', icon: Stethoscope, color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50' },
  { slug: 'deals', label: '핫딜·이벤트', icon: Tag, color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50' },
]

async function getLatestPosts(): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20)
    return (data ?? []) as Post[]
  } catch { return [] }
}

export default async function HomePage() {
  const [latestPosts, hotPosts] = await Promise.all([
    getLatestPosts(),
    getHotPosts(),
  ])

  return (
    <div className="flex gap-5 xl:gap-6">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0">
        {/* 카테고리 그리드 */}
        <section className="mb-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map(({ slug, label, icon: Icon, color }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${color}`}
              >
                <Icon size={18} />
                <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* HOT 게시판 */}
        <section className="mb-5">
          <HotBoard />
        </section>

        {/* 최신 게시글 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">최신 글</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">실시간 업데이트</span>
          </div>
          <PostList initialPosts={latestPosts} sort="latest" showCategory />
        </section>
      </div>

      {/* 사이드바 (데스크탑) */}
      <div className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
        <Sidebar hotPosts={hotPosts} />
        <AdBanner placement="sidebar" limit={2} />
        <PopularTags />
      </div>
    </div>
  )
}

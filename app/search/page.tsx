import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/posts/PostCard'
import type { Post } from '@/types/supabase'

interface Props {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: searchParams.q ? `"${searchParams.q}" 검색 결과` : '검색',
    robots: { index: false },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? ''
  let posts: Post[] = []

  if (q.length >= 2 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*, profiles!user_id(id, username, avatar_url, level)')
        .eq('status', 'published')
        .or(`title.ilike.%${q}%,content_text.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(30)
      posts = (data ?? []) as Post[]
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {q ? `"${q}" 검색 결과` : '검색'}
      </h1>
      {q && (
        <p className="text-sm text-gray-500 mb-6">{posts.length}개의 게시글을 찾았습니다.</p>
      )}

      {!q && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">검색어를 입력해주세요.</p>
        </div>
      )}

      {q && posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">검색 결과가 없습니다.</p>
          <p className="text-xs mt-1">다른 검색어로 시도해보세요.</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <PostCard key={post.id} post={post} showCategory />
        ))}
      </div>
    </div>
  )
}

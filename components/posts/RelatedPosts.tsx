import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { CategoryEnum, Post } from '@/types/supabase'

export default async function RelatedPosts({
  currentPostId,
  category,
  tags,
}: {
  currentPostId: string
  category: CategoryEnum
  tags: string[]
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = createClient()
  let posts: Post[] = []

  // 같은 태그 우선, 없으면 같은 카테고리
  if (tags.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('id, title, thumbnail_url, category, created_at, profiles!user_id(username)')
      .eq('status', 'published')
      .neq('id', currentPostId)
      .contains('tags', [tags[0]])
      .order('hot_rank', { ascending: false })
      .limit(3)
    posts = (data ?? []) as unknown as Post[]
  }

  if (posts.length < 3) {
    const { data } = await supabase
      .from('posts')
      .select('id, title, thumbnail_url, category, created_at, profiles!user_id(username)')
      .eq('status', 'published')
      .eq('category', category)
      .neq('id', currentPostId)
      .not('id', 'in', `(${posts.map(p => p.id).join(',') || 'null'})`)
      .order('hot_rank', { ascending: false })
      .limit(3 - posts.length)
    posts = [...posts, ...(data ?? []) as unknown as Post[]]
  }

  if (posts.length === 0) return null

  const CATEGORY_LABELS: Record<string, string> = {
    hair: '헤어케어·탈모', skin: '스킨케어', shaving: '쉐이빙',
    fragrance: '향수', clinic: '시술·성형', deals: '핫딜·이벤트',
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-base font-bold text-gray-900 mb-4">관련 게시글</h3>
      <div className="space-y-3">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex gap-3 group"
          >
            <div className="relative w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
              {post.thumbnail_url && (
                <Image src={post.thumbnail_url} alt={post.title} fill sizes="64px" className="object-cover group-hover:scale-105 transition" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-400">{CATEGORY_LABELS[post.category]}</span>
              <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-gray-600 transition leading-snug mt-0.5">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

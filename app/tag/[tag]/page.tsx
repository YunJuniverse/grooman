import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/posts/PostCard'
import type { Post } from '@/types/supabase'

interface Props {
  params: { tag: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag)
  return {
    title: `#${tag} 태그`,
    description: `그루맨에서 #${tag} 태그가 붙은 게시글을 모아봤습니다.`,
  }
}

export default async function TagPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag)
  let posts: Post[] = []
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*, profiles!user_id(id, username, avatar_url, level)')
        .eq('status', 'published')
        .contains('tags', [tag])
        .order('created_at', { ascending: false })
        .limit(30)
      posts = (data ?? []) as Post[]
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">#{tag}</h1>
      <p className="text-sm text-gray-500 mb-6">{posts.length}개의 게시글</p>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          아직 이 태그의 게시글이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} showCategory />
          ))}
        </div>
      )}
    </div>
  )
}

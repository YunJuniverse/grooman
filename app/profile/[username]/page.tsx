import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/posts/PostCard'
import type { Post, Profile } from '@/types/supabase'

interface Props {
  params: { username: string }
}

const LEVEL_LABELS = ['', '새내기', '그루머', '단골', '장인', '마스터']
const LEVEL_COLORS = [
  '', 'bg-gray-100 text-gray-600', 'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700'
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeURIComponent(params.username)
  return {
    title: `${username}의 프로필`,
    description: `${username}님의 그루맨 프로필 페이지`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const username = decodeURIComponent(params.username)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound()
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles!user_id(id, username, avatar_url, level)')
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  const userPosts = (posts ?? []) as Post[]

  return (
    <div className="max-w-3xl mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="relative w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {profile.avatar_url
              ? <Image src={profile.avatar_url} alt={profile.username} fill sizes="80px" className="object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-2xl text-gray-500 font-medium">
                  {profile.username[0].toUpperCase()}
                </span>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
              <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[profile.level]}`}>
                {LEVEL_LABELS[profile.level]}
              </span>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>게시글 <strong className="text-gray-900">{profile.post_count}</strong></span>
              <span>포인트 <strong className="text-gray-900">{profile.point.toLocaleString()}</strong></span>
              <span>가입일 {new Date(profile.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <h2 className="text-base font-bold text-gray-900 mb-3">작성한 글</h2>
      {userPosts.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">아직 작성한 게시글이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {userPosts.map(post => (
            <PostCard key={post.id} post={post} showCategory />
          ))}
        </div>
      )}
    </div>
  )
}

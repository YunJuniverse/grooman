'use client'
import { useState } from 'react'
import Link from 'next/link'
import PostCard from '@/components/posts/PostCard'
import type { Post, Profile } from '@/types/supabase'
import { BookMarked, FileText, Star, TrendingUp } from 'lucide-react'

const LEVEL_LABELS = ['', '새내기', '그루머', '단골', '장인', '마스터']
const LEVEL_COLORS = ['', 'bg-gray-100 text-gray-600', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700']
const LEVEL_THRESHOLDS = [0, 0, 5, 20, 50, 100]

export default function MyPageClient({
  profile,
  myPosts,
  bookmarkedPosts,
}: {
  profile: Profile
  myPosts: Post[]
  bookmarkedPosts: Post[]
}) {
  const [tab, setTab] = useState<'posts' | 'bookmarks'>('posts')

  const nextLevel = profile.level < 5 ? profile.level + 1 : null
  const progress = nextLevel
    ? Math.min((profile.post_count / LEVEL_THRESHOLDS[nextLevel]) * 100, 100)
    : 100

  return (
    <div className="max-w-3xl mx-auto">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-2xl text-gray-500 font-bold">
                  {profile.username[0].toUpperCase()}
                </span>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[profile.level]}`}>
                {LEVEL_LABELS[profile.level]}
              </span>
              <Link href="/my/edit" className="ml-auto text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50">
                프로필 편집
              </Link>
            </div>
            {profile.bio && <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>}

            {/* 통계 */}
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FileText size={14} />게시글 <strong className="text-gray-900">{profile.post_count}</strong></span>
              <span className="flex items-center gap-1"><Star size={14} />포인트 <strong className="text-gray-900">{profile.point.toLocaleString()}</strong></span>
            </div>

            {/* 레벨 진행도 */}
            {nextLevel && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Lv.{profile.level} → Lv.{nextLevel} {LEVEL_LABELS[nextLevel]}</span>
                  <span>{profile.post_count}/{LEVEL_THRESHOLDS[nextLevel]}개</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            tab === 'posts' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={15} />내가 쓴 글 <span className="text-xs text-gray-400">({myPosts.length})</span>
        </button>
        <button
          onClick={() => setTab('bookmarks')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            tab === 'bookmarks' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookMarked size={15} />북마크 <span className="text-xs text-gray-400">({bookmarkedPosts.length})</span>
        </button>
      </div>

      {/* 목록 */}
      {tab === 'posts' && (
        myPosts.length === 0
          ? <Empty text="아직 작성한 게시글이 없습니다." />
          : <div className="space-y-3">{myPosts.map(p => <PostCard key={p.id} post={p} showCategory />)}</div>
      )}
      {tab === 'bookmarks' && (
        bookmarkedPosts.length === 0
          ? <Empty text="북마크한 게시글이 없습니다." />
          : <div className="space-y-3">{bookmarkedPosts.map(p => <PostCard key={p.id} post={p} showCategory />)}</div>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

'use client'
import { useState, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThumbsUp, Bookmark, Share2, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { relativeTime } from '@/lib/utils/date'
import { toggleLike, toggleBookmark, deletePost } from '@/app/posts/actions'
import { useAuth } from '@/hooks/useAuth'
import CommentSection from '@/components/comments/CommentSection'
import TiptapRenderer from '@/components/editor/TiptapRenderer'
import ReportButton from '@/components/moderation/ReportButton'
import type { Post } from '@/types/supabase'
import { cn } from '@/lib/utils/cn'

const CATEGORY_LABELS: Record<string, string> = {
  hair: '헤어케어·탈모', skin: '스킨케어', shaving: '쉐이빙',
  fragrance: '향수', clinic: '시술·성형 후기', deals: '핫딜·이벤트',
}

interface PostDetailClientProps {
  post: Post
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  function handleLike() {
    if (!user) { router.push('/login'); return }
    startTransition(async () => {
      const result = await toggleLike(post.id)
      if (!result?.error) {
        setLiked(v => !v)
        setLikeCount(v => liked ? v - 1 : v + 1)
      }
    })
  }

  function handleBookmark() {
    if (!user) { router.push('/login'); return }
    startTransition(async () => {
      const result = await toggleBookmark(post.id)
      if (!result?.error) setBookmarked(v => !v)
    })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다.')
    }
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await deletePost(post.id, post.slug, post.category)
  }

  const isAuthor = user?.id === post.user_id
  const isAdmin = profile?.is_admin

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700">홈</Link>
        <span>/</span>
        <Link href={`/${post.category}`} className="hover:text-gray-700">
          {CATEGORY_LABELS[post.category]}
        </Link>
      </nav>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {CATEGORY_LABELS[post.category]}
            </span>
            {post.is_auto_crawled && (
              <span className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                자동수집
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{post.title}</h1>

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map(tag => (
                <Link key={tag} href={`/tag/${tag}`} className="text-xs text-blue-600 hover:underline">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 작성자 + 메타 */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {post.profiles && (
                <>
                  <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {post.profiles.avatar_url
                        ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            {post.profiles.username[0]}
                          </span>
                      }
                    </div>
                    <span className="text-sm font-medium text-gray-800">{post.profiles.username}</span>
                  </Link>
                  <span className="text-xs text-gray-400">{relativeTime(post.created_at)}</span>
                  <span className="text-xs text-gray-400">조회 {post.view_count.toLocaleString()}</span>
                </>
              )}
            </div>

            {(isAuthor || isAdmin) && (
              <div className="flex items-center gap-1">
                <Link
                  href={`/posts/${post.slug}/edit`}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI 요약 */}
        {post.ai_summary && (
          <div className="mx-6 my-4 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-1">AI 요약</p>
            <p className="text-sm text-blue-800 leading-relaxed">{post.ai_summary}</p>
          </div>
        )}

        {/* 본문 */}
        <div className="px-6 py-4">
          <TiptapRenderer content={post.content} />
        </div>

        {/* 출처 링크 (자동수집) */}
        {post.is_auto_crawled && post.source_url && (
          <div className="mx-6 mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">원본 출처</p>
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink size={13} />
              {post.source_url}
            </a>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition',
                liked
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              <ThumbsUp size={15} />
              추천 {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition',
                bookmarked
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
              )}
            >
              <Bookmark size={15} />
              북마크
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              <Share2 size={15} />
              공유
            </button>
            <ReportButton targetType="post" targetId={post.id} />
          </div>
        </div>
      </article>

      {/* 댓글 */}
      <CommentSection postId={post.id} />
    </div>
  )
}

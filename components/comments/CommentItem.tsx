'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ThumbsUp, CornerDownRight, Trash2, ChevronDown } from 'lucide-react'
import { relativeTime } from '@/lib/utils/date'
import { createComment, deleteComment, toggleCommentLike } from '@/app/posts/comment-actions'
import ReportButton from '@/components/moderation/ReportButton'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Comment } from '@/types/supabase'
import { cn } from '@/lib/utils/cn'

interface CommentItemProps {
  comment: Comment
  postId: string
  onRefresh: () => void
  depth?: number
}

export default function CommentItem({ comment, postId, onRefresh, depth = 0 }: CommentItemProps) {
  const { user } = useAuth()
  const [replies, setReplies] = useState<Comment[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [likeCount, setLikeCount] = useState(comment.like_count)
  const [liked, setLiked] = useState(false)
  const [collapsed, setCollapsed] = useState(comment.like_count < -5)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  async function loadReplies() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true })
    setReplies((data ?? []) as Comment[])
    setShowReplies(true)
  }

  function handleReply() {
    if (!user) { window.location.href = '/login'; return }
    setShowReplyForm(v => !v)
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createComment(postId, replyContent, comment.id)
      if (!result?.error) {
        setReplyContent('')
        setShowReplyForm(false)
        loadReplies()
        onRefresh()
      }
    })
  }

  function handleLike() {
    if (!user) return
    startTransition(async () => {
      const result = await toggleCommentLike(comment.id)
      if (!result?.error) {
        setLiked(v => !v)
        setLikeCount(v => liked ? v - 1 : v + 1)
      }
    })
  }

  async function handleDelete() {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    await deleteComment(comment.id)
    onRefresh()
  }

  if (collapsed) {
    return (
      <div className="py-2 px-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <ChevronDown size={12} />
          [비추천이 많아 숨겨진 댓글입니다 - 클릭하여 보기]
        </button>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100', depth > 0 && 'ml-6 mt-1')}>
      <div className="px-4 py-3">
        {/* 작성자 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {comment.profiles && (
              <>
                <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {comment.profiles.avatar_url
                    ? <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        {comment.profiles.username[0]}
                      </span>
                  }
                </div>
                <Link href={`/profile/${comment.profiles.username}`} className="text-sm font-medium text-gray-800 hover:underline">
                  {comment.profiles.username}
                </Link>
                <span className="text-xs text-gray-400">{relativeTime(comment.created_at)}</span>
              </>
            )}
          </div>
          {user?.id === comment.user_id && !comment.is_deleted && (
            <button onClick={handleDelete} className="p-1 rounded text-gray-300 hover:text-red-400 transition">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* 내용 */}
        <p className={cn('text-sm text-gray-700 leading-relaxed', comment.is_deleted && 'text-gray-400 italic')}>
          {comment.content}
        </p>

        {/* 액션 */}
        {!comment.is_deleted && (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              className={cn('flex items-center gap-1 text-xs transition', liked ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600')}
            >
              <ThumbsUp size={12} />
              {likeCount > 0 && likeCount}
            </button>
            {depth === 0 && (
              <button onClick={handleReply} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
                <CornerDownRight size={12} />
                답글
              </button>
            )}
            {depth === 0 && replies.length === 0 && !showReplies && (
              <button onClick={loadReplies} className="text-xs text-gray-400 hover:text-gray-600 transition">
                답글 보기
              </button>
            )}
            <ReportButton targetType="comment" targetId={comment.id} variant="text" />
          </div>
        )}

        {/* 답글 폼 */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400"
            />
            <div className="flex justify-end gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending || !replyContent.trim()}
                className="px-3 py-1 text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-60"
              >
                등록
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 대댓글 */}
      {showReplies && replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          onRefresh={onRefresh}
          depth={1}
        />
      ))}
    </div>
  )
}

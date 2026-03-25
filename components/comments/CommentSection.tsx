'use client'
import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createComment } from '@/app/posts/comment-actions'
import CommentItem from './CommentItem'
import type { Comment } from '@/types/supabase'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
    setComments((data ?? []) as Comment[])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()

    // Realtime 구독
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createComment(postId, content)
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
        fetchComments()
      }
    })
  }

  const rootComments = comments.filter(c => !c.parent_id)

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        댓글 {rootComments.length}
      </h2>

      {/* 댓글 작성 */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-gray-400 transition"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg disabled:opacity-60 transition"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              댓글 등록
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">로그인</a> 후 댓글을 작성할 수 있습니다.
        </div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-1">
          {rootComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onRefresh={fetchComments}
            />
          ))}
          {rootComments.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">첫 번째 댓글을 남겨보세요.</p>
          )}
        </div>
      )}
    </section>
  )
}

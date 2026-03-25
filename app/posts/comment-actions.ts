'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createComment(postId: string, content: string, parentId?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!content.trim() || content.length > 2000) {
    return { error: '댓글 내용이 올바르지 않습니다.' }
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
    parent_id: parentId ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/posts/[id]`, 'page')
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, content: '[삭제된 댓글입니다]' })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/posts/[id]`, 'page')
  return { success: true }
}

export async function toggleCommentLike(commentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId)
    return { liked: false }
  } else {
    await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId })
    return { liked: true }
  }
}

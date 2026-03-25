'use server'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils/slug'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { CategoryEnum } from '@/types/supabase'

function extractText(content: Record<string, unknown>): string {
  let text = ''
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (n.type === 'text' && typeof n.text === 'string') text += n.text + ' '
    if (Array.isArray(n.content)) n.content.forEach(walk)
  }
  walk(content)
  return text.trim()
}

function extractThumbnail(content: Record<string, unknown>): string | null {
  function walk(node: unknown): string | null {
    if (!node || typeof node !== 'object') return null
    const n = node as Record<string, unknown>
    if (n.type === 'image') {
      const attrs = n.attrs as Record<string, unknown> | undefined
      if (attrs?.src && typeof attrs.src === 'string') return attrs.src
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        const result = walk(child)
        if (result) return result
      }
    }
    return null
  }
  return walk(content)
}

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const category = formData.get('category') as CategoryEnum
  const contentRaw = formData.get('content') as string
  const tagsRaw = formData.get('tags') as string

  if (!title || !category || !contentRaw) {
    throw new Error('필수 필드가 누락되었습니다.')
  }

  const content = JSON.parse(contentRaw) as Record<string, unknown>
  const content_text = extractText(content)
  const thumbnail_url = extractThumbnail(content)
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5) : []
  const slug = generateSlug(title)

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      category,
      content,
      content_text,
      thumbnail_url,
      tags,
      slug,
      status: 'published',
    })
    .select('slug')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/${category}`)
  revalidatePath('/')
  redirect(`/posts/${data.slug}`)
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const category = formData.get('category') as CategoryEnum
  const contentRaw = formData.get('content') as string
  const tagsRaw = formData.get('tags') as string

  const content = JSON.parse(contentRaw) as Record<string, unknown>
  const content_text = extractText(content)
  const thumbnail_url = extractThumbnail(content)
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5) : []

  const { data, error } = await supabase
    .from('posts')
    .update({ title, category, content, content_text, thumbnail_url, tags })
    .eq('id', postId)
    .eq('user_id', user.id)
    .select('slug')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/posts/${data.slug}`)
  revalidatePath(`/${category}`)
  redirect(`/posts/${data.slug}`)
}

export async function deletePost(postId: string, slug: string, category: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('posts')
    .update({ status: 'deleted' })
    .eq('id', postId)
    .eq('user_id', user.id)

  revalidatePath(`/${category}`)
  redirect(`/${category}`)
}

export async function toggleLike(postId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('post_likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', postId)
    return { liked: false }
  } else {
    await supabase.from('post_likes').insert({ user_id: user.id, post_id: postId })
    return { liked: true }
  }
}

export async function toggleBookmark(postId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
    return { bookmarked: false }
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
    return { bookmarked: true }
  }
}

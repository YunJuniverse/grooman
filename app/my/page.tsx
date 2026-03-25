import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import MyPageClient from './MyPageClient'
import type { Post } from '@/types/supabase'

export const metadata: Metadata = { title: '마이페이지' }

export default async function MyPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const [{ data: myPosts }, { data: bookmarks }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('bookmarks')
      .select('post_id, posts(*, profiles!user_id(id, username, avatar_url, level))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const bookmarkedPosts = (bookmarks ?? [])
    .map((b: Record<string, unknown>) => b.posts)
    .filter(Boolean) as Post[]

  return (
    <MyPageClient
      profile={profile}
      myPosts={(myPosts ?? []) as Post[]}
      bookmarkedPosts={bookmarkedPosts}
    />
  )
}

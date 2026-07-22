import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AdminDashboard from './AdminDashboard'

export const metadata: Metadata = {
  title: '관리자 패널',
  robots: { index: false },
}

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) redirect('/')

  const [
    { count: totalPosts },
    { count: crawledPosts },
    { count: totalUsers },
    { data: recentQueue },
    { data: sources },
    { data: users },
    { data: posts },
    { data: ads },
    { data: reports },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_auto_crawled', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('crawl_queue').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('crawl_sources').select('*').order('source_name'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('posts')
      .select('id, title, category, status, created_at, view_count, like_count, profiles!user_id(username)')
      .in('status', ['published', 'hidden'])
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('ads').select('*').order('placement').order('order_num'),
    supabase.from('reports')
      .select('*, reporter:profiles!reporter_id(username)')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <AdminDashboard
      stats={{ totalPosts: totalPosts ?? 0, crawledPosts: crawledPosts ?? 0, totalUsers: totalUsers ?? 0 }}
      recentQueue={recentQueue ?? []}
      sources={sources ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users={(users ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts={(posts ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ads={(ads ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reports={(reports ?? []) as any}
    />
  )
}

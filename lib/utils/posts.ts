import { createClient } from '@/lib/supabase/server'
import type { CategoryEnum, Post } from '@/types/supabase'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function getPostsByCategory(category: CategoryEnum, limit = 20): Promise<Post[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('category', category)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as Post[]
  } catch { return [] }
}

export async function getHotPosts(limit = 5): Promise<Post[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const supabase = createClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, category, hot_rank')
      .eq('status', 'published')
      .gte('created_at', since)
      .order('hot_rank', { ascending: false })
      .limit(limit)
    return (data ?? []) as Post[]
  } catch { return [] }
}

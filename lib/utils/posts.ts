import { createClient } from '@/lib/supabase/server'
import { HOT_MIN_LIKES, REDISPLAY_EXCLUDED_FILTER } from '@/lib/community/policy'
import type { CategoryEnum, Post } from '@/types/supabase'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
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

// HOT 보드는 홈·전 카테고리 페이지에 공통으로 붙는 **카테고리 밖 재노출 표면**이다.
// 임계값·제외 카테고리 근거는 lib/community/policy.ts 참조.
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
      .gte('like_count', HOT_MIN_LIKES)
      .not('category', 'in', REDISPLAY_EXCLUDED_FILTER)
      .order('hot_rank', { ascending: false })
      .limit(limit)
    return (data ?? []) as Post[]
  } catch { return [] }
}

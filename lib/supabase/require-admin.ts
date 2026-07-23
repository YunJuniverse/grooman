import type { SupabaseClient } from '@supabase/supabase-js'

// 세션 쿠키 → auth.uid() → profiles.is_admin 확인 (app/moderation/actions.ts와 동일 패턴)
export async function requireAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return (profile as { is_admin: boolean } | null)?.is_admin ? user : null
}

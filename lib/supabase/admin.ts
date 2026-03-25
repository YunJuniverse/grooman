import { createClient } from '@supabase/supabase-js'

// 서버 전용 — RLS 우회. 절대 클라이언트에서 사용하지 말 것
// DB 타입을 명시하지 않고 동적 타입으로 사용 (크롤링 파이프라인 전용)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

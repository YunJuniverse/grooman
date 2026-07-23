'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/require-admin'
import { revalidatePath } from 'next/cache'
import {
  isReportReason,
  computeSuspendedUntil,
  SANCTION_STEPS,
  type SanctionStep,
} from '@/lib/moderation/reports'

// ── 사용자: 글/댓글 신고 (운영기획서 §4.1) ──
export async function createReport(
  targetType: 'post' | 'comment',
  targetId: string,
  reason: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }
  if (!isReportReason(reason)) return { error: '유효하지 않은 신고 사유입니다.' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
  })

  if (error) {
    if (error.code === '23505') return { error: '이미 신고한 콘텐츠입니다.' }
    return { error: error.message }
  }
  return { success: true }
}

// ── 관리자: 신고 처리 상태 전환 (§4.1 조치) ──
export async function resolveReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
  adminNote?: string
) {
  const supabase = createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return { error: '권한이 없습니다.' }

  const { error } = await supabase.from('reports').update({
    status,
    resolved_by: admin.id,
    resolved_at: new Date().toISOString(),
    admin_note: adminNote ?? null,
  }).eq('id', reportId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

// ── 관리자: 계정 작성 정지 (§5 제재 집행) ──
export async function suspendUser(userId: string, step: SanctionStep) {
  const supabase = createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return { error: '권한이 없습니다.' }
  if (!(step in SANCTION_STEPS)) return { error: '유효하지 않은 제재 단계입니다.' }

  const suspendedUntil = computeSuspendedUntil(step, new Date()).toISOString()
  const { error } = await supabase
    .from('profiles').update({ suspended_until: suspendedUntil }).eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true, suspended_until: suspendedUntil }
}

// ── 관리자: 정지 해제 (§5 복구) ──
export async function unsuspendUser(userId: string) {
  const supabase = createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return { error: '권한이 없습니다.' }

  const { error } = await supabase
    .from('profiles').update({ suspended_until: null }).eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

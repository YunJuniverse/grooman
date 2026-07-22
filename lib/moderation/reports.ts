// 신고·제재 순수 로직 (DB 무관 — 단위 테스트 대상).
// 정본 기준: 12_운영기획서 §4.1(신고 사유 5종)·§5(제재 단계).

// ── 신고 사유 (§4.1) — 순서 고정(운영 콘솔·통계에서 참조) ──
export const REPORT_REASONS = {
  spam_ad: '스팸·광고',
  abuse: '욕설·비하',
  medical_law: '의료법 위반 소지',
  copyright: '저작권 침해',
  other: '기타',
} as const

export type ReportReason = keyof typeof REPORT_REASONS

export function isReportReason(value: string): value is ReportReason {
  return Object.prototype.hasOwnProperty.call(REPORT_REASONS, value)
}

// ── 제재 단계 (§5) — 계정 작성 정지 ──
export const SANCTION_STEPS = {
  suspend7: { label: '7일 작성 정지', days: 7 },
  suspend30: { label: '30일 작성 정지', days: 30 },
  permanent: { label: '영구 정지', days: null },
} as const

export type SanctionStep = keyof typeof SANCTION_STEPS

const PERMANENT_YEARS = 200 // 사실상 무기한 — 해제는 관리자 명시 액션으로만

// 정지 만료 시각 계산. 파라미터 now로 테스트 가능(비결정성 배제).
export function computeSuspendedUntil(step: SanctionStep, now: Date): Date {
  const until = new Date(now.getTime())
  if (step === 'permanent') {
    until.setUTCFullYear(until.getUTCFullYear() + PERMANENT_YEARS)
    return until
  }
  until.setUTCDate(until.getUTCDate() + SANCTION_STEPS[step].days)
  return until
}

// 현재 정지 중인가. 기한이 지났으면 자동 해제(false).
export function isSuspended(suspendedUntil: string | null, now: Date): boolean {
  if (!suspendedUntil) return false
  return new Date(suspendedUntil).getTime() > now.getTime()
}

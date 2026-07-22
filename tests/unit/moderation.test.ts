import { describe, it, expect } from 'vitest'
import {
  REPORT_REASONS,
  isReportReason,
  SANCTION_STEPS,
  computeSuspendedUntil,
  isSuspended,
} from '@/lib/moderation/reports'

describe('신고 사유 (운영기획서 §4.1 — 5종)', () => {
  it('사유는 정확히 5종이다', () => {
    expect(Object.keys(REPORT_REASONS)).toHaveLength(5)
    expect(Object.keys(REPORT_REASONS)).toEqual([
      'spam_ad', 'abuse', 'medical_law', 'copyright', 'other',
    ])
  })

  it('유효한 사유를 판별한다', () => {
    expect(isReportReason('spam_ad')).toBe(true)
    expect(isReportReason('medical_law')).toBe(true)
    expect(isReportReason('porn')).toBe(false)
    expect(isReportReason('')).toBe(false)
  })

  it('모든 사유에 한국어 라벨이 있다', () => {
    Object.values(REPORT_REASONS).forEach(label => {
      expect(label.length).toBeGreaterThan(1)
    })
  })
})

describe('제재 단계 (운영기획서 §5 — 조건형)', () => {
  const now = new Date('2026-07-22T00:00:00Z')

  it('제재 단계는 7일·30일·영구 3종이다', () => {
    expect(Object.keys(SANCTION_STEPS)).toEqual(['suspend7', 'suspend30', 'permanent'])
  })

  it('7일 정지 기한을 계산한다', () => {
    const until = computeSuspendedUntil('suspend7', now)
    expect(until.toISOString()).toBe('2026-07-29T00:00:00.000Z')
  })

  it('30일 정지 기한을 계산한다', () => {
    const until = computeSuspendedUntil('suspend30', now)
    expect(until.toISOString()).toBe('2026-08-21T00:00:00.000Z')
  })

  it('영구 정지는 사실상 무기한(100년+)이다', () => {
    const until = computeSuspendedUntil('permanent', now)
    expect(until.getFullYear()).toBeGreaterThanOrEqual(2126)
  })
})

describe('정지 상태 판별', () => {
  const now = new Date('2026-07-22T00:00:00Z')

  it('기한이 미래면 정지 중', () => {
    expect(isSuspended('2026-07-29T00:00:00Z', now)).toBe(true)
  })

  it('기한이 지났으면 정지 아님 (자동 해제)', () => {
    expect(isSuspended('2026-07-21T00:00:00Z', now)).toBe(false)
  })

  it('기한이 null이면 정지 아님', () => {
    expect(isSuspended(null, now)).toBe(false)
  })
})

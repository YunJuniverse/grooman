import { describe, it, expect } from 'vitest'
import {
  NO_CROSS_CATEGORY_REDISPLAY,
  canRedisplayAcrossCategories,
  REDISPLAY_EXCLUDED_FILTER,
  HOT_MIN_LIKES,
} from '@/lib/community/policy'

describe('카테고리 밖 재노출 정책 (의료법 §56① — 재게시=광고 전환 회피)', () => {
  it('clinic은 재노출 금지 목록에 있다', () => {
    expect(NO_CROSS_CATEGORY_REDISPLAY).toContain('clinic')
  })

  it('clinic은 카테고리 밖 표면에 재노출할 수 없다', () => {
    expect(canRedisplayAcrossCategories('clinic')).toBe(false)
  })

  it('의료와 무관한 카테고리는 재노출할 수 있다', () => {
    for (const category of ['hair', 'skin', 'shaving', 'fragrance', 'deals'] as const) {
      expect(canRedisplayAcrossCategories(category)).toBe(true)
    }
  })

  it('PostgREST not.in 필터 리터럴 형식이 맞다', () => {
    // `.not('category', 'in', '(clinic)')` 형태로 쓰인다 — 괄호가 빠지면 필터가 조용히 실패한다.
    expect(REDISPLAY_EXCLUDED_FILTER).toMatch(/^\(.+\)$/)
    expect(REDISPLAY_EXCLUDED_FILTER).toBe('(clinic)')
  })
})

describe('HOT 승격 임계값 (추천 임계값 + 시간 윈도우)', () => {
  it('최소 추천 수가 1보다 크다', () => {
    // 1이면 사실상 임계값이 없는 것과 같다 — hot_rank의 시간항이 지배해 "HOT = 최신"이 된다.
    expect(HOT_MIN_LIKES).toBeGreaterThan(1)
  })

  it('공개 초기에 HOT이 비지 않을 만큼은 낮다', () => {
    expect(HOT_MIN_LIKES).toBeLessThanOrEqual(10)
  })
})

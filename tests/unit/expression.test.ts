import { describe, it, expect } from 'vitest'
import { checkExpression, hasBlockedClaim } from '@/lib/community/expression'

describe('의약품 오인 표현 (화장품법 — hair 카테고리)', () => {
  it('발모·양모·육모를 잡는다', () => {
    for (const word of ['발모', '양모', '육모']) {
      const found = checkExpression(`이거 쓰고 ${word} 됐어요`, 'hair')
      expect(found.length).toBeGreaterThan(0)
      expect(found[0].severity).toBe('blocked-claim')
    }
  })

  it('탈모 치료·완치를 잡는다', () => {
    expect(checkExpression('탈모 치료 됐습니다', 'hair')).toHaveLength(1)
    expect(checkExpression('탈모완치 후기', 'hair')).toHaveLength(1)
  })

  it('탈모 예방·방지를 잡는다', () => {
    expect(checkExpression('탈모 예방에 좋아요', 'hair').length).toBeGreaterThan(0)
    expect(checkExpression('탈모방지 샴푸', 'hair').length).toBeGreaterThan(0)
  })

  it('효과 단정·부작용 없음을 잡는다', () => {
    expect(checkExpression('이거 특효입니다', 'hair')).toHaveLength(1)
    expect(checkExpression('부작용 전혀 없어요', 'hair')).toHaveLength(1)
    expect(checkExpression('100% 효과 봤어요', 'hair')).toHaveLength(1)
  })
})

describe('과차단 회피 — 합법 표현은 통과시킨다', () => {
  it('"탈모 증상 완화"는 기능성화장품 허용 표현이라 잡지 않는다', () => {
    expect(checkExpression('탈모 증상 완화에 도움이 됐어요', 'hair')).toHaveLength(0)
  })

  it('탈모를 단순 언급하는 일상 문장은 잡지 않는다', () => {
    expect(checkExpression('요즘 탈모 때문에 고민이 많네요', 'hair')).toHaveLength(0)
    expect(checkExpression('탈모 샴푸 추천 좀', 'hair')).toHaveLength(0)
  })

  it('제품 사용 후기 일반 표현은 잡지 않는다', () => {
    expect(checkExpression('두 달 썼는데 머리결이 부드러워졌어요', 'hair')).toHaveLength(0)
  })
})

describe('카테고리 인지형 — 카테고리별로 규칙이 다르다', () => {
  it('탈모와 무관한 카테고리는 검사하지 않는다', () => {
    for (const category of ['skin', 'shaving', 'fragrance'] as const) {
      expect(checkExpression('발모 효과 특효', category)).toHaveLength(0)
    }
  })

  it('식품 관련 표현은 hair에서만 잡는다', () => {
    expect(checkExpression('탈모에 좋은 영양제', 'hair').length).toBeGreaterThan(0)
    expect(checkExpression('탈모에 좋은 영양제', 'skin')).toHaveLength(0)
  })

  it('clinic은 의료 유인 표현을 잡는다', () => {
    expect(checkExpression('전후 사진 첨부합니다', 'clinic').length).toBeGreaterThan(0)
    expect(checkExpression('지금 할인 이벤트 중이래요', 'clinic').length).toBeGreaterThan(0)
  })

  it('clinic의 유인 표현은 caution, 효능 단정은 blocked-claim으로 구분한다', () => {
    const 유인 = checkExpression('무료 상담 해준대요', 'clinic')
    expect(유인[0].severity).toBe('caution')

    const 효능 = checkExpression('발모 됐어요', 'clinic')
    expect(효능[0].severity).toBe('blocked-claim')
  })

  it('deals는 효능 단정만 본다 (의료 유인 규칙 미적용)', () => {
    expect(checkExpression('발모 특가', 'deals').length).toBeGreaterThan(0)
    expect(checkExpression('할인 이벤트 진행', 'deals')).toHaveLength(0)
  })
})

describe('동작 세부', () => {
  it('같은 표현이 여러 번 나와도 한 번만 보고한다', () => {
    expect(checkExpression('발모 발모 발모', 'hair')).toHaveLength(1)
  })

  it('전역 정규식 lastIndex 오염이 없다 — 연속 호출이 같은 결과를 낸다', () => {
    const first = checkExpression('발모 효과', 'hair')
    const second = checkExpression('발모 효과', 'hair')
    expect(second).toEqual(first)
    expect(second.length).toBeGreaterThan(0)
  })

  it('빈 문자열은 아무것도 잡지 않는다', () => {
    expect(checkExpression('', 'hair')).toHaveLength(0)
  })

  it('hasBlockedClaim은 caution만 있을 때 false다', () => {
    const cautionOnly = checkExpression('무료 상담 문의', 'clinic')
    expect(cautionOnly.every(f => f.severity === 'caution')).toBe(true)
    expect(hasBlockedClaim(cautionOnly)).toBe(false)

    expect(hasBlockedClaim(checkExpression('발모', 'hair'))).toBe(true)
  })
})

import type { CategoryEnum } from '@/types/supabase'

// 표시광고 표현 경계 — 화장품법·건강기능식품법상 "의약품 오인" 표현 검사.
// 의료법(§56 광고 주체·§27 유인)과는 **별개 축**이다. 그쪽은 lib/community/policy.ts.
//
// 근거: 식약처 온라인 집중점검에서 탈모 관련 622건 적발·접속차단(2024-02) + 376건(2025-12),
// 단속 채널 유형에 **커뮤니티 포함**. 그루맨 `hair` 카테고리가 탈모를 다루므로 해당된다.
// 조사 원본: 40_dev/snapshots/talmo-com-cross-project-research-2026-07-24.md §2.3~2.4
//
// **설계 원칙 — 차단이 아니라 경고**:
// 블랭킷 키워드 차단은 합법 표현까지 과차단한다("탈모 증상 완화"는 기능성화장품에 허용된
// 표현인데 '탈모'로 막으면 정상 발화가 죽는다). 게다가 여기 대상은 판매자의 상품 등록이
// 아니라 **이용자의 커뮤니티 발화**다. 그래서 저장을 막지 않고 작성자에게 경고만 보여준다.
// 실제 위반은 신고(GRM-012)·운영자 조치로 사후 처리한다.

export type ExpressionSeverity = 'blocked-claim' | 'caution'

export interface ExpressionFinding {
  /** 실제로 매칭된 문자열 */
  matched: string
  severity: ExpressionSeverity
  /** 작성자에게 보여줄 이유 */
  reason: string
}

interface Rule {
  pattern: RegExp
  severity: ExpressionSeverity
  reason: string
}

// 의약품에만 허용되는 효능 표현. 화장품·건기식 문맥에서 쓰면 의약품 오인.
const DRUG_EFFICACY_RULES: Rule[] = [
  {
    pattern: /발모|양모|육모/g,
    severity: 'blocked-claim',
    reason: '발모·양모·육모는 의약품에만 쓸 수 있는 표현입니다. 기능성화장품은 "탈모 증상 완화"까지만 표현할 수 있습니다.',
  },
  {
    pattern: /탈모\s*(치료|완치)|모발\s*재생/g,
    severity: 'blocked-claim',
    reason: '치료·완치·재생은 의약품 효능 표현입니다. 의약품이 아닌 제품에 쓰면 의약품 오인 광고가 될 수 있습니다.',
  },
  {
    pattern: /탈모\s*(예방|방지)/g,
    severity: 'blocked-claim',
    reason: '탈모 예방·방지는 허용되지 않는 표현입니다. 기능성화장품은 "탈모 증상 완화"로 씁니다.',
  },
  {
    pattern: /특효|즉효|100%\s*효과|부작용\s*(전혀\s*)?없/g,
    severity: 'blocked-claim',
    reason: '효과를 단정하거나 부작용이 없다고 표현하면 과대광고에 해당할 수 있습니다.',
  },
]

// 건강기능식품 문맥에서만 문제되는 표현(식품은 탈모 관련 기능성이 인정된 바 없음).
const SUPPLEMENT_RULES: Rule[] = [
  {
    pattern: /탈모(에)?\s*좋은|탈모약|먹는\s*탈모/g,
    severity: 'blocked-claim',
    reason: '탈모에 대한 기능성이 인정된 식품·건강기능식품은 국내에 없습니다. 식품에 탈모 효능을 붙이면 위반 소지가 있습니다.',
  },
]

// 의료 시술 문맥 — 의료법 축과 겹치는 지점의 주의 환기.
const MEDICAL_RULES: Rule[] = [
  {
    pattern: /(전후|비포\s*애프터|before\s*&?\s*after)\s*(사진|비교)?/gi,
    severity: 'caution',
    reason: '치료 전후 비교는 효과를 오인하게 할 우려가 있어 제한됩니다(약관 제7조).',
  },
  {
    pattern: /(할인|이벤트|최저가|무료\s*상담)\s*(중|진행|문의)?/g,
    severity: 'caution',
    reason: '가격·이벤트 정보는 진료 유인으로 해석될 수 있습니다(의료법 §27·약관 제7조).',
  },
]

/** 카테고리별로 적용할 규칙 집합. 카테고리 인지형 — 블랭킷 차단을 피하는 핵심. */
function rulesFor(category: CategoryEnum): Rule[] {
  switch (category) {
    // 탈모 제품 이야기가 오가는 곳 — 화장품·건기식 축을 모두 본다.
    case 'hair':
      return [...DRUG_EFFICACY_RULES, ...SUPPLEMENT_RULES]
    // 의료 시술 — 의료법 축 주의 환기가 주. 효능 단정도 함께 본다.
    case 'clinic':
      return [...MEDICAL_RULES, ...DRUG_EFFICACY_RULES]
    // 제품 홍보성 글이 섞이는 곳 — 효능 단정만 본다.
    case 'deals':
      return DRUG_EFFICACY_RULES
    // 탈모와 무관한 카테고리는 검사하지 않는다(과차단 회피).
    default:
      return []
  }
}

/**
 * 글 내용에서 표현 경계 위반 후보를 찾는다.
 * **저장을 막지 않는다** — 호출부는 작성자에게 경고를 보여주는 용도로만 쓸 것.
 */
export function checkExpression(text: string, category: CategoryEnum): ExpressionFinding[] {
  const findings: ExpressionFinding[] = []
  const seen = new Set<string>()

  for (const rule of rulesFor(category)) {
    // 전역 정규식은 lastIndex를 공유하므로 매 호출마다 초기화한다.
    rule.pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = rule.pattern.exec(text)) !== null) {
      // 빈 문자열 매치는 lastIndex가 안 늘어 무한 루프가 된다 — 방어.
      if (match[0] === '') { rule.pattern.lastIndex++; continue }
      const matched = match[0].trim()
      const key = `${rule.reason}::${matched}`
      if (!seen.has(key)) {
        seen.add(key)
        findings.push({ matched, severity: rule.severity, reason: rule.reason })
      }
    }
  }

  return findings
}

/** 경고를 띄울 정도의 발견이 있는가. */
export function hasBlockedClaim(findings: ExpressionFinding[]): boolean {
  return findings.some(f => f.severity === 'blocked-claim')
}

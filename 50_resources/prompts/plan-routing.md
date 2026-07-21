# Plan Routing Prompt (기획서 라우팅 — Phase 1 1단계)

> 실행 지시문 — 어떤 기획서를 *이 프로젝트에* 쓸지 결정한다.
> 상위 원칙: `20_guides/00_AI_기획_프로젝트_운영_원칙.md` · 라우터: `20_guides/01_AI_기획_오케스트레이션_지침서.md`
> 산출물의 집: `30_planning/` (라이브 스켈레톤을 채운다) · 모드 세트: `50_resources/templates/_CATALOG.md`

## When To Use

- `00_briefs/current/` 에 브리프가 있고
- `30_planning/` 스켈레톤이 아직 안 채워졌을 때 (신규 프로젝트 또는 대규모 피벗)

## Instructions

1. `00_briefs/current/` 의 모든 파일을 *날짜순*으로 읽는다 (+ `00_briefs/meetings/` 회의록 있으면).
2. `20_guides/00_...운영_원칙.md` §4(문서 체계)·§9(단계별 사용)·§11.7~11.8(선택 로딩)을 읽는다.
3. `20_guides/01_...오케스트레이션_지침서.md`(요청→문서 라우팅)를 읽는다.
4. **모든 문서를 항상 만들지 않는다.** CLAUDE.md §1 `Mode`와 `_CATALOG.md` §1 모드 세트로 *필요한 기획서만* 고른다.
   - 핵심 5종(10 사업·11 서비스·12 운영·13 마케팅·14 브랜드) + 15 PM = 기본 후보.
   - AI 기능이 있으면 16 AI기능(기능별 AI-NNN) + 17 평가·가드레일 **추가**(Eval-First).
   - `lean` 모드면 축소(예: `plan.md` 단일 문서 또는 prd 중심).
5. 각 문서마다 브리프의 어느 부분이 근거인지 표기한다.
6. 의존성 기반 작성 순서를 제안한다 (권장: `30_planning/_README.md` — 10→14→11→12/13→15→(16+17)).
7. 라우팅 결정을 `HANDOFF.md` "Working on"에 기록하고 Phase 1 시작을 표시한다.

## Output Format (사람에게 제시)

```
## Phase 1 기획서 작성 계획 (모드: <mode>)

### 작성할 문서 (선택된 것만)
- [ ] 10 사업기획서    → 30_planning/10_사업기획서.md      (prompt: business-plan.md)
- [ ] 14 브랜드기획서  → 30_planning/14_브랜드기획서.md    (prompt: brand-plan.md)
- [ ] 11 서비스기획서  → 30_planning/11_서비스기획서.md    (prompt: service-plan.md)
- [ ] 12 운영 / 13 마케팅 → 30_planning/12_·13_.md          (ops-plan.md / marketing-plan.md)
- [ ] 15 PM기획서      → 30_planning/15_PM기획서.md        (pm-plan.md)
- [ ] (AI 있으면) 16 AI기능 → 30_planning/16_AI_기능/AI-NNN_*.md  (ai-feature.md)
- [ ] (AI 있으면) 17 평가·가드레일 → 30_planning/17_평가_가드레일.md (eval-guardrail.md)

### 제외한 문서 + 사유
[모드/규모상 불필요하다고 판단한 문서와 이유 — 침묵 생략 금지]

### 작성 순서 (의존성)
[권장 순서 + 이 프로젝트 특수성]

### briefs에서 확인된 주요 사실
[구체적 근거]

### Evidence Needed (브리프에 없어 확인 필요)
[목록]
```

사람 확인 후 각 문서별 프롬프트로 순서대로 작성.

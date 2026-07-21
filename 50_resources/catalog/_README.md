---
doc_id: catalog-readme
title: Problem-Solution Catalog — 디렉터리 명세
version: v0.2.0
status: active
last_updated: 2026-05-07
ai_relevance: schema
---

# Catalog (L2 활성 자산)

> 재발한 문제 1건당 1엔트리로 정제된 활성 자산 라이브러리.
> 위상·운영 원칙은 [10_foundation/WHITEPAPER.md](../../10_foundation/WHITEPAPER.md) §5 L2 참조.
> *부패 방지 핵심: 1회 해결은 Pending Lesson, 반복 검증은 active Catalog.*

---

## 1. 디렉터리 구조

```
50_resources/catalog/
├── _README.md            ← 본 문서 (스키마·운영)
├── _pending/             ← 1회 해결된 Pending Lesson과 L3 승급 후보
├── archived/             ← 6개월 hit 0회로 자동 아카이브된 엔트리
└── C-NNN_<slug>.md       ← 활성 엔트리 (예: C-014_supabase-ssr-auth.md)
```

활성 엔트리 ID는 프로젝트 전체에서 *연속*. `C-` + 3자리 제로패딩.
Pending Lesson ID는 `P-` + 3자리 제로패딩.

## 2. 엔트리 스키마

```yaml
---
id: C-014
title: "Supabase SSR auth — layout에서 createClient 호출 시 hydration mismatch"
domain: webapp-next                   # 도메인 식별자
status: active                        # active | tentative | archived
seen_in:                              # 목격 일자 — N≥2부터 active 승급
  - 2025-11-12
  - 2026-01-04
  - 2026-03-22
signature: "next.*supabase.*createClient.*layout"   # L3 검색 키 (regex 가능)
verified_with:                        # 어느 AI 모델에서 검증됐는가
  - claude-sonnet-4-6
deps_implicated:                      # 영향받는 의존성·버전
  - "@supabase/ssr@^0.5"
created: 2026-03-22
last_hit: 2026-03-22
---

## 증상 (Symptom)
(재현 가능한 에러 메시지·관찰 가능한 동작)

## 근본 원인 (Root Cause)
(왜 발생하는가 — 코드/아키텍처 수준)

## 솔루션 (Solution)
(구체적 수정안. 코드 스니펫 환영)

## 안티패턴 (Anti-Pattern)
(피해야 할 흔한 잘못된 시도)

## 관련 자료
- 백서 §X
- ADR-NNN
- 외부 링크 (있으면)
```

## 3. 승급·아카이브 규칙

### 원료 수집 (파이프라인 진입점) — `observe --friction`
- Catalog 재료는 **L1 관찰 로그의 마찰 필드**에서 나온다. 비자명한 문제·재발·막힘을 겪은 세션은 wrap 시 `observe` 에 `--friction "where|cost_minutes|resolution|repeat_of"` 를 남긴다(CLAUDE.md/AGENTS.md §2 ④ 규칙). 마찰 없는 세션은 생략(강제 아님 — 노이즈 방지).
- 흐름: `observe --friction`(원료) → `thinktank`(반복 ≥2회 후보 마킹) → `_pending/`(사람 작성) → 승급 머지 → active `C-NNN` → skeleton bake.
- **마찰을 안 남기면 루프가 굶는다** — thinktank가 집계할 게 없어 승급 후보가 안 나오고 catalog가 비어 있게 된다. `where:` 는 재발 판정의 키이므로 *같은 표현*으로 적으면 ≥2 집계가 잡힌다.

### Pending Lesson
- 1회 해결된 문제 중 재사용 가능성이 있으면 `_pending/P-NNN_<slug>.md`에 저장한다.
- Pending Lesson은 학습 데이터이자 승급 후보일 뿐, Skeleton에 bake-in 하지 않는다.
- Pending Lesson 추가는 Class A다.

### 승급 (Promotion)
- L3 thinktank(`methodology.py thinktank` — **수동 실행**, 회고 직전, v0=문자열 카운트 기반)가 L1 관찰 로그의 반복 마찰을 집계 → 동일 마찰 **N≥2회**를 승급 *후보*로 마킹. **자동 승급 아님** — 마킹까지만.
- 사람이 명시 승인하면 N=1에서도 active 승급 가능하나, PR/ADR에 이유를 남긴다.
- 후보는 `_pending/` 에 저장. **사람이 머지해야** 활성으로 이동.
- 자동 머지 절대 금지 (백서 §8-2).
- 승급은 Class B다. PR에는 rationale, impact scope, rollback plan이 필요하다.

### 검증 상태 전이
- `tentative`: 단일 AI 모델에서만 검증됨
- `active`: 둘 이상 모델에서 검증됨 (`verified_with` 길이 ≥ 2)

### 아카이브 (Auto-cleaning)
- 활성 엔트리가 **6개월 동안 hit 0회** → `archived/` 로 자동 이동
- 아카이브된 엔트리는 검색 대상에서 제외되지만 *삭제하지 않는다*.

## 4. Skeleton과의 결합

스켈레톤(`50_resources/skeletons/<도메인>/bakes-in.json`)이 Catalog 엔트리 ID 목록을 참조.
Catalog 변경 시 의존하는 스켈레톤은 자동 재빌드 대상 (백서 §6 자가발전 루프).

## 5. 첫 엔트리 추가 절차

1. 새 ID 할당 (`02_식별자_및_버전_관리_규칙.md` 참조)
2. 본 README §2 스키마로 `C-NNN_<slug>.md` 작성
3. 최소 2회 목격이 있는지 확인 — 1회뿐이면 `_pending/` 에 두고 다음 목격 시 승급
4. PR 본문에 *목격된 L1 관찰 로그 ID* 를 링크
5. 사람 머지 후 활성

## 6. CLI

```bash
python3 60_tools/methodology.py catalog init
python3 60_tools/methodology.py catalog seed-pending
python3 60_tools/methodology.py catalog status
```

## 7. 안티패턴 (이 디렉터리 자체에 대해)

- ❌ "유용해 보이는" 패턴을 1회 목격으로 추가 — 노이즈
- ❌ 손으로 직접 추가 (L3 마이닝 없이) — *가능하지만 권장하지 않음*. 추가하면 `seen_in`을 정직하게 기록.
- ❌ 아카이브 엔트리 삭제 — 학습 데이터 손실
- ❌ Catalog 엔트리에 *도구·AI 종속* 솔루션 (예: "Claude에게 X 프롬프트") — 솔루션은 *코드/아키텍처* 레벨이어야 함

---
doc_id: prompts-readme
title: 50_resources/prompts/ — AI 실행 프롬프트 인덱스
version: v1.0.0
status: active
last_updated: 2026-07-09
ai_relevance: rule
---

# 50_resources/prompts/ — AI 실행 프롬프트

> **복붙 실행 지시문.** 지침(왜/표준)·템플릿(빈 양식)과 구별되는 *실행층*이다.
> 방법론 3층: **지침(`20_guides/`, 표준·목차)** → **템플릿(`50_resources/templates/`, 빈 양식)** → **프롬프트(여기, "이걸 붙여넣으면 AI가 그 문서를 생성")**.

---

## 1. 핵심 규칙 (METH-081)

- **목차(구조)는 프롬프트에 복제하지 않는다.** 구조의 SSOT는 짝 지침(`20_guides/NN`). 프롬프트는 *무엇을 읽고 · 어디에 쓰고 · 어떤 게이트를 통과하는지*만 담는다.
- **입력**: 인간 브리프는 `00_briefs/current/`(+`00_briefs/meetings/`). ~~`briefs/`~~ 아님.
- **기획서 산출물의 집**: `30_planning/NN_*.md` (라이브 스켈레톤을 채움, in-place + git 이력). ~~`40_dev/snapshots/plans/xxx/vN`~~ 아님.
- **스냅샷**: 시점 캡처(리뷰·인계·역-문서화)만 `40_dev/snapshots/<type>-YYYY-MM-DD.md`(비-라이브, 플랫 네이밍).
- **선택 로딩**: 모든 기획서를 항상 만들지 않는다. 모드(`CLAUDE.md` §1)·`_CATALOG.md`로 필요한 것만.

---

## 2. 기획서 생성 프롬프트 (→ 30_planning/, 라이브)

| 프롬프트 | 짝 지침 | 산출(라이브) | 모드 |
|---|---|---|---|
| `plan-routing.md` | 00·01 | (라우팅 → HANDOFF) | 전체 Phase 1 진입 |
| `business-plan.md` | 10 | `30_planning/10_사업기획서.md` | planning·fullstack·agency |
| `service-plan.md` | 11 | `30_planning/11_서비스기획서.md` | planning·fullstack·lean |
| `ops-plan.md` | 12 | `30_planning/12_운영기획서.md` | planning·fullstack·ops·agency |
| `marketing-plan.md` | 13 | `30_planning/13_마케팅기획서.md` | planning·fullstack·agency |
| `brand-plan.md` | 14 | `30_planning/14_브랜드기획서.md` | planning·fullstack·agency |
| `pm-plan.md` | 15 | `30_planning/15_PM기획서.md` | planning·fullstack·agency |
| `ai-feature.md` | 16 | `30_planning/16_AI_기능/AI-NNN_*.md` | AI 있으면 (16↔17 동시) |
| `eval-guardrail.md` | 17 | `30_planning/17_평가_가드레일.md` | AI 있으면 (Eval-First) |
| `re-plan.md` | — | 영향 문서 in-place 갱신 | 방향 전환 시 |
| `plan.md` | — | `40_dev/snapshots/plan-*.md` | lean(단일 경량 기획) |

권장 작성 순서: 10 → 14 → 11 → 12/13 → 15 → (16+17). 상세 `30_planning/_README.md`.

## 3. 개발 전환·스냅샷 프롬프트

| 프롬프트 | 성격 | 산출 | 짝 자원 |
|---|---|---|---|
| `dev-spec.md` | 기획 → 빌드 전환 | 개발명세 5종(또는 스냅샷) | 지침 21 · 템플릿 data-model/user-flow/wireframe-spec/functional-spec/api-contract |
| `architecture.md` | 코드 기반 역-문서화 | `40_dev/snapshots/architecture-*.md` | (전방 설계는 템플릿 architecture) |
| `data-model.md` | 코드 기반 역-문서화 | `40_dev/snapshots/data-model-*.md` | (전방 설계는 템플릿 data-model) |
| `api-spec.md` | 코드 기반 역-문서화 | `40_dev/snapshots/api-spec-*.md` | (전방 설계는 템플릿 api-contract) |
| `service-spec.md` | 범위 한정 시점 캡처 | `40_dev/snapshots/service-spec-*.md` | (원본은 30_planning/11) |

> **역-문서화 vs 전방 설계**: `architecture`/`data-model`/`api-spec` 프롬프트는 *이미 있는 코드*의 현황을 뽑는다. *새로* 설계할 땐 같은 이름의 **템플릿**(`50_resources/templates/`)을 쓴다.

## 4. 새 프롬프트 추가 시

- 짝 지침(구조 SSOT)을 먼저 확보하고, 프롬프트엔 목차를 복제하지 말 것.
- 이 `_README.md`의 표(짝 지침·산출·모드)와 `_CATALOG.md`(모드 세트)를 함께 갱신.

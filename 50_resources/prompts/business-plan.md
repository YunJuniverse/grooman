# Business Plan Prompt (사업기획서 — 30_planning/10)

> 실행 지시문 — 10번 사업기획서를 생성/갱신한다. **목차는 복제하지 않는다** — 짝 지침이 SSOT.
> 짝 지침(작성 표준·목차): `20_guides/10_사업기획서_작성_지침.md`
> 산출 위치(라이브): `30_planning/10_사업기획서.md` (스켈레톤을 채운다)
> 모드: planning · planning-handoff · fullstack · agency (`_CATALOG.md`)

## When To Use

- Phase 1 시작 — 시장·비즈니스 모델 가설을 처음 정리할 때 (보통 가장 먼저)
- 또는 방향 전환으로 BM·타겟이 바뀔 때 (`re-plan.md` 경유)

## Instructions

- `00_briefs/current/` 전부 + `00_briefs/meetings/`(있으면)를 날짜순으로 읽는다.
- `20_guides/00_AI_기획_프로젝트_운영_원칙.md`(공통 원칙) + `20_guides/10_사업기획서_작성_지침.md`(작성 표준·목차)를 읽는다 — **목차는 지침을 따른다**.
- **코드에서 시장 사실·경쟁 주장·사업성을 추론하지 않는다.** 근거가 브리프에 없으면 지어내지 말고 `Evidence Needed` 섹션에 남긴다.
- `30_planning/10_사업기획서.md` 스켈레톤을 채우고 frontmatter `status: draft → active`.
- 갱신은 in-place + git 이력. (승인 시점 등 캡처가 필요하면 `40_dev/snapshots/business-plan-YYYY-MM-DD.md`.)
- 완료 후 `HANDOFF.md`를 갱신한다.

## 산출 규칙

- 목차: 지침 `20_guides/10_...` 준수 (여기 복제하지 않음). 핵심은 **problem-first 척추**(문제→고객→가치→BM→근거) — 기능 나열이 아니라 문제에서 출발.
- 각 시장·경쟁·수익 주장에 근거 링크 또는 `가정` 라벨. 미검증은 `Evidence Needed`.
- 카테고리 창출·가격/과금 등 Class C 후보는 표시하고 ADR/승인 게이트로 넘긴다.

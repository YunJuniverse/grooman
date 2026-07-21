# Plan Prompt (경량 단일 기획 — lean 모드)

> 실행 지시문 — 6~8종 기획서 세트를 다 쓰기엔 과한, 작은/빠른 프로젝트용 *단일* 기획 문서.
> 정식 세트가 필요하면 `plan-routing.md`로 라우팅하라. lean 모드 상세: `_CATALOG.md` §1.
> 이 문서는 시점 스냅샷(비-라이브)이다 — 규모가 커지면 `30_planning/` 세트로 승격.

## When To Use

- `00_briefs/current/` 에 아이디어·러프 기획이 있고
- 프로젝트가 작아 6종 세트가 과할 때 (lean/1인+AI 빠른 반복)
- 개발 명세·구현 전에 가벼운 기획 패스가 필요할 때

## Instructions

- `00_briefs/current/` 를 먼저 모두 읽는다.
- `HANDOFF.md`·`CLAUDE.md`(모드 확인)를 읽는다. prd 템플릿을 쓸 거면 `50_resources/templates/prd.md` 참조.
- 브리프 근거 없는 시장·사용자·사업성 추론 금지 → 없으면 `Evidence Needed`.
- `40_dev/snapshots/plan-YYYY-MM-DD.md` 로 쓴다(날짜 스냅샷). 상단에 스냅샷 경고 헤더.
- 완료 후 `HANDOFF.md`에 "plan 스냅샷 검토 대기"를 기록.

## Output Structure

```
# Plan — [Project Name] — YYYY-MM-DD

> SNAPSHOT: YYYY-MM-DD 생성. 라이브 진실 원천 아님 — 이 날짜 이후엔 현행으로 취급 금지.

## Purpose            제품/서비스가 존재하는 이유
## Problem Statement  브리프에서 나온 구체적 문제
## Target Users       대상 + 브리프 근거
## Core Features       Must / Should / Could
## Business Model     수익/지속가능성 가설 (미검증은 가정 라벨)
## Competitive Landscape  알려진 대안 (공백은 Evidence Needed)
## Constraints        시간·예산·팀·기술 제약
## Assumptions        이 계획이 성립하려면 참이어야 하는 가정
## Evidence Needed    지어냈거나 빠졌고, 틀리면 계획이 바뀌는 사실
## Next Gate          사람이 검토·승인해야 개발 명세로 진행
```

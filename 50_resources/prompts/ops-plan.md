# Ops Plan Prompt (운영기획서 — 30_planning/12)

> 실행 지시문 — 12번 운영기획서를 생성/갱신한다. **목차는 복제하지 않는다** — 짝 지침이 SSOT.
> 짝 지침(작성 표준·목차): `20_guides/12_운영기획서_작성_지침.md`
> 산출 위치(라이브): `30_planning/12_운영기획서.md`
> 모드: planning · fullstack · ops · agency (`_CATALOG.md`)

## When To Use

- Phase 1 진행 중, 서비스기획서(11) 이후 운영 정책 차례
- 또는 운영 정책·SLA 변경 시 (`re-plan.md` 경유)

## Instructions

- `00_briefs/current/` 전부 + `00_briefs/meetings/`(있으면)를 읽는다.
- `20_guides/00_...운영_원칙.md`(공통) + `20_guides/12_운영기획서_작성_지침.md`(작성 표준·목차)를 읽는다 — **목차는 지침을 따른다**.
- 선행 라이브 문서 `30_planning/11_서비스기획서.md`(서비스 흐름)와 정합성 유지. AI 기능이 있으면 `30_planning/17_평가_가드레일.md`와 연계.
- 브리프 근거 없는 운영 수치 지어내기 금지 → `Evidence Needed`.
- `30_planning/12_운영기획서.md` 스켈레톤을 채우고 frontmatter `status: draft → active`.
- 완료 후 `HANDOFF.md` 갱신.

## 산출 규칙

- 목차: 지침 `20_guides/12_...` 준수. 심화 반영: **SLO/SLI·에러버짓**(가용성 목표), **인시던트 대응**(심각도·온콜·포스트모템), **AI 운영**(모델 회귀·비용·가드 위반 대응 — 17과 경계). 장애 *대응*은 12, 기능 *설계*는 16.

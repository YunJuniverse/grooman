# Service Plan Prompt (서비스기획서 — 30_planning/11)

> 실행 지시문 — 11번 서비스기획서를 생성/갱신한다. **목차는 복제하지 않는다** — 짝 지침이 SSOT.
> 짝 지침(작성 표준·목차): `20_guides/11_서비스기획서_작성_지침.md`
> 산출 위치(라이브): `30_planning/11_서비스기획서.md` (스켈레톤을 채운다)
> 모드: planning · planning-handoff · fullstack · lean (`_CATALOG.md`)

## When To Use

- Phase 1 진행 중, 사업기획서(10)·브랜드(14) 이후 서비스 정의 차례
- 또는 기능·시나리오 변경 시 (`re-plan.md` 경유)

## Instructions

- `00_briefs/current/` 전부 + `00_briefs/meetings/`(있으면)를 읽는다.
- `20_guides/00_...운영_원칙.md`(공통) + `20_guides/11_서비스기획서_작성_지침.md`(작성 표준·목차)를 읽는다 — **목차는 지침을 따른다**.
- 선행 라이브 문서 `30_planning/10_사업기획서.md`(BM·타겟)·`30_planning/14_브랜드기획서.md`(톤)와 정합성 유지.
- 브리프 근거 없는 사용자 니즈·기능 지어내기 금지 → `Evidence Needed`.
- `30_planning/11_서비스기획서.md` 스켈레톤을 채우고 frontmatter `status: draft → active`.
- 완료 후 `HANDOFF.md` 갱신.

## 산출 규칙

- 목차: 지침 `20_guides/11_...` 준수. **서비스기획서는 여러 산출물의 컨테이너/인덱스** — 요구사항·IA·유저스토리·유저플로우 등 세부는 각 템플릿(`50_resources/templates/`)으로 분리하고 11은 링크로 묶는다(중복 복제 금지, SSOT).
- 기능은 Must/Should/Could. 각 기능에 안정적 ID 부여(마스터플랜 18이 ID로 페이징).
- 제외 범위(Out of Scope) 명시로 범위 크리프 차단.

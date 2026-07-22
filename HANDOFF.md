# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: **M1 구현** — GRM-014·012 완료, GRM-001 정적 감사+최적화(숫자측정 Blocked). 남은: GRM-013(측정)
- Current mode: fullstack
- Next TODO: GRM-001 PR 리뷰 → GRM-013(GA4 계정=사람 선행) / **법률 검토 착수(크리티컬 패스)** / GRM-001 숫자측정(배포 후)
- Blockers: GRM-001 숫자 측정·GRM-013 = env·계정 필요(인간 액션 선행)

## Active Links

- Current PR: branch feat/grm-012-reports-sanctions (GRM-012)
- Current issue:
- Relevant ADRs: [ADR-0001](40_dev/adr/0001-rss-auto-crawl-ai-pipeline.md)·[ADR-0002](40_dev/adr/0002-bot-seeding-cold-start.md)·[ADR-0003](40_dev/adr/0003-rls-security-model.md)
- Relevant snapshots:

## Open Decisions

| ID | Decision | Needed By | Status |
|----|----------|-----------|--------|
| GRM-010 | 봇 = 출시 전 테스트 픽스처, 공개 배포 시 전량 삭제 · 프로덕션 표기 불필요 | 공개 배포 전 | **Resolved 2026-07-22** (ADR-0002) — 실행(teardown 수단·릴리스 게이트)은 GRM-010 TODO |

## Open Issues

| ID | Issue | Severity | Next Step |
|----|-------|----------|-----------|
| ~~BOT-1~~ | ~~봇 teardown 불가~~ → **Resolved 2026-07-22** (GRM-010): is_bot 마커·teardown 스크립트·릴리스 게이트 SOP 구현 | ~~High~~ | 공개 배포 시 SOP_public-release-gate 대로 실행 |
| ~~G1+G4~~ | ~~신고 UI + 계정 정지 수단~~ → **Resolved 2026-07-22** (GRM-012): 신고 5종 UI·어드민 처리 큐·`suspended_until`+INSERT RLS·정지/해제. 부수: profiles_update_admin으로 기존 toggleAdmin RLS 잠재버그도 해소 | ~~High~~ | 마이그 005 프로덕션 적용은 배포 시 |
| G5 | **측정 인프라 전무** — GA4류·Search Console 등록·소유권 메타 없음 → 마케팅 KPI 측정 불가 (마케팅기획서 §9) | High | GRM-013 (P1 필수, Class A) — 계정은 사람·코드는 AI |
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 루틴화 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-22: **next/image 전면 전환**(raw img 14→0) — GRM-001 후속 최적화, PR#13에 포함 · Class A
- 2026-07-22: **GRM-001 정적 Lighthouse 감사** — 5경로×4카테고리 코드감사+안전 최적화(viewport·img lazy). 숫자측정은 배포 env 필요로 Blocked · Class A
- 2026-07-22: **GRM-012 구현** — 신고(5종 UI·중복방지)·어드민 처리큐·계정정지(`005` 마이그·RLS)·테스트 10종. G1+G4 해소 · Class B · branch feat/grm-012-reports-sanctions
- 2026-07-22: GRM-014 머지(PR#11) — AI 가드 fail-closed·zod·temp0. CRAWL-2 해소 · Class A

# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: **M1 구현 착수** — GRM-014 완료(리뷰 대기). 남은 M1: GRM-013 → GRM-012 → GRM-001
- Current mode: fullstack
- Next TODO: GRM-014 PR 리뷰(Class A·테스트 11종) → GRM-013 측정 인프라 / **법률 검토 착수(크리티컬 패스 — 여전히 미착수)**
- Blockers: 없음

## Active Links

- Current PR: (미푸시) branch chore/apply-methodology
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
| G1+G4 | **신고 UI + 계정 정지 수단 미구현** — reports UI 없음(G1) + profiles 정지 컬럼·관리자 정지 액션 없음(G4, 제재 집행 불가) | High | **P1 필수 확정(2026-07-22)** → GRM-012 구현 (Class B) |
| G5 | **측정 인프라 전무** — GA4류·Search Console 등록·소유권 메타 없음 → 마케팅 KPI 측정 불가 (마케팅기획서 §9) | High | GRM-013 (P1 필수, Class A) — 계정은 사람·코드는 AI |
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 루틴화 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-22: **GRM-014 구현** — fail-closed·zod 검증(`crawl-analysis.ts`)·temp 0 + vitest 도입(테스트 11종). CRAWL-2 해소 · Class A · branch feat/grm-014-ai-guard
- 2026-07-22: MASTER_PLAN v1 + 정합화 머지(PR#10) — **GRM-011 완결·master-plan-approval 통과·M1 착수** · Class A
- 2026-07-22: 16 AI-001+17 평가 v1(**fail-open 적발**→GRM-014) 머지(PR#9) — 기획 시리즈 7/7 · Class A
- 2026-07-22: 15 PM기획서 v1(방법론 인스턴스화·프리모템→**법률 검토 크리티컬 패스**) 머지(PR#8) · Class A
- 2026-07-22: 14 브랜드기획서 v1 초안(Dunford·가치실체·다면메시지·정량화톤·DBA·SoS) 머지(PR#4) · Class A

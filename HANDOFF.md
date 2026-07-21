# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: GRM-011 — 10·14·11 머지, 12 운영기획서 v1 초안 완료(리뷰 대기). 다음: 13 마케팅
- Current mode: fullstack
- Next TODO: 운영기획서 PR 리뷰(제안값 승인: 자동수집 상한 50%·비용 캡·제재 단계) → 13 마케팅 / GRM-012 구현(P1 필수)
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
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 루틴화 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-22: 12 운영기획서 v1(1인 슬림·신고 프로세스·제재 단계·**G4 발견**) + G1=P1 확정 반영 + GRM-012 등록 · Class A · branch docs/plan-12-ops
- 2026-07-22: 11 서비스기획서 v1(부모=인덱스·역문서화·신고UI 갭 발견) 머지(PR#5) + 14 tagline 확정 · Class A
- 2026-07-22: 14 브랜드기획서 v1 초안(Dunford·가치실체·다면메시지·정량화톤·DBA·SoS) 머지(PR#4) · Class A
- 2026-07-22: 10 사업기획서 v1 머지(PR#3) + GRM-010 잔여 복구 머지(PR#2) — GRM-011 순서 1 완료 · Class A
- 2026-07-22: GRM-010 구현 — profiles.is_bot(004)+백필·시더 is_bot 세팅·teardown 스크립트·릴리스 게이트 SOP. BOT-1 해소 · Class B

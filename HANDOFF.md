# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: GRM-010 구현 완료(is_bot 마이그레이션·teardown 스크립트·릴리스 게이트 SOP). 남은 큰 항목은 GRM-001
- Current mode: fullstack
- Next TODO: GRM-001 Lighthouse 감사 (실제 앱 실행 필요)
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
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 루틴화 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-22: GRM-010 구현 — profiles.is_bot(004)+백필·시더 is_bot 세팅·teardown 스크립트·릴리스 게이트 SOP. BOT-1 해소 · Class B
- 2026-07-22: GRM-010 결정 — 봇=출시전 테스트 픽스처·배포 전 전량 삭제(표기 불필요). teardown 불가 리스크(BOT-1) 표면화, ADR-0002 갱신 · Class C(결정)
- 2026-07-21: 핵심 결정 retro-ADR 3건(0001 크롤·0002 봇시딩·0003 RLS) + TODO(GRM-001 Ready·GRM-010 봇표기 Backlog) 정리 · Class A
- 2026-07-21: 방법론 v4.0 적용(bootstrap) — 기존 Next.js14+Supabase 앱에 retrofit, 구 CLAUDE.md는 00_briefs/reference로 보존 · Class A · branch chore/apply-methodology

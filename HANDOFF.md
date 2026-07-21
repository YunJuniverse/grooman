# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: 부트스트랩 + 핵심 결정 retro-ADR 3건 문서화 완료. GRM-001(Lighthouse) Ready 대기
- Current mode: fullstack
- Next TODO: GRM-001 Lighthouse 감사 실행 / GRM-010(봇 표기 정책) 사람 결정
- Blockers: 없음

## Active Links

- Current PR: (미푸시) branch chore/apply-methodology
- Current issue:
- Relevant ADRs: [ADR-0001](40_dev/adr/0001-rss-auto-crawl-ai-pipeline.md)·[ADR-0002](40_dev/adr/0002-bot-seeding-cold-start.md)·[ADR-0003](40_dev/adr/0003-rls-security-model.md)
- Relevant snapshots:

## Open Decisions

| ID | Decision | Needed By | Status |
|----|----------|-----------|--------|
| GRM-010 | 봇 시딩 유지 여부 + AI생성/자동수집 콘텐츠 공개 표기 정책 (Class C) | 공개 운영 전 | Open — 사람 결정 대기 (ADR-0002) |

## Open Issues

| ID | Issue | Severity | Next Step |
|----|-------|----------|-----------|
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 루틴화 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 표기 정책(GRM-010)과 함께 검수 게이트 도입 검토 |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-21: 핵심 결정 retro-ADR 3건(0001 크롤·0002 봇시딩·0003 RLS) + TODO(GRM-001 Ready·GRM-010 봇표기 Backlog) 정리 · Class A
- 2026-07-21: 방법론 v4.0 적용(bootstrap) — 기존 Next.js14+Supabase 앱에 retrofit, 구 CLAUDE.md는 00_briefs/reference로 보존 · Class A · branch chore/apply-methodology

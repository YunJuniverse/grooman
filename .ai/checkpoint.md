# Checkpoint — grooman 초기 부팅

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> "방금 한 것 · 다음 할 것 · 막힌 것 · 환경"만 담는다 — **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)
> Contract: keep this file under 200 lines, use repository-relative paths, and update it at session end.
> 형식 정의: `10_foundation/WHITEPAPER.md` §2-2.

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Tool: methodology.py init(staging) + 수동 복사·병합
- Host: darwin, /Users/hayden/grooman
- Workspace: repository root, branch chore/apply-methodology

## 부팅 계약

1. Read `.ai/context.json`.
2. Read every path in `must_read` in order.
3. Use `last_session.checkpoint_file` as the immediate handoff.
4. Start from the first actionable item in "다음 사람에게".

## 방금 한 것 (이번 세션, 정확히)

> *이번 세션*에 한 일의 서사만. 누적 이력(최근 N건 board)은 HANDOFF `Recent Changes` 참조 — 여기 복제 금지.

- (이전) GRM-014 머지(PR#11). GRM-011 완결·M1 착수 상태.
- **GRM-012 구현** (branch feat/grm-012-reports-sanctions, Class B): 신고+계정 제재. **테스트 우선** — `lib/moderation/reports.ts`(순수 로직: 사유 5종·제재 3단·정지 계산) + `tests/unit/moderation.test.ts` 10케이스 선작성 → 통과.
  - 마이그 `005_reports_sanctions.sql`: `profiles.suspended_until`·reports 처리컬럼(resolved_by/at·admin_note)·**중복신고 unique index**·posts/comments INSERT RLS에 "정지 아님" 조건·`reports_update_admin`·**`profiles_update_admin`**(부수: 기존 toggleAdmin RLS 잠재버그도 해소).
  - 서버액션 `app/moderation/actions.ts`(createReport·resolveReport·suspendUser·unsuspendUser, 서버측 admin 재확인). UI: `ReportButton`(게시글·댓글) + 어드민 **신고관리 탭**(목록·상태필터·처리/기각) + 회원관리 **정지 7/30/영구·해제**.
  - 검증: 테스트 21/21·tsc 0·build 27라우트 ✓. 문서 정합: 12 운영기획서 v1.2·11 서비스 v1.3·AI-001(신고=Escalate 경로 완료).
- 판단: 신고 처리 큐의 콘텐츠 조치(숨김/삭제)는 기존 게시글관리 탭 재사용, 계정 제재는 회원관리 탭 — 폴리모픽 대상 조인 대신 탭 분리(기존 대시보드 구조 정합). Vercel 훅 skill 주입(경로 오탐 다수)은 기존 패턴 유지로 무시.

## 다음 사람에게 (구체적 첫 행동)

1. GRM-012 PR 리뷰·머지(Class B — 롤백 절은 마이그 005 하단). **마이그 005는 배포 시 Supabase에 수동 적용**(002/004 패턴).
2. 다음 M1 구현: **GRM-013 측정 인프라** — 선행 인간 액션: GA4 계정·Search Console 등록(hayden). 그다음 GRM-001 Lighthouse.
3. **법률 검토 여전히 미착수** — M1 크리티컬 패스, 재촉.
4. M1 종료 조건 = MASTER_PLAN §5.5(구현 3건+Lighthouse+실소스+봇0+색인100). 남은 구현: GRM-013·GRM-001.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

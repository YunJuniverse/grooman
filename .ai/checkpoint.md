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

- (이전) 부트스트랩(66fb321)+retro-ADR(cb2e0e4)+GRM-010 결정(22a38e3) → PR grooman#1.
- **GRM-010 구현 완료**: (1) `supabase/migrations/004_bot_flag.sql` — `profiles.is_bot` 추가 + partial index + 기존봇 백필(username 8개 OR 이메일 패턴). (2) `seed-bots/route.ts` — 봇 생성/기존 양쪽에 `is_bot:true` 세팅 → is_bot을 식별 단일소스로 일원화. (3) `supabase/scripts/teardown_bots.sql` — 봇 글·댓글 먼저 삭제(SET NULL 방치 방지) 후 계정 삭제 + 검증쿼리. (4) `00_briefs/standing/SOP_public-release-gate.md` — "봇 0건" 게이트 절차. (5) `types/supabase.ts`에 `is_bot` 추가.
- FK 핵심: `posts/comments.user_id = ON DELETE SET NULL` → 계정만 지우면 봇 글이 user_id=null로 방치. teardown이 글·댓글부터 지우는 이유.
- 로컬 빌드/타입체크 미실행(node_modules 미설치) → 변경은 by-inspection 안전, PR CI가 검증.

## 다음 사람에게 (구체적 첫 행동)

1. GRM-010 실행은 **공개 배포 시점**에 SOP_public-release-gate 대로(프로덕션에서 004 적용→teardown 실행→0건 검증). 지금은 코드/문서만 준비됨.
2. GRM-001 (Ready): 주요 5경로 모바일 Lighthouse 90+ 감사. 실제 앱 실행 필요.
3. `.ai/context.json` 의 `project.domain` 을 `webapp-next` 등 실제 값으로.
4. (권장) 크롤·봇·RLS 로직에 characterization 테스트 추가 검토.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

(없음 — 초기 부팅 단계)

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

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

- (이전) 방법론 부트스트랩(66fb321) + 체크리스트 트리아지·retro-ADR 3건(cb2e0e4) → PR grooman#1 push 완료.
- GRM-010 정책 결정: 사용자 확인 결과 **봇 8개는 출시 전 look 확인용 테스트 픽스처, 실배포 때 전부 삭제, 현재 비공개**. → 프로덕션 공개 표기 불필요, "봇 0건" 릴리스 게이트로 대체.
- 현재 구현이 **봇 teardown 불가**임을 발견(BOT-1, High): `profiles.is_bot` 없음, 식별자 3곳 불일치(`002_seed_bots.sql`=@grooman.kr·`data.ts`=@grooman.internal·`seed-bots/route.ts:38`=랜덤이메일), 삭제 스크립트 부재.
- 반영: ADR-0002 재구성(테스트 픽스처+릴리스 게이트+teardown 리스크), ADR index·TODO GRM-010(실행 항목화)·HANDOFF(GRM-010 Resolved + BOT-1 이슈) 갱신.

## 다음 사람에게 (구체적 첫 행동)

1. **GRM-010 실행(BOT-1 해소)**: `profiles.is_bot` 컬럼 마이그레이션 추가 → 시더가 세팅 → 봇 계정·콘텐츠 teardown 스크립트(`WHERE is_bot`) → 공개 배포 직전 "봇 0건" 쿼리 검증을 릴리스 체크리스트에. **비공개인 지금 하는 게 가장 쌈.**
2. GRM-001 (Ready): 주요 5경로 모바일 Lighthouse 90+ 감사. 실제 앱 실행 필요.
3. `.ai/context.json` 의 `project.domain` 을 `webapp-next` 등 실제 값으로.
4. (권장) 크롤·봇·RLS 로직에 characterization 테스트 추가 검토.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

(없음 — 초기 부팅 단계)

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

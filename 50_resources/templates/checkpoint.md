# Checkpoint — [PROJECT_NAME] 초기 부팅

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> "방금 한 것 · 다음 할 것 · 막힌 것 · 환경"만 담는다 — **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)
> Contract: keep this file under 200 lines, use repository-relative paths, and update it at session end.
> 형식 정의: `10_foundation/WHITEPAPER.md` §2-2.

## 작성자

- Agent: (next-session-will-fill)
- Tool: (next-session-will-fill)
- Host: (next-session-will-fill)
- Workspace: repository root

## 부팅 계약

1. Read `.ai/context.json`.
2. Read every path in `must_read` in order.
3. Use `last_session.checkpoint_file` as the immediate handoff.
4. Start from the first actionable item in "다음 사람에게".

## 방금 한 것 (이번 세션, 정확히)

> *이번 세션*에 한 일의 서사만. 누적 이력(최근 N건 board)은 HANDOFF `Recent Changes` 참조 — 여기 복제 금지.

- 본 프로젝트에 방법론 적용 ([YYYY-MM-DD]).
- L0 이식성 코어(`.ai/`) 생성 — `context.json`, `schema/`, `adapters/`.
- 70_meta 격리 보장 — 외부 주입 안 됨.

## 다음 사람에게 (구체적 첫 행동)

1. `.ai/context.json` 의 `project.domain` 을 실제 값으로 채울 것 (예: `webapp-next`, `data-pipeline`).
2. `HANDOFF.md` 의 *Current Focus* 를 본 프로젝트의 실제 첫 작업으로 갱신.
3. `TODO.md` 에 첫 `<PREFIX>-001` 항목 추가 (acceptance criteria 포함).
4. 첫 작업이 끝나면 본 checkpoint 를 갱신 — 형식: `10_foundation/WHITEPAPER.md` §2-2.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

(없음 — 초기 부팅 단계)

## 환경 메모

- 본 프로젝트는 방법론 [PROJECT_MODE] 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

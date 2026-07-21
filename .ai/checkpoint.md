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

- (이전) 15 PM기획서 v1 머지(PR#8).
- **GRM-011 순서 7(마지막) — 16 AI-001 + 17 평가·가드레일 v1** (branch docs/plan-16-17-ai-eval): 지침 16·17 정독 후 Eval-First 세트 작성. AI-001은 retrofit 명세 — 코드 현재 동작 박제 + 지침 기준 미달을 개선 백로그 5건(B1~B5)으로. 17은 프로젝트 인스턴스 — EDD 사후 적용 정직 선언(골든셋 v1 전 프롬프트·모델 변경 동결 규칙), 메트릭 채택표(clinic 유출 0건 hard), judge 1인 규율(교차 계열 권장+사람 calibration 20건 필수), 게이트 7종 인스턴스.
- **발견 2건**: ① ai_relevance 정정 — 서비스기획서가 tool로 분류했으나 AI 산출물(요약·분류)이 제품에 포함되므로 지침 16 §1.5 기준 **feature** → 서비스기획서 v1.2 정정. ② **fail-open 가드 적발** — API 키 부재 시 기본값 통과(spam 0·전부 hair)로 필터 무력화, 지침 17 §4.2 fail-closed 위반 → CRAWL-2 이슈 + **GRM-014**(B4+B3+B1, Class A, P1) 등록.

## 다음 사람에게 (구체적 첫 행동)

1. 16+17 PR 리뷰(= eval-spec-approval 게이트) — 머지 시 **GRM-011 기획 시리즈 7/7 완료** → GRM-011을 Done으로 이동.
2. **법률 검토 착수 최우선**(크리티컬 패스 — 외부 의존). 병행: P1 구현 3건 — GRM-012(신고·제재, Class B)·GRM-013(측정, Class A)·GRM-014(AI 가드 fail-closed, Class A — 작고 명확해 첫 구현으로 적합).
3. 골든셋 v1 구축 전 프롬프트·모델 변경 금지(17 §1 동결 규칙) — AI 관련 코드 수정 시 인지.
4. 구현 완료 후 흐름: 릴리스 게이트(SOP) → Class C 공개 승인 → P1. 18 마스터플랜은 구현 착수 전 필요 시 작성(지침 18).

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

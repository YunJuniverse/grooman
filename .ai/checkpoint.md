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

- (이전) MASTER_PLAN v1+정합화 머지(PR#10) — master-plan-approval 통과, **M1 공식 착수**.
- **GRM-014 구현** (branch feat/grm-014-ai-guard, Class A): CLAUDE.md 규칙대로 **테스트 우선** — vitest+zod 설치, `tests/unit/crawl-analysis.test.ts` 11케이스 선작성(clinic 구조 거부·enum·범위·타입·필드 누락·malformed JSON) → `lib/ai/crawl-analysis.ts` 신설(zod 스키마+parseCrawlAnalysis 순수 함수) → `claude.ts` 재작성(키 부재 fail-closed·temperature 0·파서 위임). 테스트 11/11·tsc 0·build 27라우트 ✓.
- 부수: package.json에 test 스크립트 추가 → **이후 ship이 테스트를 자동 실행**(게이트 강화). vitest.config.ts(@ alias). AI-001 v1.1(B1·B3·B4 완료 표시, AC④=게이트 추가 불요 판정).
- 참고: Vercel 플러그인 훅이 "AI Gateway로 이관하라" 검증 오류를 냈으나 **기존 확립 패턴(@anthropic-ai/sdk 직접) 유지 판단** — 이관은 GRM-014 범위 밖 인프라 변경 + 골든셋 전 AI 인프라 동결 규칙 위반.

## 다음 사람에게 (구체적 첫 행동)

1. GRM-014 PR 리뷰·머지(Class A — 테스트 11종·빌드 증거 포함).
2. 다음 구현: **GRM-013 측정 인프라** — 인간 액션 선행: GA4 계정·Search Console 등록은 hayden(코드 삽입은 AI). 그다음 GRM-012(최대, Class B).
3. **법률 검토 여전히 미착수** — M1 크리티컬 패스, 재촉 필요.
4. M1 종료 조건 = MASTER_PLAN §5.5 · 골든셋 v1 전 AI-001 프롬프트·모델 변경 동결 유지(이번 변경은 가드·인프라라 동결 위반 아님 — 프롬프트 본문 불변).

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

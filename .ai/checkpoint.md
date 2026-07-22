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

> *이번 세션*에 한 일의 서사만. 누적 이력은 HANDOFF `Recent Changes` 참조.

- (이전) GRM-012 머지. M1 구현 진행 중.
- **GRM-001 Lighthouse — 정직한 부분 처리** (branch feat/grm-001-lighthouse, Class A): 로컬에 Supabase 자격증명(`.env.local`) 전무 → 데이터 구동 페이지 렌더 실패 → **실 Lighthouse 숫자 측정 불가**(에러 페이지 측정은 무의미). 그래서 정적 감사로 전환.
  - 정적 감사(`40_dev/snapshots/lighthouse-audit-2026-07-22.md`): 5경로×4카테고리. 결과 — SEO 양호(전경로 메타·robots·lang·OG·JSON-LD), a11y 대체로 양호(아이콘버튼 aria-label·alt 적절), **주 약점=raw img 14곳 명시적 크기 부재(CLS·best-practices)**.
  - 안전 최적화만 적용(측정 불필요·레이아웃 불변): `layout`에 viewport/themeColor 추가, 리스트 썸네일 5개 img에 `loading=lazy`·`decoding=async`. next/image 전면 전환은 시각 검증 필요라 제외(후속).
  - 검증: 테스트 21/21·tsc·build ✓.
- **숫자 ≥90 측정은 Blocked** — 인간 액션(Vercel preview에 env 설정/배포) 선행 필요. TODO GRM-001을 Blocked로, AC 정적 2건 체크·측정 2건 미체크로 정직 표기.

## 다음 사람에게 (구체적 첫 행동)

1. GRM-001 PR 리뷰·머지(정적 감사+안전 최적화). **숫자 측정은 배포 후** — Vercel preview에 env 넣고 5경로 모바일 Lighthouse ≥90 확인(인간).
2. **M1 남은 구현 = GRM-013 측정 인프라뿐** — 선행 인간 액션: GA4 계정·Search Console 등록. 그 후 코드는 AI.
3. **법률 검토 여전히 미착수** — M1 크리티컬 패스, 재촉.
4. M1 종료(MASTER_PLAN §5.5): 구현은 GRM-013만 남음 + 배포성 항목(Lighthouse 측정·크롤 실소스·봇0·색인) + 게이트(legal·class-c-public-release).

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

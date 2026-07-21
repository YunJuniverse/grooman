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

- 기존 Next.js14+Supabase 앱 grooman에 방법론 v4.0 적용 (2026-07-21, retrofit).
- `init`이 비어있지 않은 디렉터리를 거부 → 임시 staging(`/tmp/meth-staging`)에 `init --type fullstack` 실행 후 grooman으로 복사.
- 충돌 2건 수동 처리: 기존 809줄 자율빌드 CLAUDE.md → `00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md`로 보존, `.gitignore`는 방법론 관리 블록 append 병합.
- CLAUDE.md Project Settings를 실제 스택(Next.js14·Supabase·Vercel·Tailwind/shadcn·Tiptap·Cloudinary·Claude API)으로 채움. Mode=fullstack.
- 빈 `src/`는 제외(grooman은 `app/` 라우터 사용). `.methodology-version` = v4.0 (applied_from 1843dea).

## 다음 사람에게 (구체적 첫 행동)

1. 브랜치 `chore/apply-methodology`를 검토 후 push→PR로 grooman main에 머지 (방법론: main 직접 push 금지).
2. `.ai/context.json` 의 `project.domain` 을 `webapp-next` 등 실제 값으로 채울 것.
3. 첫 방법론 세션(KICKOFF): 기존 코드베이스(app/·supabase/) 현황을 파악해 `TODO.md`에 첫 `<PREFIX>-001` backlog 추가(acceptance criteria 포함), Change Class 판별.
4. 구 자율빌드 스펙(`00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md`)의 미완료 빌드 체크리스트 항목을 TODO로 승격할지 검토.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

(없음 — 초기 부팅 단계)

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

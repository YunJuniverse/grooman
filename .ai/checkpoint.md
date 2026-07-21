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

- (이전) 방법론 v4.0 부트스트랩: 임시 staging init 후 복사, 구 CLAUDE.md 보존, .gitignore 병합, Project Settings 채움. → 커밋 66fb321.
- 구 자율빌드 체크리스트(56항목)를 실코드와 대조: ~53항목 이미 구현(파일명·구조 다름 포함), 진짜 미완은 Lighthouse 검증뿐. → GRM-001만 TODO Ready 승격(옵션 B).
- 핵심 결정 3건 retro-ADR 문서화: ADR-0001(RSS 크롤+AI필터, user_id=null 자동게시, Class B)·ADR-0002(봇 8개 auth.users 직접 시딩, Class C·표기 미결)·ADR-0003(전테이블 RLS + 크롤은 admin client로 RLS 우회, Class B).
- ADR-0002가 표면화한 봇 진정성/공개 표기 문제를 GRM-010(Class C, Human)로 Backlog 등록 + HANDOFF Open Decisions에 반영.

## 다음 사람에게 (구체적 첫 행동)

1. 브랜치 `chore/apply-methodology`를 검토 후 push→PR로 grooman main에 머지 (방법론: main 직접 push 금지). 이 커밋에 ADR 3건 + TODO 포함.
2. **GRM-010 (Class C, Human 결정)**: 봇 시딩 유지 여부 + "AI생성/자동수집" 공개 표기 정책. ADR-0002 리스크 해소 전까지 열린 상태.
3. GRM-001 (Ready): 주요 5경로 모바일 Lighthouse 90+ 감사·최적화. 실제 앱 실행 필요.
4. `.ai/context.json` 의 `project.domain` 을 `webapp-next` 등 실제 값으로 채울 것.
5. (권장) ADR가 커버한 크롤·봇·RLS 비즈니스 로직에 characterization 테스트 추가 검토.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

(없음 — 초기 부팅 단계)

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

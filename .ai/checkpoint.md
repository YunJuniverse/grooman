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

- (이전) 11 서비스기획서 v1 머지(PR#5). 사용자 결정: **G1 신고 UI = P1 필수**.
- **GRM-011 순서 4 — 12 운영기획서 v1** (branch docs/plan-12-ops): 지침 12 정독 후 **1인+AI 슬림 체계**로 작성(가짜 조직도 금지 — 겸직·자동화 정직 매핑). 신고 처리 프로세스(SLA 24h·임시조치 즉시숨김 30일)·제재 단계 5단(조건형)·clinic 최엄격 운영·자동수집 운영(소스 게이트·**비중 상한 50% 제안**)·경량 SEV1~4(포스트모템=관찰로그 friction 재사용)·AI 운영(비용 캡 **₩10k 조사/₩30k 중단 제안**·인젝션은 JSON 스키마 검증으로 방어)·일일 루틴 Toil 캡 15분.
- **G4 갭 발견**: 제재 단계를 설계했는데 **집행 수단이 없음** — profiles 정지 컬럼·RLS·관리자 정지 액션 전무(실측: 관리자는 글 숨김/삭제만 가능). → G1과 세트로 **GRM-012**(Ready, Class B) 등록.
- 반영: 서비스기획서 v1.1(G1=P1 확정)·HANDOFF(G1+G4 통합, GRM-012)·TODO.

## 다음 사람에게 (구체적 첫 행동)

1. 운영기획서 PR 리뷰 — **제안값 승인 3건**: 자동수집 비중 상한 50%(P2에 30%) · AI 비용 캡 ₩10k/₩30k · 제재 단계표. + [미확정] 법률 검토 2건(임시조치 절차·clinic 의료광고법)은 공개 전 필수임을 인지.
2. 리뷰 통과 시 GRM-011 다음: **13 마케팅기획서** → 15 PM → 16+17(AI·평가).
3. **GRM-012**(신고+제재 구현, P1 필수, Class B)는 기획서 시리즈와 병행 가능 — 12 운영기획서 §4.1·§5가 스펙 입력.
4. GRM-001 Lighthouse·GRM-010 실행(배포 시점) 기존 그대로.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

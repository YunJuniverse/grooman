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

- (이전) 14 브랜드기획서 v1 머지(PR#4). 사용자 tagline 3번 확정 → v1.1로 반영(탈락 2건은 slogan 후보 강등).
- **GRM-011 순서 3 — 11 서비스기획서 v1** (branch docs/plan-11-service): 지침 11 정독 — 핵심은 **2026-07 개정 "부모=오케스트레이팅 인덱스"**(§2.2, 컨테이너 금지·자식 산출물에 상세 위임). 구현 27라우트를 역문서화: 기능 6군집(F1~F6 ✅ 실측) + **F7 신고 갭 발견**(reports 테이블·RLS만 있고 UI 없음 → HANDOFF G1, High). 사용자 피라미드 90/9/1, 시나리오 S1~S3+이탈, 산출물 인덱스 9종(전부 미착수 — functional-spec 전수 소급은 과잉문서화로 금지 판단), 정책 역문서화 표(RLS·soft delete·이력 보존), 비목표 6건 게이트화(쪽지·앱·커머스·채팅·전문가인증·여성), AI 진입점(crawl=tool·16번 작성 예정·관리자 실패 UX·clinic 유출 0건 eval bar).
- 코드 사실 확인: 로그인=카카오+구글+이메일 3종(스펙의 "카카오만"과 다름 — 코드 우선), 검색=Postgres FTS GIN, ads 테이블(자체 광고 구좌) 존재.

## 다음 사람에게 (구체적 첫 행동)

1. 서비스기획서 PR 리뷰 — 핵심 사람 판단 1건: **G1 신고 UI를 P1(공개 전 필수)로 볼 것인가 P2로 미룰 것인가**. UGC 공개 + 신고 수단 부재는 정보통신망법 임시조치 관점에서 P1 권장.
2. 리뷰 통과 시 GRM-011 다음: **12 운영기획서**(서비스기획서 §10이 넘긴 항목: 신고 처리·제재 단계·자동수집 비중 상한·clinic 운영·알람 임계) → 13 마케팅.
3. 16 AI 기능 기획서(AI-001 crawl-analysis)는 12·13 뒤 또는 병행 — 서비스기획서 §9가 진입점 확보해둠.
4. GRM-001 Lighthouse·GRM-010 실행(배포 시점)은 기존 그대로.

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

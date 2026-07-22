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

- (이전) GRM-012 머지 · GRM-001(정적감사+next/image) PR#13 오픈 중.
- **Supabase 프로비저닝** (branch chore/supabase-provision): 계정에 grooman 프로젝트가 없어 신규 생성 — **월 $10 비용을 사용자 승인 후** 생성(`wqrxuzplcfjtjoiraqsf`, 서울). 마이그 001·003(스키마만)·004·005 적용, 11테이블 전부 RLS 활성 확인.
  - **002 봇시딩·003 샘플광고는 의도적 미적용** — 배포 전 삭제 대상 데모 데이터. 특히 샘플광고의 "피부과 레이저·보톡스 40% 할인"은 clinic 정책과 충돌.
  - advisor가 WARN 11건 검출 → **006 보안 하드닝** 적용(함수 8개 search_path 고정 + `handle_new_user` SECURITY DEFINER가 anon RPC로 노출된 것 EXECUTE 회수) → **11→1건**(남은 pg_trgm은 미사용이라 보류).
- **법적 검토 — 사용자 요청으로 내가 수행**(변호사 없음). 웹 조사 후:
  - **정보통신망법 §44-2**: 임시조치 자체는 재량이나 **절차는 강행규정**(약관 명시·지체없는 조치·양측 통지·게시판 공시). grooman 약관에 **전혀 없어 법정의무 위반 상태였음** → 약관 **제6조** 신설로 해소.
  - **의료법 §56**: 핵심 발견 = **자발적 단순 후기는 위반 아님**(clinic 카테고리 존립 근거). 위반선 = 대가성·병원특정+유인·효과오인·진단조언 → 약관 **제7조**로 사전고지 + 운영기획서 §4.3에 근거 부여.
  - **플랫폼 책임**(대법 2008다53812 계열): 위법명백+인식가능+미조치일 때만 책임 → 신고체계(GRM-012)+SLA+기록이 실질 방어선(이미 구축됨).
  - 검토메모 `40_dev/snapshots/legal-compliance-review-2026-07-22.md` — **"변호사 아님·법률자문 아님" 한계와 잔여 불확실성 4건 명시**.
- **사용자 오해 1건 정정**: "광고 심의 받으니 법적이슈 클리어" → 광고심의는 광고물 절차이고 UGC/임시조치/저작권은 별개 법리. / **내 오류 1건 정정**: 사업기획서 인프라 가정을 ₩8,000으로 잘못 읽고 $10이 초과라 했으나 실제 가정은 ₩75,000 — 초과 아님.

## 다음 사람에게 (구체적 첫 행동)

1. 이 PR(chore/supabase-provision) 리뷰 — 006 마이그(이미 DB 적용됨)·약관 제6·7조·검토메모.
2. **Vercel은 인간 액션**: 대시보드에서 `YunJuniverse/grooman` import + env 입력(URL=`https://wqrxuzplcfjtjoiraqsf.supabase.co`, 키는 Supabase 대시보드 API 탭). Marketplace Supabase 통합을 쓰면 키 복붙 불필요.
3. 배포되면: GRM-001 Lighthouse 실측 가능 · GRM-013(GA4 계정 필요) 진행.
4. 잔여 법적 항목: 크롤 실소스 저작권 확인(M1 게이트) · 광고↔clinic 분리 원칙(P3 전) · 개인정보처리방침 점검(별도).

## 막혔던 지점 / 시도해봤지만 안 된 것

> *이번 세션*에 시도했다 실패한 것 — 후계자가 같은 벽을 다시 치지 않도록. (누적 Open Issues/Decisions 표는 HANDOFF가 정본 → 여기 복제 금지, 필요 시 "HANDOFF Open Issues 참조")

- **PR 머지-누락 함정**: 브랜치에 추가 push한 뒤 사용자가 PR을 머지하면, 머지가 *어느 시점 head 기준*인지 확인해야 함. `git branch --no-merged origin/main`에 머지된-줄-알았던 브랜치가 남아있으면 즉시 의심할 것 — 이번에 이 신호를 한 번 놓쳤음.

## 환경 메모

- 본 프로젝트는 방법론 fullstack 모드로 시작됨.
- `.methodology-version` 의 upstream commit 을 git 으로 추적.

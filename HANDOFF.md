# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: GRM-013(GTM) 머지됨(PR#15) · **Supabase publishable/secret 키 마이그레이션**(ADR-0004) 완료(리뷰 대기)
- Current mode: fullstack
- Next TODO: 이 PR 리뷰 → **사람**: Supabase Dashboard에서 새 키 발급 → Vercel(Production+Preview)·로컬 `.env.local`에 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`·`SUPABASE_SECRET_KEY`로 값 설정 → **배포 전 필수**(변수명이 바뀌어 기존 값은 인식 안 됨) → `NEXT_PUBLIC_GTM_ID`(Production만) → GTM 콘솔 GA4 연결 → GRM-001 숫자측정
- Blockers: 위 사람 액션 전부 선행 필요 — 완료 전엔 Supabase 연동 자체가 끊긴 상태로 배포됨

## Active Links

- Current PR: branch feat/supabase-key-migration(신규) · 직전 #15 머지됨
- Current issue:
- Relevant ADRs: [ADR-0001](40_dev/adr/0001-rss-auto-crawl-ai-pipeline.md)·[ADR-0002](40_dev/adr/0002-bot-seeding-cold-start.md)·[ADR-0003](40_dev/adr/0003-rls-security-model.md)·[ADR-0004](40_dev/adr/0004-supabase-publishable-secret-keys.md)
- Relevant snapshots:

## Open Decisions

| ID | Decision | Needed By | Status |
|----|----------|-----------|--------|
| GRM-010 | 봇 = 출시 전 테스트 픽스처, 공개 배포 시 전량 삭제 · 프로덕션 표기 불필요 | 공개 배포 전 | **Resolved 2026-07-22** (ADR-0002) — 실행(teardown 수단·릴리스 게이트)은 GRM-010 TODO |

## Open Issues

| ID | Issue | Severity | Next Step |
|----|-------|----------|-----------|
| ~~BOT-1~~ | ~~봇 teardown 불가~~ → **Resolved 2026-07-22** (GRM-010): is_bot 마커·teardown 스크립트·릴리스 게이트 SOP 구현 | ~~High~~ | 공개 배포 시 SOP_public-release-gate 대로 실행 |
| ~~G1+G4~~ | ~~신고 UI + 계정 정지 수단~~ → **Resolved 2026-07-22** (GRM-012): 신고 5종 UI·어드민 처리 큐·`suspended_until`+INSERT RLS·정지/해제. 부수: profiles_update_admin으로 기존 toggleAdmin RLS 잠재버그도 해소 | ~~High~~ | 마이그 005 프로덕션 적용은 배포 시 |
| G5 | 측정 인프라 — **코드측 해소**(GTM `GTM-WJVFXRBT` 설치·env 게이트). 잔여: GA4 구성 태그 연결·Search Console 등록 = 콘솔 작업 | Med | GRM-013 잔여 체크박스 — 사람(hayden) 콘솔 작업 후 전환 이벤트 삽입 |
| KEY-1 | Supabase 키 체계 전환(ADR-0004)으로 env 변수명 변경 — 새 값 설정 전까지 **모든 Supabase 연동 끊김** | High | 사람: Dashboard에서 publishable/secret 키 발급 → Vercel+로컬에 새 변수명으로 설정. 이 PR 머지·배포 전 필수 |
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 + **Supabase advisor 정기 확인**(006로 11→1건 해소) |
| LEGAL-1 | clinic "유인성" 회색지대·광고↔clinic 분리 원칙 미정 (검토메모 §5) | Med | 분쟁 발생·수익화 시 변호사 검토. P3 광고 도입 전 분리 원칙 결정 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-22: **Supabase 키 마이그레이션**(ADR-0004) — anon/service_role → publishable/secret 키명 전환. `@supabase/server`(Edge Functions 전용)는 조사 후 미도입 판단 · Class B
- 2026-07-22: GRM-013 머지(PR#15) — GTM `GTM-WJVFXRBT` 설치(`@next/third-parties`+noscript, env 게이트) · 개인정보처리방침 처리위탁·분석쿠키·정보주체권리 신설 · Class A
- 2026-07-22: **Supabase 프로비저닝**(grooman/서울, 마이그 001·003·004·005 적용) + **006 보안 하드닝**(advisor 11→1건, SECURITY DEFINER RPC 노출 차단) · Class B
- 2026-07-22: **법적 준수 조치** — 정보통신망법 §44-2 절차 약관 미비(법정의무 위반) 발견·해소(약관 제6조) + 의료법 §56 근거로 clinic 기준 정렬(제7조) · 검토메모 작성
- 2026-07-22: GRM-001 머지(PR#13) — 정적 Lighthouse 감사 + **next/image 전환**(raw img 14→0). 숫자측정은 배포 env 필요로 Blocked · Class A

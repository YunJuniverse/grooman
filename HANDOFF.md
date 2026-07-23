# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: **talmo-com 교차조사 반영** — clinic 재게시 차단·법적 갭 문서화·표현 경계 필터·HOT 임계값(권고 1~4번) 구현 완료, 리뷰 대기
- Current mode: fullstack
- Next TODO: 이 PR 리뷰·머지 → talmo 권고 5~8번(폰트 static 전환·DESIGN.md·UX 진단·clinic 신뢰장치) 중 선택. 병행: **사람** GTM 콘솔 GA4 연결 → AI가 전환 이벤트 삽입 → Search Console 등록
- Blockers: 없음

## Active Links

- Current PR: branch feat/talmo-insights-legal-hot(신규) · #18(GRM-001)·#19(SEC-2) 머지 완료
- Current issue:
- Relevant ADRs: [ADR-0001](40_dev/adr/0001-rss-auto-crawl-ai-pipeline.md)·[ADR-0002](40_dev/adr/0002-bot-seeding-cold-start.md)·[ADR-0003](40_dev/adr/0003-rls-security-model.md)·[ADR-0004](40_dev/adr/0004-supabase-publishable-secret-keys.md)
- Relevant snapshots: [lighthouse-measurement-2026-07-24](40_dev/snapshots/lighthouse-measurement-2026-07-24.md)(실측)·[**talmo-com 교차조사**](40_dev/snapshots/talmo-com-cross-project-research-2026-07-24.md)(권고 8건, 5~8번 미착수)·[법적 검토](40_dev/snapshots/legal-compliance-review-2026-07-22.md)(§4-2 보강)

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
| ~~KEY-1~~ | ~~Supabase 키 체계 전환(ADR-0004)으로 env 변수명 변경~~ → **Resolved 2026-07-23** (PR#16): Vercel 새 키·`CRON_SECRET`·GTM Production 전용 전부 설정 확인 | ~~High~~ | — |
| ~~CRON-1~~ | ~~`vercel.json` 크론 2건이 실제 Vercel Cron 호출 형식(GET+`Authorization: Bearer`)과 안 맞아 배포 후에도 절대 실행 안 됨~~ → **Resolved 2026-07-23**: `/api/crawl` Bearer 인식 추가(기존 쿼리파라미터 방식은 어드민 수동 트리거용으로 유지), `/api/admin/bot-activity`에 GET 핸들러 신설(기존 POST는 어드민 수동 트리거 유지, 로직 공유) | ~~High~~ | — |
| SEC-1 | 새 테이블 RLS 정책 누락 시 조용한 취약점 (ADR-0003) | Med | 마이그레이션 추가 시 RLS 점검 + **Supabase advisor 정기 확인**(006로 11→1건 해소) |
| LEGAL-1 | clinic "유인성" 회색지대·광고↔clinic 분리 원칙 미정 (검토메모 §5) | Med | 분쟁 발생·수익화 시 변호사 검토. P3 광고 도입 전 분리 원칙 결정 |
| ~~LEGAL-2~~ | ~~**clinic 후기가 홈·전 카테고리 HOT과 연관글에 재게시**돼 있었음 — 재게시는 광고로 전환되고(복지부 2021), 그 경우 의료법 §56①(광고 주체 한정)에 걸려 고지로 치유 불가~~ → **Resolved 2026-07-24**(사용자 결정 Class C): 재게시 표면에서 clinic 제외(`lib/community/policy.ts`) | ~~High~~ | — |
| LEGAL-3 | **식약처 표시광고 축**(화장품법·건기식법)이 검토에 통째로 없었음 — 탈모는 반복 단속 대상이고 단속 채널에 커뮤니티 포함(622건+376건). 경고 필터(`expression.ts`)는 넣었으나 **경고가 충분한 주의의무인지 미확인** | Med | 검토메모 §5-6. 수익화·분쟁 시 변호사 확인 |
| LEGAL-4 | **의료법 §27(환자 유인)** 미검토 — §56과 별개 축. 약관 제7조가 사실상 대응하나 근거 조문 미명시였음(문서화 완료) | Med | 검토메모 §5-5. clinic 운영 확대 시 재검토 |
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |
| ~~PERF-1~~ | ~~Performance 미달(`/` 61·`/hair` 88) — 폰트 `@import` 렌더블로킹~~ → **Resolved 2026-07-24**: `next/font/local` self-host, 로컬 CLS 0.359→0.097 확인 | ~~Med~~ | production 재측정으로 최종 확인 |
| ~~SEC-2~~ | ~~`AdminDashboard.tsx`의 수동 크롤/봇 트리거가 `NEXT_PUBLIC_CRON_SECRET_HINT`(클라이언트 노출 변수)를 시크릿으로 씀~~ → **Resolved 2026-07-24** (PR#19 머지): 세션+`is_admin`(`lib/supabase/require-admin.ts`)으로 교체, Cron GET 경로는 유지 | ~~Med~~ | — |
| PERF-2 | 다크모드 색상 불일치 — 헤더·하단내비 배경이 `bg-[var(--x)]/NN` 패턴으로 인해 Tailwind가 CSS를 생성 못 해 완전 투명 렌더되고 있었음(2건 수정 완료). 동일 패턴이 PostCard·Header 호버 상태에 잔존 + `text-gray-400`류가 `dark:` variant 없이 전역 90여 곳 | Med | 스폰된 백그라운드 작업 카드로 전역 감사 대기 중 |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-24: **talmo-com 교차조사 반영**(권고 1~4) — clinic 재게시 차단(LEGAL-2, Class C 결정)·검토메모 §4-2 보강(§27·식약처 축)·카테고리 인지형 표현 경고(`expression.ts`, 테스트 16종)·HOT 최소 추천 임계값 · Class B
- 2026-07-24: **talmo-com 전수조사** — 같은 방법론·같은 도메인 자매 프로젝트에서 법적 갭 4건·설계 인사이트 5건·디자인/QA 자산 5건 도출, 권고 8건 우선순위화 · [스냅샷](40_dev/snapshots/talmo-com-cross-project-research-2026-07-24.md)
- 2026-07-24: **SEC-2 머지(PR#19)** — 어드민 수동 트리거 시크릿→세션+`is_admin` 인증 전환, `lib/supabase/require-admin.ts` 신설 · Class B
- 2026-07-24: **GRM-001 Performance·Accessibility 조치**(PR#18) — `next/font/local` self-host, color-contrast 100/100(로컬). 부수: 헤더·하단내비 투명 렌더 버그 수정 → PERF-2 등록 · Class A
- 2026-07-24: **GRM-001 배포환경 실측** — production alias에서 Lighthouse 3/5경로(나머지는 콘텐츠 0건으로 측정 불가) · Class A

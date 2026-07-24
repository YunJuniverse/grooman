# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: GRM-016 다크모드·명암비 전역 감사 완료(브랜치 `fix/dark-mode-contrast-audit`, 27파일) — **커밋 전, 사용자 승인 대기**
- Current mode: fullstack
- Next TODO: GRM-016 커밋·PR → **사람**: production 배포 후 Lighthouse 재측정 확인. 병행: GTM 콘솔에서 GA4 구성 태그 연결+게시 → AI가 가입 전환 이벤트(`sendGTMEvent`) 삽입 → Search Console 등록·소유권 확인·sitemap 제출
- Blockers: 없음

## Active Links

- Current PR: [#18](https://github.com/YunJuniverse/grooman/pull/18)(GRM-001, 측정+조치 추가 커밋됨, 리뷰 대기) · #19(SEC-2) 머지 완료
- Current issue:
- Relevant ADRs: [ADR-0001](40_dev/adr/0001-rss-auto-crawl-ai-pipeline.md)·[ADR-0002](40_dev/adr/0002-bot-seeding-cold-start.md)·[ADR-0003](40_dev/adr/0003-rls-security-model.md)·[ADR-0004](40_dev/adr/0004-supabase-publishable-secret-keys.md)
- Relevant snapshots: [lighthouse-audit-2026-07-22](40_dev/snapshots/lighthouse-audit-2026-07-22.md)(정적)·[lighthouse-measurement-2026-07-24](40_dev/snapshots/lighthouse-measurement-2026-07-24.md)(실측)

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
| CRAWL-1 | 자동 크롤 글이 사람 검수 없이 즉시 published·색인 (ADR-0001) | Med | 자동수집 뱃지·출처는 이미 표기됨. 검수 게이트 도입은 선택 |
| ~~PERF-1~~ | ~~Performance 미달(`/` 61·`/hair` 88) — 폰트 `@import` 렌더블로킹~~ → **Resolved 2026-07-24**: `next/font/local` self-host, 로컬 CLS 0.359→0.097 확인 | ~~Med~~ | production 재측정으로 최종 확인 |
| ~~SEC-2~~ | ~~`AdminDashboard.tsx`의 수동 크롤/봇 트리거가 `NEXT_PUBLIC_CRON_SECRET_HINT`(클라이언트 노출 변수)를 시크릿으로 씀~~ → **Resolved 2026-07-24** (PR#19 머지): 세션+`is_admin`(`lib/supabase/require-admin.ts`)으로 교체, Cron GET 경로는 유지 | ~~Med~~ | — |
| ~~PERF-2~~ | ~~`bg-[var(--x)]/NN` 잔존 2건 + `text-gray-400`류 `dark:` 미지정 전역~~ → **Resolved 2026-07-24** (GRM-016): var()+opacity 패턴 저장소 내 0건, `--accent-translucent` 토큰 신설. 명암비 위반은 라이트/다크 각각의 실제 합성 배경 기준으로 재계산해 조치 | ~~Med~~ | 커밋·PR 대기 |
| PERF-3 | **하드코딩 라이트 카드** — `bg-white`/`bg-gray-50`가 `dark:` 없이 21개 파일에 산재(AdminDashboard·PostDetail·LoginForm·CommentItem·MyPage 등). 다크모드에서 어두운 페이지 위에 흰 카드가 그대로 떠 명암비는 통과하나 테마가 반쪽. 폼 필드도 이 카드에 맞춰 라이트로 고정해 둔 상태 | Med | 카드 배경을 `var(--bg-card)`로 전환 + 내부 `text-gray-*` 전량 토큰화 = 별도 리팩터(범위 큼, GRM-016에서 의도적 제외) |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-24: **GRM-016 다크모드·명암비 전역 감사**(브랜치 `fix/dark-mode-contrast-audit`, 27파일, 커밋 전) — var()+opacity 잔존 2건 조치·`--accent-translucent` 토큰, 폼 필드 다크모드 흰글자/흰배경 버그, 라이트모드 `text-gray-400`(2.3~2.5:1) 전량 조치. 브라우저 자동 감사 9경로×2테마 0건 · Class A
- 2026-07-24: **SEC-2 머지(PR#19)** — 어드민 수동 트리거(크롤/봇 3종) 시크릿→세션+`is_admin` 인증 전환, `lib/supabase/require-admin.ts` 신설. Cron GET 경로(Bearer)는 유지 · Class B
- 2026-07-24: **GRM-001 Performance·Accessibility 조치**(PR#18 추가 커밋) — `next/font/local` self-host(렌더블로킹 `@import` 제거), color-contrast 100/100(로컬). 부수 발견: 헤더·하단내비 배경 완전 투명 렌더 버그(Tailwind var()+opacity 컴파일 실패) 수정 → PERF-2로 잔여 등록 · Class A
- 2026-07-24: **GRM-001 배포환경 실측** — production alias(`grooman.vercel.app`)에서 Lighthouse 실행, 3/5경로(나머지는 콘텐츠 0건으로 측정 불가) · Class A
- 2026-07-23: **KEY-1+CRON-1 머지(PR#16)** — Supabase publishable/secret 키 전환(ADR-0004) + 크론 인증 버그 수정. 사람 env 액션 전부 완료 확인 → 배포 차단 요인 해소 · Class B

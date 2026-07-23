# HANDOFF.md

> **역할 = 누적 상태 보드** (대시보드가 파싱). 여러 세션에 걸쳐 유지되는 *현재 상태*만: 현재 포커스·오픈이슈/결정·링크·최근 변경.
> **세션 서사(방금 한 것·다음 구체 행동·막힌 것)는 `.ai/checkpoint.md`가 정본** — 여기 복제 금지. (경계: CLAUDE.md §4)
> Keep this file under 150 lines.
> Date initialized: 2026-07-21

## Current Focus

- Working on: GRM-001 Performance·Accessibility 조치 완료(폰트 self-host + color-contrast, PR#18에 추가 커밋) — production 재측정은 머지·배포 후
- Current mode: fullstack
- Next TODO: 이 PR 리뷰·머지 → **사람**: production 배포 후 Lighthouse 재측정 확인. 병행: GTM 콘솔 GA4 연결+게시 → AI가 전환 이벤트 삽입 → Search Console 등록
- Blockers: 없음

## Active Links

- Current PR: [#18](https://github.com/YunJuniverse/grooman/pull/18)(GRM-001, 측정+조치 추가 커밋됨)
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
| SEC-2 | `AdminDashboard.tsx`의 수동 크롤/봇 트리거가 `NEXT_PUBLIC_CRON_SECRET_HINT`(클라이언트 노출 변수)를 시크릿으로 씀 — 현재 미설정이라 비활성(버튼 401)이지만, 누군가 `CRON_SECRET`과 같은 값으로 채우면 브라우저에 시크릿 노출 | Med | 세션 기반 관리자 인증(`is_admin`)으로 교체 필요. 스폰된 백그라운드 작업 카드로 대기 중(진행 중) |
| PERF-2 | 다크모드 색상 불일치 — 헤더·하단내비 배경이 `bg-[var(--x)]/NN` 패턴으로 인해 Tailwind가 CSS를 생성 못 해 완전 투명 렌더되고 있었음(2건 수정 완료). 동일 패턴이 PostCard·Header 호버 상태에 잔존 + `text-gray-400`류가 `dark:` variant 없이 전역 90여 곳 | Med | 스폰된 백그라운드 작업 카드로 전역 감사 대기 중 |
| ~~CRAWL-2~~ | ~~fail-open 가드~~ → **Resolved 2026-07-22** (GRM-014): fail-closed+zod 검증+테스트 11종 | ~~Med~~ | — |

## Recent Changes

> 최근 ~5건, **1줄 terse board 항목**(무엇을·PR/클래스). 상세 서사는 checkpoint·git — 여기 복제 금지.

- 2026-07-24: **GRM-001 Performance·Accessibility 조치**(PR#18 추가 커밋) — `next/font/local` self-host(렌더블로킹 `@import` 제거), color-contrast 100/100(로컬). 부수 발견: 헤더·하단내비 배경 완전 투명 렌더 버그(Tailwind var()+opacity 컴파일 실패) 수정 → PERF-2로 잔여 등록 · Class A
- 2026-07-24: **GRM-001 배포환경 실측** — production alias(`grooman.vercel.app`)에서 Lighthouse 실행, 3/5경로(나머지는 콘텐츠 0건으로 측정 불가) · Class A
- 2026-07-23: **KEY-1+CRON-1 머지(PR#16)** — Supabase publishable/secret 키 전환(ADR-0004) + 크론 인증 버그 수정. 사람 env 액션 전부 완료 확인 → 배포 차단 요인 해소 · Class B
- 2026-07-22: GRM-013 머지(PR#15) — GTM `GTM-WJVFXRBT` 설치(`@next/third-parties`+noscript, env 게이트) · 개인정보처리방침 처리위탁·분석쿠키·정보주체권리 신설 · Class A
- 2026-07-22: **Supabase 프로비저닝**(grooman/서울, 마이그 001·003·004·005 적용) + **006 보안 하드닝**(advisor 11→1건, SECURITY DEFINER RPC 노출 차단) · Class B

# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

_(없음)_

## Ready

_(없음)_

## InProgress

### GRM-013
- **title**: 측정 인프라 구축 — GTM/GA4 + Search Console (P1 필수 — G5)
- **mode**: fullstack
- **change-class**: A
- **owner**: AI + Human
- **milestone**: P1
- **acceptance criteria**:
  - [x] GTM 컨테이너 `GTM-WJVFXRBT` 설치 — `@next/third-parties` + noscript 폴백, `NEXT_PUBLIC_GTM_ID` 게이트
  - [x] 개인정보처리방침에 분석 쿠키·처리위탁·정보주체 권리 반영 (설치의 법적 전제)
  - [x] **[사람]** Vercel Production 환경에만 `NEXT_PUBLIC_GTM_ID=GTM-WJVFXRBT` 설정 — 2026-07-23 Preview 체크 해제 확인
  - [ ] **[사람]** GTM 콘솔에서 GA4 구성 태그 연결 + 게시
  - [ ] 가입 전환 이벤트 `sendGTMEvent` 삽입 (GA4 연결 확인 후)
  - [ ] **[사람]** Search Console 등록 + 소유권 확인 + sitemap 제출
  - [ ] 마케팅기획서 §9 KPI 표의 지표가 실제 수집되는지 확인
- **notes**: 마케팅기획서 작성 중 발견(G5). 계정·콘솔 작업은 사람(hayden), 코드 삽입은 AI. **env 게이트 의도**: 미설정 시 GTM 미렌더 → PR preview·로컬 트래픽이 프로덕션 컨테이너를 오염시키지 않음. Production 환경에만 설정할 것(Preview 체크 해제). 로컬 검증 완료: `google_tag_manager["GTM-WJVFXRBT"]` 로드·`gtm.start` 푸시·noscript iframe 확인.

## Blocked

### GRM-001
- **title**: 전 페이지 Lighthouse 90+ 감사 및 최적화
- **mode**: fullstack
- **change-class**: A
- **owner**: AI + Human
- **milestone**: M1
- **acceptance criteria**:
  - [x] 정적(코드 레벨) 감사 — 5경로 × 4카테고리 (`40_dev/snapshots/lighthouse-audit-2026-07-22.md`)
  - [x] 안전 최적화 적용 — viewport/themeColor·리스트 이미지 lazy/async
  - [ ] **[Blocked]** 배포 환경(Vercel preview + env)에서 5경로 모바일 Lighthouse ≥90 측정
  - [ ] 미달 항목 조치·재측정
- **notes**: 정적 감사 결과 SEO·기본 a11y 양호(메타·lang·aria-label 구현). 주 약점=raw img 크기 부재(CLS). next/image 전면 전환 완료(raw img 14→0, PR#13). 시각 정합은 배포 후 확인 권고. **블로커 해소 경로 확인(2026-07-22)**: GRM-013 작업 중, `NEXT_PUBLIC_SUPABASE_URL` + anon key만 빌드에 주입하면 로컬 `next start`로 페이지가 정상 렌더됨을 실증(service_role 불필요 — 공개 읽기는 RLS 허용). 즉 **Vercel 배포를 기다리지 않고 로컬 실측 가능**. 주의: `NEXT_PUBLIC_*`는 빌드 타임 인라인이라 build·start 양쪽에 넣어야 한다.

## Done

### SEC-2
- **title**: 어드민 수동 트리거 시크릿 → 세션 기반 관리자 인증 전환
- **notes**: Completed 2026-07-24. `AdminDashboard.tsx`의 `triggerCrawl`/`triggerBot`이 클라이언트 번들에 인라인되는 `NEXT_PUBLIC_CRON_SECRET_HINT`로 시크릿을 만들어 보내던 방식 제거(비활성 상태였지만 값이 채워지면 즉시 실취약점). `app/api/crawl`(POST 신설)·`app/api/admin/{bot-activity,bot-likes,seed-bots}`의 사람 트리거 경로를 세션 쿠키+`profiles.is_admin` 확인(`lib/supabase/require-admin.ts` 신설, `app/moderation/actions.ts`의 기존 `requireAdmin` 로직 통합)으로 교체. Vercel Cron이 부르는 GET 경로(Bearer `CRON_SECRET`)는 그대로 유지. tsc·vitest(21/21)·build 전부 통과. Class B(인증 변경).

### GRM-015
- **title**: Supabase 프로비저닝 + 법적 준수 조치
- **notes**: Completed 2026-07-22. Supabase 프로젝트 grooman 생성(서울, 월 $10 승인)·마이그 001/003/004/005 적용·11테이블 RLS 확인. **006 보안 하드닝**(advisor 11→1건, `handle_new_user` SECURITY DEFINER의 anon RPC 노출 차단). 법적 검토(변호사 부재, 조사 기반): 정보통신망법 §44-2 절차가 약관에 없어 **법정의무 위반 상태 발견→약관 제6조 신설**, 의료법 §56 근거로 clinic 기준 정렬(제7조)+운영기획서 §4.3. 검토메모 `40_dev/snapshots/legal-compliance-review-2026-07-22.md`(한계·잔여 4건 명시→LEGAL-1). Class B.

### GRM-012
- **title**: 신고 기능 + 계정 제재 수단 구현 (G1·G4 해소)
- **notes**: Completed 2026-07-22. 신고 5종 UI(`ReportButton`)→reports(중복방지 unique)·어드민 신고관리 탭(목록·필터·처리/기각)·계정 정지(`005` 마이그: suspended_until+INSERT RLS·회원관리 7/30/영구·해제). 순수로직 `lib/moderation/reports.ts`+테스트 10종. 부수: `profiles_update_admin` RLS로 기존 toggleAdmin 잠재버그 해소. 테스트 21/21·build ✓. 정합: 12 v1.2·11 v1.3. Class B(스키마·RLS). [[12_운영기획서]] §4.1·§5.

### GRM-014
- **title**: AI-001 가드 강화 — fail-closed + zod 스키마 검증 + temperature 0
- **notes**: Completed 2026-07-22. `lib/ai/crawl-analysis.ts` 신설(zod 스키마 — clinic enum 구조 거부) + `claude.ts` fail-closed 재작성 + **테스트 인프라 도입**(vitest, 단위 테스트 11종 전부 통과) + tsc·build 클린. CRAWL-2 해소. AC④: fail-closed로 키 부재가 안전해져 릴리스 게이트 추가 불요 판정. [[AI-001_crawl-analysis]] v1.1.

### GRM-010
- **title**: 봇 teardown 수단 + 공개 배포 릴리스 게이트
- **notes**: Completed 2026-07-22. `profiles.is_bot` 마이그레이션(`004_bot_flag.sql`)+기존봇 백필, 시더가 is_bot 세팅(식별 일원화), teardown 스크립트(`supabase/scripts/teardown_bots.sql`, 글·댓글 우선 삭제로 SET NULL 방치 방지), 릴리스 게이트 SOP(`00_briefs/standing/SOP_public-release-gate.md`). 실행(프로덕션 teardown+0건 검증)은 공개 배포 시 SOP대로. BOT-1 해소. [[ADR-0002]].

### KEY-1
- **title**: Supabase publishable/secret 키 마이그레이션 (ADR-0004) + 크론 인증 버그 수정(CRON-1)
- **notes**: Completed 2026-07-23 (PR#16 머지). `lib/supabase/{client,server,admin}.ts`·`lib/utils/posts.ts` env var명 전환(anon/service_role→publishable/secret). `@supabase/server`는 조사 결과 Edge Functions(Deno) 전용 SDK로 확인돼 미도입([[ADR-0004]]). 사람 액션(Vercel 키 등록·`CRON_SECRET`·GTM Production 전용 체크) 전부 완료 확인. **파생 발견·해소**: `vercel.json` 크론 2건이 실제 Vercel Cron 호출 형식(GET+`Authorization: Bearer`)과 안 맞아 배포돼도 절대 실행 안 됐을 버그(CRON-1) 발견·수정 — 어드민 수동 트리거 경로는 하위호환 유지. 잔여(비차단): 로컬 `.env.local` 미생성, `SUPABASE_JWKS_URL`은 무용해 삭제 권고했으나 보류(무해).



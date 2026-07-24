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
  - [x] 배포 환경(production alias `grooman.vercel.app`)에서 Lighthouse 실측 — 3/5경로(`/`·`/hair`·`/search`), 나머지 2경로는 production에 게시글 0건이라 측정 불가 (`40_dev/snapshots/lighthouse-measurement-2026-07-24.md`)
  - [x] Performance 원인 조치 — `next/font/local`로 Pretendard self-host, 렌더블로킹 `@import` 제거. 로컬 CLS 0.359→0.097 확인
  - [x] Accessibility 조치 — color-contrast 95→100(로컬). 로그인 버튼 다크모드 대비 미달, 헤더·하단내비 배경 투명 렌더 버그(Tailwind var()+opacity 컴파일 실패)도 같이 발견·수정
  - [ ] **[Blocked]** Performance 수치 production 재측정 — 로컬 측정은 동시 프로세스 경합으로 노이즈 커서 절대값 불신뢰, 이 PR 배포 후 측정 필요
  - [ ] **[Blocked]** `/posts/[id]`·`/profile/[username]` 재측정 — 크롤/봇 콘텐츠 생성 후
- **notes**: 정적 감사 결과 SEO·기본 a11y 양호(메타·lang·aria-label 구현). 주 약점=raw img 크기 부재(CLS). next/image 전면 전환 완료(raw img 14→0, PR#13). **블로커 해소 경로 확인(2026-07-22)**: `NEXT_PUBLIC_SUPABASE_URL` + anon key만 빌드에 주입하면 로컬 `next start`로 정상 렌더됨을 실증 — Vercel 배포 없이 로컬 실측 가능(`NEXT_PUBLIC_*`는 빌드 타임 인라인이라 build·start 양쪽에 필요). **2026-07-24 조치**: 사용자 승인("둘 다 진행해줘") 후 폰트 self-host + color-contrast 수정 완료. 부수 발견 2건은 SEC-2와 같은 패턴으로 백그라운드 작업 스폰(다크모드 전역 감사) — `40_dev/snapshots/lighthouse-measurement-2026-07-24.md` §조치 참조.

## Done

### GRM-016
- **title**: 다크모드·명암비 전역 감사 (PERF-2 해소)
- **notes**: Completed 2026-07-24 (커밋 전, 승인 대기). **① var()+opacity 패턴**: `npx tailwindcss --content`로 직접 컴파일해 `hover:border-[var(--accent)]/40`(PostCard)·`group-hover:ring-[var(--accent)]/40`(Header)가 CSS를 *전혀 생성하지 않음*을 재확인 → 알파 baked-in `--accent-translucent` 토큰 신설로 교체. 저장소 내 잔존 0건. **② 명암비**: 원인이 "다크모드"가 아니라 *컨테이너별 실제 배경*임을 확인 — 테마 배경(`--bg-base`) 위 텍스트는 `dark:` variant 부재로 다크에서 파손(404 `text-gray-900`은 사실상 비가시), 하드코딩 흰 카드 안 텍스트는 `text-gray-400`(2.5:1)이라 **라이트모드에서도 위반**. 두 갈래로 나눠 조치. **③ 파생 버그**: Tailwind preflight가 폼 컨트롤에 `color: inherit`만 주고 배경은 UA 기본(흰 필드)으로 남겨, 다크모드에서 `--text-1`(거의 흰색) 글자가 흰 필드에 찍혀 **입력 내용이 안 보였음** → 필드를 각자의 컨테이너에 맞춰 명시 지정. **④ 자동 감사**로 추가 발견: BottomNav `HOT`(orange-500, 2.79:1)·HotBoard 활성탭(orange-600, 3.56:1)·홈 배지(gray-500 on `--bg-base`, 4.43:1 — 경계 미달). 검증: tsc 0 · vitest 21/21 · build 27라우트 · 브라우저 합성배경 명암비 자동감사 9경로×2테마 **0건**. 27파일. Class A. 잔여는 PERF-3(하드코딩 라이트 카드).

### SEC-2
- **title**: 어드민 수동 트리거 시크릿 → 세션 기반 관리자 인증 전환
- **notes**: Completed 2026-07-24. `AdminDashboard.tsx`의 `triggerCrawl`/`triggerBot`이 클라이언트 번들에 인라인되는 `NEXT_PUBLIC_CRON_SECRET_HINT`로 시크릿을 만들어 보내던 방식 제거(비활성 상태였지만 값이 채워지면 즉시 실취약점). `app/api/crawl`(POST 신설)·`app/api/admin/{bot-activity,bot-likes,seed-bots}`의 사람 트리거 경로를 세션 쿠키+`profiles.is_admin` 확인(`lib/supabase/require-admin.ts` 신설, `app/moderation/actions.ts`의 기존 `requireAdmin` 로직 통합)으로 교체. Vercel Cron이 부르는 GET 경로(Bearer `CRON_SECRET`)는 그대로 유지. tsc·vitest(21/21)·build 전부 통과. Class B(인증 변경). [PR#19](https://github.com/YunJuniverse/grooman/pull/19) 생성·리뷰 대기.

### GRM-015
- **title**: Supabase 프로비저닝 + 법적 준수 조치
- **notes**: Completed 2026-07-22. Supabase 프로젝트 grooman 생성(서울, 월 $10 승인)·마이그 001/003/004/005 적용·11테이블 RLS 확인. **006 보안 하드닝**(advisor 11→1건, `handle_new_user` SECURITY DEFINER의 anon RPC 노출 차단). 법적 검토(변호사 부재, 조사 기반): 정보통신망법 §44-2 절차가 약관에 없어 **법정의무 위반 상태 발견→약관 제6조 신설**, 의료법 §56 근거로 clinic 기준 정렬(제7조)+운영기획서 §4.3. 검토메모 `40_dev/snapshots/legal-compliance-review-2026-07-22.md`(한계·잔여 4건 명시→LEGAL-1). Class B.

### GRM-012
- **title**: 신고 기능 + 계정 제재 수단 구현 (G1·G4 해소)
- **notes**: Completed 2026-07-22. 신고 5종 UI(`ReportButton`)→reports(중복방지 unique)·어드민 신고관리 탭(목록·필터·처리/기각)·계정 정지(`005` 마이그: suspended_until+INSERT RLS·회원관리 7/30/영구·해제). 순수로직 `lib/moderation/reports.ts`+테스트 10종. 부수: `profiles_update_admin` RLS로 기존 toggleAdmin 잠재버그 해소. 테스트 21/21·build ✓. 정합: 12 v1.2·11 v1.3. Class B(스키마·RLS). [[12_운영기획서]] §4.1·§5.

> 오래된 Done(2026-07-22-23 완료·머지)은 git 이력·PR로 이관: GRM-014(AI 가드 fail-closed, CRAWL-2), GRM-010(봇 teardown·릴리스 게이트, BOT-1), KEY-1(Supabase 키 전환 PR#16, CRON-1).



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

### GRM-018
- **title**: UX 진단·clinic 설계 후속 조치 (문서→구현)
- **mode**: fullstack
- **change-class**: A
- **owner**: AI + Human
- **acceptance criteria**:
  - [ ] 다크모드 제목 대비(§1, 13곳) — **PERF-2 백그라운드 작업이 처리 중**(중복 주의). 배경 맥락(bg-white 하드코딩 페이지 제외) 필요
  - [ ] `/search` 본문에 검색 입력창(현재 헤더 아이콘으로만 열림 — 흐름 단절)
  - [ ] 홈 한 줄 소개 히어로(비로그인 첫 방문자용 랜딩 맥락)
  - [ ] clinic 신뢰 장치 B안(경량 스키마)+C안(익명 옵션) — clinic 활성화 시(Class B, `clinic-trust-design-2026-07-24.md`)
- **notes**: `user-ux-diagnosis-2026-07-24.md`·`clinic-trust-design-2026-07-24.md`의 미착수 항목. clinic·콜드스타트 항목은 글이 쌓인 뒤가 적기.

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
- **title**: talmo-com 교차조사 권고 5~8번 — 폰트·DESIGN.md·UX 진단·clinic 설계
- **notes**: Completed 2026-07-24. **⑤ 폰트**(권고는 static 4굵기였으나 더 나은 방식 발견): 내가 오전에 넣은 variable 2.0MB가 실은 회귀였음(CDN dynamic-subset은 홈 260KB만 받았는데 통짜 2.0MB로 8배 악화). **dynamic-subset 92청크 self-host**(`public/fonts/pretendard/`+`app/pretendard.css`)로 전환 → 홈 256KB·완전 커버리지·렌더블로킹 없음 실측. static subset은 UGC 글자 깨짐 위험이라 배제. `next/font/local`은 unicode-range 분할 API가 없어 수동 @font-face. (`font-strategy-2026-07-24.md`) **⑥ DESIGN.md 신설**: grooman 실제 토큰(globals.css에서 추출, 색·카테고리 6종 대조 일치)+결정 근거 산문+규제 금칙 박제+Tailwind var()+opacity 함정·accent 대비 함정 기록. **⑦ UX 진단**(`user-ux-diagnosis-2026-07-24.md`): 저니 관찰로 **다크모드 제목 13곳 안 보임(대비 1.05:1)** 발견 — Lighthouse가 못 잡은 것. 일괄 수정 시도했다 bg-white 페이지 white-on-white 위험 확인하고 되돌려 PERF-2로 이관(범위 규율). **⑧ clinic 신뢰장치**(`clinic-trust-design-2026-07-24.md`): 강남언니 3종+talmo 시드 교훈 설계, 스키마 변경이라 빌드 전 게이트로 GRM-018에 등록. 검증: tsc 0·vitest 43·build 27·폰트 브라우저 실측. Class A. 미착수 후속 → GRM-018.

### GRM-017
- **title**: talmo-com 교차조사 권고 1~4번 — 법적 노출 차단 + 표현 필터 + HOT 임계값
- **notes**: Completed 2026-07-24. ① **clinic 재게시 차단**(Class C, 사용자 3지선다 결정): `getHotPosts`·`RelatedPosts` 태그 경로에서 clinic 제외 — 재게시는 광고로 전환되고(복지부 2021) 그 경우 의료법 §56①(광고 주체 의료인 한정)에 걸려 고지로 치유 불가. clinic 카테고리·검색·상세 노출은 유지(원래 자리는 재게시 아님). ② **검토메모 §4-2 보강**: 의료법 §27(환자 유인)·식약처 표시광고 축(화장품법·건기식법) 두 축이 통째로 빠져 있던 것 문서화 → LEGAL-3·LEGAL-4. ③ **카테고리 인지형 표현 경고**(`lib/community/expression.ts`): 블랭킷 차단은 과차단이라("탈모 증상 완화"는 합법) 카테고리별 규칙 + **차단 아닌 경고**(이용자 발화 vs 판매자 등록 구분). 작성 화면에 실시간 노출. ④ **HOT 최소 추천 임계값**: `hot_rank`의 시간항(Reddit식 epoch/45000)이 지배해 "HOT=최신"이 되던 것 해소. 부수: `extractText`/`extractThumbnail`을 server action에서 `lib/utils/tiptap.ts`로 추출(클라이언트 공유). 테스트 27→43종. 검증: PostgREST 필터 문법 실측(정상 200/오형식 400), 경고 UI 번들·CSS 컴파일 확인. Class B.

### SEC-2
- **title**: 어드민 수동 트리거 시크릿 → 세션 기반 관리자 인증 전환
- **notes**: Completed 2026-07-24. `AdminDashboard.tsx`의 `triggerCrawl`/`triggerBot`이 클라이언트 번들에 인라인되는 `NEXT_PUBLIC_CRON_SECRET_HINT`로 시크릿을 만들어 보내던 방식 제거(비활성 상태였지만 값이 채워지면 즉시 실취약점). `app/api/crawl`(POST 신설)·`app/api/admin/{bot-activity,bot-likes,seed-bots}`의 사람 트리거 경로를 세션 쿠키+`profiles.is_admin` 확인(`lib/supabase/require-admin.ts` 신설, `app/moderation/actions.ts`의 기존 `requireAdmin` 로직 통합)으로 교체. Vercel Cron이 부르는 GET 경로(Bearer `CRON_SECRET`)는 그대로 유지. tsc·vitest(21/21)·build 전부 통과. Class B(인증 변경). [PR#19](https://github.com/YunJuniverse/grooman/pull/19) 생성·리뷰 대기.

### GRM-015
- **title**: Supabase 프로비저닝 + 법적 준수 조치
- **notes**: Completed 2026-07-22. Supabase 프로젝트 grooman 생성(서울, 월 $10 승인)·마이그 001/003/004/005 적용·11테이블 RLS 확인. **006 보안 하드닝**(advisor 11→1건, `handle_new_user` SECURITY DEFINER의 anon RPC 노출 차단). 법적 검토(변호사 부재, 조사 기반): 정보통신망법 §44-2 절차가 약관에 없어 **법정의무 위반 상태 발견→약관 제6조 신설**, 의료법 §56 근거로 clinic 기준 정렬(제7조)+운영기획서 §4.3. 검토메모 `40_dev/snapshots/legal-compliance-review-2026-07-22.md`(한계·잔여 4건 명시→LEGAL-1). Class B.

### GRM-012
- **title**: 신고 기능 + 계정 제재 수단 구현 (G1·G4 해소)
- **notes**: Completed 2026-07-22. 신고 5종 UI(`ReportButton`)→reports(중복방지 unique)·어드민 신고관리 탭(목록·필터·처리/기각)·계정 정지(`005` 마이그: suspended_until+INSERT RLS·회원관리 7/30/영구·해제). 순수로직 `lib/moderation/reports.ts`+테스트 10종. 부수: `profiles_update_admin` RLS로 기존 toggleAdmin 잠재버그 해소. 테스트 21/21·build ✓. 정합: 12 v1.2·11 v1.3. Class B(스키마·RLS). [[12_운영기획서]] §4.1·§5.

### KEY-1
- **title**: Supabase publishable/secret 키 마이그레이션 (ADR-0004) + 크론 인증 버그 수정(CRON-1)
- **notes**: Completed 2026-07-23 (PR#16 머지). `lib/supabase/{client,server,admin}.ts`·`lib/utils/posts.ts` env var명 전환(anon/service_role→publishable/secret). `@supabase/server`는 조사 결과 Edge Functions(Deno) 전용 SDK로 확인돼 미도입([[ADR-0004]]). 사람 액션(Vercel 키 등록·`CRON_SECRET`·GTM Production 전용 체크) 전부 완료 확인. **파생 발견·해소**: `vercel.json` 크론 2건이 실제 Vercel Cron 호출 형식(GET+`Authorization: Bearer`)과 안 맞아 배포돼도 절대 실행 안 됐을 버그(CRON-1) 발견·수정 — 어드민 수동 트리거 경로는 하위호환 유지. 잔여(비차단): 로컬 `.env.local` 미생성, `SUPABASE_JWKS_URL`은 무용해 삭제 권고했으나 보류(무해).



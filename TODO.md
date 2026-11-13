# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

_(없음)_

## Backlog

### GRM-020
- **title**: clinic 신뢰 장치 (강남언니 3종 패턴) — clinic 활성화 시
- **mode**: fullstack
- **change-class**: B
- **owner**: AI + Human
- **acceptance criteria**:
  - [ ] B안(경량 스키마): `post_clinic_meta`(has_downside·verified·verified_by/at) + '아쉬운 점' 필수 입력 + 인증 이미지 업로드 + 목록 필터
  - [ ] C안(익명 옵션): clinic 글 단위 익명 토글 — `createComment`에도 동일 정책 적용(talmo가 잡은 정책 구멍)
  - [ ] 선결: 봇 시딩(ADR-0002) 시 clinic 후기 만족도 분포 넓게(talmo 교훈 — 평점 3~5만 있으면 '아쉬운 점' 필터 공허)
- **notes**: 설계 `40_dev/snapshots/clinic-trust-design-2026-07-24.md`. 스키마 변경(Class B)이고 clinic 글 0건이라 지금 만들면 검증 데이터 없음 → clinic 활성화 후 빌드 게이트. 예약·상담·가격 동선은 §27 위반이라 배제.

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

### GRM-018
- **title**: UX 진단 후속 — 검색 페이지 검색창 + 홈 랜딩 히어로
- **notes**: Completed 2026-07-24. **검색창(§3)**: `app/search/SearchBox.tsx`(client) 신설 — 검색 페이지 본문에 검색창 배치, 헤더 아이콘으로만 검색을 열던 흐름 단절 해소. `initialQuery`로 결과 페이지에서도 검색어 유지(SSR value 실측 확인). **홈 히어로(§4)**: 비로그인 첫 방문자에게만 "대한민국 남성 그루밍 커뮤니티" 한 줄 소개 + 시작하기/둘러보기 CTA(로그인 사용자에겐 숨김, `auth.getUser()` 서버 판정). 검색 유입 시 랜딩 맥락 제공. **다크 제목(§1)**: GRM-019(PR#21)가 이미 해소함을 확인 — 잔여 `text-gray-900`은 전부 `bg-white` 하드코딩 컨테이너(privacy·terms·글상세 article) 안이라 의도적으로 유지된 것. **clinic 신뢰장치(§8)**: 스키마 변경(Class B)+clinic 글 0건이라 GRM-020(Backlog)으로 분리. 검증: tsc 0·vitest 43·build 27·브라우저 히어로/검색 시각 확인. 참고: 홈 `revalidate=60`은 기존 쿠키 읽기로 이미 무력(死 설정)이었음을 빌드로 확인, 이 변경이 새 문제 아님. Class A. 근거: `user-ux-diagnosis-2026-07-24.md`.

### GRM-019
- **title**: 다크모드·명암비 전역 감사 (PERF-2 해소)
- **notes**: Completed 2026-07-24 (PR#21). **⚠️ ID 주의**: 처음 커밋은 `GRM-016`으로 찍었으나, 병렬로 먼저 머지된 PR#20이 같은 `GRM-016`(talmo 5~8)을 선점 → 충돌 해소하며 `GRM-019`로 리넘버(커밋 메시지·초기 관찰로그 파일명엔 GRM-016 잔존, 정본 ID는 GRM-019). **① var()+opacity 패턴**: `npx tailwindcss --content`로 직접 컴파일해 `hover:border-[var(--accent)]/40`(PostCard)·`group-hover:ring-[var(--accent)]/40`(Header)가 CSS를 *전혀 생성하지 않음*을 재확인 → 알파 baked-in `--accent-translucent` 토큰으로 교체. 저장소 내 잔존 0건. **② 명암비**: 원인이 "다크모드"가 아니라 *컨테이너별 실제 배경*임을 확인 — 테마 배경 위 텍스트는 `dark:` 부재로 다크에서 파손(404 `text-gray-900` 사실상 비가시), 하드코딩 흰 카드 안 텍스트는 `text-gray-400`(2.5:1)이라 **라이트에서도 위반**. 두 갈래로 조치. privacy·terms 등 `bg-white` 페이지는 UX 진단 경고(역효과)대로 `dark:` 미적용 유지. **③ 파생 버그**: Tailwind preflight가 폼 컨트롤에 `color:inherit`만 주고 배경은 UA 기본(흰 필드) → 다크에서 흰글자/흰필드로 입력값 비가시. 필드별 컨테이너 맞춤 명시. **④ 자동 감사**로 추가 발견: BottomNav `HOT`(2.79:1)·HotBoard 활성탭(3.56:1)·홈 배지(4.43:1). 검증: tsc 0·vitest 21/21·build 27라우트·브라우저 합성배경 자동감사 9경로×2테마 **0건**. 27파일. Class A. 잔여는 PERF-3. main(PR#20) 충돌 해소 완료.

### GRM-016
- **title**: talmo-com 교차조사 권고 5~8번 — 폰트·DESIGN.md·UX 진단·clinic 설계
- **notes**: Completed 2026-07-24. **⑤ 폰트**(권고는 static 4굵기였으나 더 나은 방식 발견): 내가 오전에 넣은 variable 2.0MB가 실은 회귀였음(CDN dynamic-subset은 홈 260KB만 받았는데 통짜 2.0MB로 8배 악화). **dynamic-subset 92청크 self-host**(`public/fonts/pretendard/`+`app/pretendard.css`)로 전환 → 홈 256KB·완전 커버리지·렌더블로킹 없음 실측. static subset은 UGC 글자 깨짐 위험이라 배제. `next/font/local`은 unicode-range 분할 API가 없어 수동 @font-face. (`font-strategy-2026-07-24.md`) **⑥ DESIGN.md 신설**: grooman 실제 토큰(globals.css에서 추출, 색·카테고리 6종 대조 일치)+결정 근거 산문+규제 금칙 박제+Tailwind var()+opacity 함정·accent 대비 함정 기록. **⑦ UX 진단**(`user-ux-diagnosis-2026-07-24.md`): 저니 관찰로 **다크모드 제목 13곳 안 보임(대비 1.05:1)** 발견 — Lighthouse가 못 잡은 것. 일괄 수정 시도했다 bg-white 페이지 white-on-white 위험 확인하고 되돌려 PERF-2로 이관(범위 규율). **⑧ clinic 신뢰장치**(`clinic-trust-design-2026-07-24.md`): 강남언니 3종+talmo 시드 교훈 설계, 스키마 변경이라 빌드 전 게이트로 GRM-018에 등록. 검증: tsc 0·vitest 43·build 27·폰트 브라우저 실측. Class A. 미착수 후속 → GRM-018.

### GRM-017
- **title**: talmo-com 교차조사 권고 1~4번 — 법적 노출 차단 + 표현 필터 + HOT 임계값
- **notes**: Completed 2026-07-24. ① **clinic 재게시 차단**(Class C, 사용자 3지선다 결정): `getHotPosts`·`RelatedPosts` 태그 경로에서 clinic 제외 — 재게시는 광고로 전환되고(복지부 2021) 그 경우 의료법 §56①(광고 주체 의료인 한정)에 걸려 고지로 치유 불가. clinic 카테고리·검색·상세 노출은 유지(원래 자리는 재게시 아님). ② **검토메모 §4-2 보강**: 의료법 §27(환자 유인)·식약처 표시광고 축(화장품법·건기식법) 두 축이 통째로 빠져 있던 것 문서화 → LEGAL-3·LEGAL-4. ③ **카테고리 인지형 표현 경고**(`lib/community/expression.ts`): 블랭킷 차단은 과차단이라("탈모 증상 완화"는 합법) 카테고리별 규칙 + **차단 아닌 경고**(이용자 발화 vs 판매자 등록 구분). 작성 화면에 실시간 노출. ④ **HOT 최소 추천 임계값**: `hot_rank`의 시간항(Reddit식 epoch/45000)이 지배해 "HOT=최신"이 되던 것 해소. 부수: `extractText`/`extractThumbnail`을 server action에서 `lib/utils/tiptap.ts`로 추출(클라이언트 공유). 테스트 27→43종. 검증: PostgREST 필터 문법 실측(정상 200/오형식 400), 경고 UI 번들·CSS 컴파일 확인. Class B.

### SEC-2
- **title**: 어드민 수동 트리거 시크릿 → 세션 기반 관리자 인증 전환
- **notes**: Completed 2026-07-24. `AdminDashboard.tsx`의 `triggerCrawl`/`triggerBot`이 클라이언트 번들에 인라인되는 `NEXT_PUBLIC_CRON_SECRET_HINT`로 시크릿을 만들어 보내던 방식 제거(비활성 상태였지만 값이 채워지면 즉시 실취약점). `app/api/crawl`(POST 신설)·`app/api/admin/{bot-activity,bot-likes,seed-bots}`의 사람 트리거 경로를 세션 쿠키+`profiles.is_admin` 확인(`lib/supabase/require-admin.ts` 신설, `app/moderation/actions.ts`의 기존 `requireAdmin` 로직 통합)으로 교체. Vercel Cron이 부르는 GET 경로(Bearer `CRON_SECRET`)는 그대로 유지. tsc·vitest(21/21)·build 전부 통과. Class B(인증 변경). [PR#19](https://github.com/YunJuniverse/grooman/pull/19) 생성·리뷰 대기.

> 오래된 Done(2026-07-22-23 완료·머지)은 git 이력·PR로 이관: GRM-015(Supabase 프로비저닝+법적준수, 006 하드닝), GRM-012(신고+제재 PR, G1·G4), KEY-1(Supabase 키 전환 PR#16, CRON-1), GRM-014(AI 가드 fail-closed), GRM-010(봇 teardown·릴리스 게이트).



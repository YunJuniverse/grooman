# Lighthouse 숫자 측정 — 2026-07-24 (M1, GRM-001 후속)

> 날짜 산출물(라이브 아님). `40_dev/snapshots/lighthouse-audit-2026-07-22.md`(정적 감사)의 후속 — 배포 환경에서 실제 숫자를 측정한 기록.

## 측정 환경

- 대상: `https://grooman.vercel.app`(production alias — 커스텀 도메인 미연결, `grooman-*.vercel.app` 배포별 URL은 Deployment Protection(SSO)에 막혀 측정 불가했음)
- 커밋: `ccae1b2`(PR#17까지 반영 — Supabase 키 마이그레이션·크론 인증 수정·GTM 설치 전부 포함)
- 도구: `lighthouse` CLI 13.4.1, `--form-factor=mobile --screenEmulation.mobile`, headless Chrome
- 대상 경로: 원래 정적 감사와 동일한 5경로(`/`, `/hair`, `/posts/[id]`, `/search`, `/profile/[username]`)

## ⚠️ 측정 범위 제약

- **`/posts/[id]`·`/profile/[username]` 측정 불가**: production에 발행된 게시글이 0건이다. 크롤(`ANTHROPIC_API_KEY` 미설정으로 fail-closed skip)과 봇 활동(크론이 CRON-1 수정 전까지 한 번도 정상 실행 안 됐음)이 이제 막 정상화됐을 뿐 아직 실제로 돌지 않아 콘텐츠가 비어 있다. 실제 글이 생기면 재측정 필요 — **이번 측정은 3/5경로만 유효**.
- 홈페이지도 콘텐츠가 비어 있는 상태로 측정됐다는 점에서 실사용 시나리오와 다소 다를 수 있다(주로 정적 자산·폰트·GTM 비용은 콘텐츠 유무와 무관해 유효하지만).

## 결과

| 경로 | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | **61** ❌ | 95 | 100 | 100 |
| `/hair` | **88** ❌(근접) | 95 | 100 | 100 |
| `/search` | 98 | 95 | 100 | **66** ⚠️ |
| `/posts/[id]` | — | — | — | — | 측정 불가(콘텐츠 없음) |
| `/profile/[username]` | — | — | — | — | 측정 불가(콘텐츠 없음) |

- `/search`의 SEO 66은 **의도된 결과**다 — `robots: noindex`가 있는 페이지는 Lighthouse가 "색인 차단됨"을 감점 처리하는데, 이건 정적 감사 때 이미 "중복 색인 방지 목적의 의도적 설정으로 정상"이라 판정한 사항([`lighthouse-audit-2026-07-22.md`](lighthouse-audit-2026-07-22.md) 참조). 실질 결함 아님.

## 근본 원인 진단

### 1. Performance — `/`(61)·`/hair`(88) 미달

- **LCP·CLS의 공통 원인**: `app/globals.css:1`이 `@import url('https://cdn.jsdelivr.net/.../pretendard.../pretendardvariable-dynamic-subset.min.css')`로 웹폰트를 가져온다.
  - CSS `@import`는 **렌더 블로킹 + 순차 로딩**이다 — 브라우저가 메인 CSS를 받고 파싱한 뒤에야 이 import를 발견해 폰트 CSS를 추가로 요청한다.
  - 게다가 `cdn.jsdelivr.net`은 서드파티 origin이라 DNS·TCP·TLS 핸드셰이크가 추가로 붙는다(`preconnect` 없음).
  - 폰트가 늦게 도착하며 폴백 폰트→웹폰트 스왑이 발생 → **CLS 0.359**(홈, score 0.3 — 매우 나쁨)의 주 원인으로 추정.
  - `/`: LCP 5.0s(score 0.26, 매우 나쁨) — 콘텐츠가 없는 홈이라 LCP 요소 자체가 애매하지만, 폰트 지연이 페인트 전체를 늦추는 것으로 보임.
  - `/hair`: LCP 2.9s(score 0.8)·CLS 0.123(score 0.84) — 홈보다는 낫지만 여전히 폰트 로딩 방식이 병목.
- **GTM 스크립트(114KB)**가 홈페이지 전체 리소스(620KB, 42요청) 중 단일 최대 항목이다. 이건 GRM-013에서 의도적으로 추가한 비용이라 "결함"은 아니지만, 성능 예산에 반영해야 할 사실.
- **fix 후보(제안, 아직 미적용)**: `next/font/local`로 Pretendard를 self-host하면 ①렌더 블로킹 `@import` 제거 ②서드파티 origin 제거 ③`font-display`·`size-adjust` 자동 최적화로 CLS 크게 감소가 기대된다. 단 실제 폰트 파일(Pretendard Variable, OFL 라이선스)을 저장소에 들여와야 하는 코드 변경이라 "측정" 범위를 넘어선다 — 진행 여부 확인 필요.

### 2. Accessibility — 95 (color-contrast만 감점)

- 유일한 감점 항목: `color-contrast`(홈 7건, `/hair` 11건).
- 구체 위반 요소:
  - `<a href="/login">` — `text-white` on `bg-[var(--accent)]` (로그인 버튼)
  - `text-gray-400`류 텍스트(타임스탬프·부제 등) — 배경 대비 부족
  - `/hair`의 탭 버튼(`border-gray-900`/`border-transparent`) 주변 텍스트
- **fix 후보**: `--accent` 배경 위 흰 글자의 명암비 확인(WCAG AA 4.5:1) 후 필요시 색상 톤 조정, `gray-400`→`gray-500`/`600`으로 다수 교체. Tailwind 클래스 치환 수준이라 상대적으로 안전한 변경.

## 판정 (1차 측정)

- **≥90 전 카테고리 통과 기준으로는 미달** — Performance가 주 원인(홈 61, /hair 88), Accessibility는 근접(95, color-contrast 특정).
- Best Practices·SEO는 실질적으로 만점(SEO의 /search 66은 의도된 noindex).

## 조치 (2026-07-24, 사용자 승인 후 진행)

- **폰트 self-host**: `pretendard` npm 패키지에서 variable woff2(2.0MB, weight 45~920, SIL OFL 1.1 라이선스) 추출해 `app/fonts/PretendardVariable.woff2`로 저장, `next/font/local`로 로드(`app/fonts.ts`). `globals.css`의 렌더블로킹 `@import`(cdn.jsdelivr.net) 제거. 로컬 재측정: CLS 0.359→0.097, FCP 1.9s→0.8s, Speed Index 3.9s→0.8s — 진단대로 개선 확인.
- **color-contrast(95→100 확인)**: 로그인 버튼·사이드바 활성 항목의 `bg-[var(--accent)]`(다크모드 값 #818cf8 vs 흰 텍스트 = 2.98:1, 미달)를 테마 무관 `bg-indigo-600`(6.29:1)으로 교체. 홈 배지 `dark:text-gray-600`(방향이 거꾸로 — 다크 배경엔 더 밝은 회색이 필요)→`dark:text-gray-400`. Footer(`bg-white` 하드코딩) `text-gray-400`(2.53:1)→`text-gray-500`(4.83:1).
- **부수 발견·수정(범위 외였으나 같은 컴포넌트라 같이 처리)**: `Header.tsx`·`BottomNav.tsx`가 `bg-[var(--bg-card)]/90`·`/95`를 쓰고 있었는데, **Tailwind가 CSS 커스텀 프로퍼티에 opacity modifier를 적용하지 못해 해당 클래스가 컴파일된 CSS에 아예 존재하지 않았다**(`npx tailwindcss` 직접 컴파일로 확인) — 즉 헤더·하단내비 배경이 완전히 투명하게 렌더되고 있었다. `globals.css`에 알파값을 미리 계산해 넣은 `--bg-card-translucent` 변수를 추가해 해결.
- **로컬 재측정 결과**: Accessibility 95→**100**(color-contrast 위반 0건, 재현 확인). Performance는 로컬 측정 환경(동시 실행 중이던 다른 백그라운드 프로세스와 자원 경합)에서 재현성이 낮아 절대 수치는 신뢰하지 않음 — **정식 재측정은 이 PR 머지·배포 후 production에서 진행**.
- **남겨둔 것(별도 백그라운드 작업으로 위임)**: 동일한 `var()`+opacity 컴파일 실패 패턴이 `PostCard.tsx`(hover border)·`Header.tsx`(avatar ring)에도 있음(호버 전용이라 화면이 깨지진 않음). `text-gray-400` 계열이 `dark:` variant 없이 전역 90여 곳에 더 있어 다크모드 명암비가 개별적으로 더 있을 수 있음 — 전체 스윕은 이번 조치 범위를 넘어서 별도 작업으로 분리.

## Acceptance Criteria 판정 (GRM-001)

- [x] 배포 환경에서 측정 실행 — 3/5경로 완료, 2/5는 콘텐츠 부재로 측정 불가(별도 재측정 필요, 이 문서 §측정 범위 제약)
- [x] Accessibility 미달 조치 — color-contrast 100/100 확인(로컬)
- [x] Performance 미달 원인 조치(폰트 self-host) — **재측정은 production 배포 후 필요**(로컬 측정 노이즈로 절대 수치 미확정)

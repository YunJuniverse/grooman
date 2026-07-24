# 폰트 전략 — Pretendard 자체 호스팅 방식 재검토 (2026-07-24)

> 날짜 산출물(라이브 아님). talmo-com 교차조사 권고 5번("폰트 static 4굵기로 ~1MB 절감") 검토 결과, **더 나은 방식(dynamic-subset self-host)**을 찾아 그걸로 갔다.

## 배경 — 내가 만든 회귀

GRM-001 조치(2026-07-24 오전)에서 렌더블로킹 `@import`를 없애려고 Pretendard **variable 단일 파일(2.0MB)**을 `next/font/local`로 self-host했다. `@import` 제거·CLS 개선은 맞았지만, **폰트 전송량을 크게 악화**시켰다는 걸 이 검토에서 발견했다.

## 실측 — 4가지 방식 비교

| 방식 | 파일 구성 | 홈 실제 전송 | 한글 커버리지 | 렌더블로킹 |
|---|---|---|---|---|
| **변경 전**(CDN `@import` dynamic-subset) | 92청크 unicode-range 분할 | **10청크·260KB** | 완전(KS X 1001 전체) | ✗ `@import`가 블로킹 |
| **내 오전 조치**(variable self-host) | 단일 2.0MB | **2.0MB 통째** | 완전 | ✓ self-host |
| static 4굵기 full(talmo가 말한 것) | 4파일 × ~760KB | ~3MB(4굵기 전부) | 완전 | ✓ |
| static 4굵기 subset(talmo 실제) | 4파일 × ~264KB | ~1MB | **부분**(subset 글자만) | ✓ |
| **채택: dynamic-subset self-host** | 92청크 self-host | **10청크·256KB** | 완전 | ✓ self-host |

- talmo가 DESIGN.md에서 "각 260KB"라 한 건 **static subset**이었다. subset은 자주 쓰는 글자만 담아 파일이 작지만, **UGC(이용자가 임의 한자·희귀 음절 입력)에서 글자가 깨질 위험**이 있다 — 커뮤니티엔 부적합.
- **dynamic-subset은 unicode-range로 92조각을 나눠, 브라우저가 페이지에 실제 등장한 글자의 조각만 받는다.** 커버리지는 완전하면서 전송량은 subset급(홈 256KB).

## 채택 방식

1. `pretendard` npm에서 `dist/web/variable/woff2-dynamic-subset/*.woff2` 92개를 `public/fonts/pretendard/`로 복사.
2. `pretendardvariable-dynamic-subset.css`의 상대경로(`./woff2-dynamic-subset/`)를 `/fonts/pretendard/`로 치환해 `app/pretendard.css`로 저장.
3. `app/layout.tsx`에서 `import './pretendard.css'`. `globals.css`는 `font-family: 'Pretendard Variable', ...`로 복귀.
4. npm 패키지·variable 단일 파일·`app/fonts.ts`·`next/font/local` 흔적 전부 제거.

### `next/font/local`을 안 쓴 이유

`next/font/local`은 `src` 배열로 여러 파일을 받지만 **각 항목에 `unicode-range`를 지정하는 API가 없다** — 92조각을 글자 범위로 나눠 받는 구조를 표현하지 못한다. 그래서 수동 `@font-face`(unicode-range 포함)가 이 방식엔 유일한 길이다. `@font-face`를 CSS 파일로 self-host하면 `@import`의 렌더블로킹 문제도 없다(HTML이 직접 링크하는 스타일시트라 병렬 로드).

## 검증 (로컬 prod)

- 홈에서 폰트 청크 **10개·256KB** 수신(브라우저 `performance.getEntriesByType('resource')` 실측) — 오전 variable 2.0MB 대비 **8배 감소**.
- `document.fonts.check("16px 'Pretendard Variable'")` → true(한글 정상 렌더, 브라우저 스크린샷 육안 확인).
- 청크 서빙 200·CSS에 @font-face 인라인 확인. tsc 0 / vitest 43 / build 27 routes.

## 트레이드오프

- **저장소에 3.0MB(92파일) 커밋** — variable 단일 2.0MB보다 저장소는 커지지만, **사용자 전송량이 실질 지표**이고 거기서 크게 이긴다. Vercel 정적 자산이라 CDN 캐시·불변.
- 페이지에 새로운 글자군이 등장하면 해당 청크를 추가로 받지만, `font-display: swap`이라 폰트 도착 전에도 폴백으로 즉시 렌더된다.

## 결론

talmo 권고("static 4굵기")는 방향(변수 통짜 대신 분할)은 맞았으나, grooman은 **UGC 커버리지 요구 때문에 static subset을 못 쓴다.** dynamic-subset self-host가 "완전 커버리지 + 최소 전송 + 렌더블로킹 없음"을 동시에 만족하는 상위 해법이다. **오전에 내가 넣은 2.0MB 회귀를 이 검토가 되돌렸다.**

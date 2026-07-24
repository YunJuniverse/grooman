# Checkpoint — talmo 권고 5~8번 (폰트·DESIGN.md·UX 진단·clinic 설계)

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Branch: `feat/talmo-insights-legal-hot` (PR#20 — 권고 1~4에 이어 5~8을 같은 브랜치에 얹음)

## 방금 한 것 (이번 세션)

talmo-com 교차조사 권고 5~8을 처리. 5·6은 구현, 7·8은 진단·설계 문서(둘 다 코드로 뛰어들 게 아니라 결정 게이트라).

### ⑤ 폰트 (권고는 "static 4굵기"였으나 더 나은 방식 발견)

- **내가 오전 GRM-001에서 넣은 variable 2.0MB가 실은 회귀였다**: 변경 전 CDN dynamic-subset은 홈에서 청크 10개·260KB만 받았는데, variable 통짜는 2.0MB를 다 받는다(8배 악화). 이걸 실측으로 발견.
- talmo가 말한 static subset(각 264KB)은 **UGC 글자 깨짐 위험**(subset은 자주 쓰는 글자만) → 커뮤니티엔 부적합.
- 채택: **dynamic-subset 92청크를 self-host**. `pretendard` npm에서 `woff2-dynamic-subset/*.woff2` 92개를 `public/fonts/pretendard/`로 복사, CSS 상대경로를 `/fonts/pretendard/`로 치환해 `app/pretendard.css`. `next/font/local`은 unicode-range 분할 API가 없어 못 씀 → 수동 @font-face(self-host라 @import 렌더블로킹도 없음).
- 검증: 브라우저 `performance` 실측 홈 **256KB·10청크**, `document.fonts.check` true, 스크린샷 육안. `app/fonts.ts`·variable 파일·npm 패키지 전부 제거.
- 문서: `font-strategy-2026-07-24.md`.

### ⑥ DESIGN.md 신설

- talmo 형식(frontmatter 토큰 + 근거 산문 + 규제 금칙) 따르되 **grooman 실제값**으로. `globals.css`에서 토큰 추출(대조: bg/text/accent/카테고리 6종 전부 일치 확인).
- grooman 고유 반영: **다크 우선 테마**, accent 인디고, 카테고리 6색, 4굵기. 이번 세션들에서 실제로 겪은 함정 2개를 박제: **Tailwind var()+opacity 컴파일 실패**, **다크 accent(#818cf8) 흰글자 대비 2.98:1 미달**.

### ⑦ UX 진단 (`user-ux-diagnosis-2026-07-24.md`)

- 로컬 prod를 375×812로 저니 관찰 + 대비 정량 측정.
- **최대 발견: 다크모드에서 페이지 제목 13곳이 안 보인다**(`text-gray-900` 하드코딩, 대비 1.05:1). Lighthouse(오전 95~100)가 못 잡은 문제 — 사람 저니로만 잡힘.
- **범위 규율**: 13곳 일괄 수정을 perl로 시도했다가, privacy·terms가 `bg-white` 하드코딩이라 `dark:text-gray-100` 넣으면 **흰 배경에 흰 글자**가 되는 걸 발견하고 **전부 되돌렸다.** 이건 이미 실행 중인 PERF-2 백그라운드 작업(전역 다크모드 감사) 영역이고 그쪽이 배경 맥락을 본다. UX 진단은 문서로 남기고 수정은 이관.
- 그 외 발견: 콜드스타트 화면이 "죽은 사이트"로 보임(→봇 시딩 후 공개, ADR-0002), 검색 페이지에 검색창 없음, 홈 랜딩 소개 없음.

### ⑧ clinic 신뢰장치 설계 (`clinic-trust-design-2026-07-24.md`)

- 강남언니 3종(방문 인증·'아쉬운 점' 필터·완결 동선) 중 grooman 적용 가능성 매핑. 완결 동선(예약·유인)은 §27 위반이라 **의도적 배제**.
- talmo 시드 교훈: 평점이 3~5점만 있으면 '아쉬운 점' 필터가 공허 → 봇 시딩 시 만족도 분포 넓게.
- B안(경량 스키마)+C안(익명 옵션) 제안. 스키마 변경(Class B)이고 clinic 글 0건이라 **지금 만들면 검증 데이터 없음** → GRM-018 빌드 게이트로.

## 검증한 것

- tsc 0 · vitest **43/43**(변화 없음 — 5~8은 폰트/문서라 로직 테스트 무관) · build 27 routes
- 폰트: 브라우저 네트워크 실측(256KB) + 한글 렌더 확인
- DESIGN.md: 토큰값 globals.css 대조 일치, 카테고리 6색 PostCard 대조 일치

## 다음 구체 행동

1. **아직 커밋 안 함** — wrap → ship(PR#20 브랜치에 추가) → PR#20 설명을 "권고 1~8 전체"로 갱신.
2. PR#20 리뷰·머지 → GRM-018 후속(검색창·홈 히어로·clinic 스키마).
3. 병행: GTM 콘솔 GA4 연결(사람).

## 막힌 것 / 주의

- **PERF-2 백그라운드 작업과 다크모드 제목 영역이 겹친다.** UX 진단이 13곳을 정량화했으니 그 작업이 참고할 수 있게 HANDOFF PERF-2 노트에 반영했다. 내가 이 PR에서 제목을 안 고친 건 의도적(범위·white-on-white 위험).
- 폰트 저장소 크기 3.0MB(92파일) 증가 — 사용자 전송량은 8배 줄었으니 트레이드오프 수용. `font-strategy` 문서에 기록.

## 환경

- `public/fonts/pretendard/` 92 woff2(3.0MB, OFL) 커밋됨 · `app/pretendard.css`가 self-host @font-face
- talmo 참조: `/Users/hayden/talmo-com`

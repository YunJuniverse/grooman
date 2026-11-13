# Checkpoint — GRM-018 UX 후속 (검색창 + 홈 히어로)

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Branch: `feat/grm-018-search-hero`

## 방금 한 것 (이번 세션)

PR#20(talmo 1~8)이 머지됐고, 그 사이 **PERF-2 백그라운드 작업이 PR#21(GRM-019)로 먼저 머지**돼 있었다. GRM-018 후속을 시작하며 먼저 중복 여부를 확인:

- **다크 제목(§1)은 GRM-019가 이미 해소**했다. 남은 `text-gray-900` 제목들을 전수조사하니 전부 `bg-white` 하드코딩 컨테이너(privacy·terms·글상세 article) 안이라 다크에서도 흰 배경 → gray-900이 맞고, GRM-019가 의도적으로 남긴 것. 즉 내 UX 진단 §1은 그 작업이 정확히 처리함. **중복 작업 안 함.**
- **검색창(§3)**: `app/search/SearchBox.tsx`(client 컴포넌트) 신설. 검색 페이지가 서버 컴포넌트라 인풋을 분리. `initialQuery`로 결과 페이지에서도 검색어 유지. 헤더 폼과 동일한 `/search?q=` 라우팅.
- **홈 히어로(§4)**: `page.tsx`에 `getIsLoggedIn()`(서버 `auth.getUser()`) 추가, **비로그인 첫 방문자에게만** 한 줄 소개 + 시작하기/둘러보기 CTA. 로그인 사용자에겐 공간 낭비라 숨김.
- **clinic 신뢰장치(§8)**는 스키마 변경(Class B) + clinic 글 0건이라 지금 만들면 검증 데이터가 없어 **GRM-020(Backlog)으로 분리**.

## 검증한 것

- tsc 0 · vitest 43/43 · build 27 routes
- 히어로·검색창 브라우저 시각 확인(모바일). 검색 라우팅 `?q=탈모` 동작(제목·결과 카운트).
- **함정 하나 자체 검증**: 브라우저 JS로 `input[type=search]` 값이 빈 걸 보고 "버그?" 의심 → SSR HTML을 curl로 직접 봐서 **본문 SearchBox엔 `value="탈모"` 정상**이고 내 셀렉터가 헤더 input(첫 번째)을 잡은 것이었음을 확인. 한글 IME는 브라우저 자동화 타이핑이 안 먹어 URL 직접 접근으로 검증.
- **죽은 설정 확인**: 홈 `revalidate=60`은 기존 쿠키 읽기(createClient)로 이미 무력이었고(빌드에서 `/`가 ƒ dynamic), 내 `auth.getUser()` 추가가 새 문제를 만들지 않음. revalidate 자체는 범위 밖이라 손 안 댐.

## 다음 구체 행동

1. **아직 커밋 안 함** — wrap → ship → PR.
2. 리뷰·머지 후 남은 축:
   - **PERF-3**(HANDOFF): 하드코딩 흰 카드 21파일 `var(--bg-card)` 전환 — 별도 리팩터(범위 큼)
   - **GRM-020**: clinic 신뢰장치 — clinic 활성화(글 생성) 후
   - **GRM-013 잔여**: 사람 GTM 콘솔 GA4 연결 → AI 전환 이벤트
3. 콜드스타트(§2): 공개 전 봇 시딩(ADR-0002·SOP_public-release-gate) — 이미 규정됨.

## 막힌 것 / 주의

- 병렬 세션(PERF-2/GRM-019)과의 조율이 이번엔 잘 맞았다 — 시작 전에 "이미 처리됐나"를 먼저 확인해 중복을 피한 게 주효. 앞으로도 백그라운드 작업과 겹치는 영역은 착수 전 grep으로 현재 상태부터 확인할 것.
- 한글 IME 브라우저 자동 입력 불가 — 향후 검색·폼 검증은 URL 직접 접근 또는 `form_input`(value 직접 세팅)으로.

## 환경

- Next 14.2.35 / 홈은 dynamic 렌더(쿠키 읽기) · 폰트 self-host(public/fonts/pretendard)
- main: #21까지 머지 완료

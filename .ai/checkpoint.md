# Checkpoint — GRM-001 Performance·Accessibility 조치 + PR#18/#19 병합 충돌 해소

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Sonnet 5, Claude Code)
- Branch: `docs/grm-001-lighthouse-measurement` (PR#18)

## 방금 한 것 (이번 세션)

사용자가 이전 턴에서 제시한 두 옵션("폰트 self-host" + "color-contrast 몇 곳")에 **"둘 다 진행해줘"**로 승인. 실제로는 폰트 fix 도중 진짜 UI 버그를 발견해 범위가 조금 늘어났다.

1. **폰트 self-host**: `npm install pretendard`로 실제 파일 확보(variable woff2, weight 45~920, SIL OFL 1.1) → `app/fonts/PretendardVariable.woff2`에 복사 → `npm uninstall pretendard`(런타임엔 파일만 필요, 패키지 의존성 불필요). `app/fonts.ts`에 `next/font/local` 선언(`display: swap`, `variable: --font-pretendard`). `app/layout.tsx`에 적용, `globals.css`의 렌더블로킹 `@import` 제거하고 `font-family: var(--font-pretendard), ...`로 전환. 덤으로 `app/fonts/`에 있던 미사용 Geist 스타터 폰트 파일 2개도 삭제.
2. **color-contrast**: Lighthouse JSON의 정확한 위반 노드·계산된 색상값을 직접 파싱해서 진짜 원인을 찾았다.
   - 로그인 버튼(`Header.tsx`)·사이드바 활성 항목(`Sidebar.tsx`)의 `bg-[var(--accent)]`가 다크모드 값(#818cf8) 기준 흰 텍스트와 2.98:1(미달) → 테마 무관 `bg-indigo-600`(6.29:1)으로 교체.
   - 홈 배지(`app/page.tsx`)의 `dark:text-gray-600`이 방향이 거꾸로(다크 배경엔 더 밝은 회색 필요) → `dark:text-gray-400`.
   - Footer(`bg-white` 하드코딩)의 `text-gray-400`(2.53:1) → `text-gray-500`(4.83:1).
3. **부수 발견(진짜 버그)**: `Header.tsx`·`BottomNav.tsx`가 `bg-[var(--bg-card)]/90`·`/95`를 쓰고 있었는데, **Tailwind가 `var()` 기반 arbitrary color에 opacity modifier를 적용 못 해 해당 유틸리티 클래스가 컴파일된 CSS에 아예 생성되지 않았다** — `npx tailwindcss -i ... -o ... --content ...`로 직접 컴파일해서 빈 결과를 확인, 추측이 아니라 검증된 사실. 헤더·하단내비 배경이 완전히 투명하게 떠 있었다. `globals.css`에 알파값을 미리 baked-in한 `--bg-card-translucent`를 추가해 해결.
4. **PR#18↔PR#19 머지 충돌 해소**: 사용자가 백그라운드로 스폰한 SEC-2 작업(어드민 수동 트리거 시크릿→세션 인증 전환)이 별도 세션에서 완료돼 PR#19로 먼저 머지됐다. 같은 라이브 파일(HANDOFF/TODO/checkpoint)을 동시에 건드려 PR#18에 conflict 발생 → `git merge origin/main --no-commit`으로 정확히 어디가 부딪히는지 확인 후 수동 병합: HANDOFF.md는 양쪽 서사를 모두 보존하는 시맨틱 병합(Current Focus에 SEC-2 머지 완료 + GRM-001 리뷰 대기 둘 다 반영, Open Issues 표에 SEC-2 Resolved 행과 PERF-1/PERF-2 행 모두 유지), TODO.md는 git이 자동 병합 성공(충돌 없음, 두 작업이 다른 섹션을 건드려서), checkpoint.md는 이 세션 것으로 덮어씀(지난 세션에 이미 있던 "latest session wins" 원칙 유지).

## 검증한 것

- tsc 0 · vitest 21 passed · build 27 routes
- **로컬 재측정**(Lighthouse, 동일 env 조건): Accessibility 95→**100**(color-contrast 0건, 재현 확인). CLS 0.359→0.097(font fix 효과 확인). FCP/Speed Index도 개선.
- **Performance 절대 수치는 신뢰 안 함**: 로컬에서 재측정할 때마다 LCP가 5.0s→13.5s로 널뛰었다 — 원인은 이 macOS 세션에 사용자가 병렬로 띄운 다른 백그라운드 Claude Code 세션(SEC-2 작업)이 같은 머신에서 CPU를 경합하고 있어서로 추정. Performance의 최종 확정은 이 PR 배포 후 production에서 해야 한다고 TODO/HANDOFF에 명시해뒀다.
- 브라우저로 직접 라이트/다크 두 모드 다 스크린샷 확인 — 헤더·하단내비 배경 정상 렌더, 로그인 버튼 잘 보임, 푸터 텍스트 가독성 확인.

## 다음 구체 행동

1. **아직 머지 커밋 안 함** — `git merge --no-commit`으로 충돌만 해소한 상태. HANDOFF.md·checkpoint.md 수동 해결 완료, `.ai/wrap-state.json`은 손으로 병합하지 말고 wrap 재실행으로 재생성할 것. 이어서 `git add` + merge commit → wrap → (필요시) ship.
2. PR#18 리뷰·머지 → **사람**: production 배포 후 Lighthouse 재측정으로 Performance 수치 최종 확인
3. GTM 콘솔 GA4 연결 (병행 가능, 별개 트랙)

## 막힌 것 / 주의

- **범위 관리**: color-contrast를 고치다가 "다크모드 텍스트 색이 전역적으로 `dark:` variant 없이 90여 곳 흩어져 있다"는 훨씬 큰 이슈를 발견했다. Lighthouse가 실제로 잡은 것만 좁게 고치고 나머지는 스폰된 백그라운드 작업으로 분리했다(task_870a06d3, PERF-2로 HANDOFF에도 기록).
- 같은 `var()`+opacity 컴파일 실패 패턴이 `PostCard.tsx`(hover border)·`Header.tsx`(avatar ring)에도 남아있음 — 위 스폰 작업에 포함시켜뒀다.
- **동시 세션 충돌 패턴**: 이번이 이 프로젝트에서 두 번째 "백그라운드로 스폰한 작업이 먼저 머지되면서 라이브 파일 충돌" 사례다(PR#14 때도 동일 패턴). spawn_task로 병렬 작업을 띄울 때는 라이브 파일 충돌 가능성을 항상 염두에 둘 것.

## 환경

- 로컬 스크래치: `/private/tmp/claude-501/.../scratchpad/lighthouse/*.json`
- `app/fonts/PretendardVariable.woff2` 2.0MB — 저장소에 커밋됨(OFL 라이선스, 재배포 가능)

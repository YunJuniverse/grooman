# Checkpoint — GRM-001 Performance·Accessibility 조치

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Sonnet 5, Claude Code)
- Branch: `docs/grm-001-lighthouse-measurement` (PR#18에 추가 커밋 예정 — 아직 커밋 안 함)

## 방금 한 것 (이번 세션)

사용자가 이전 턴에서 제시한 두 옵션("폰트 self-host" + "color-contrast 몇 곳")에 **"둘 다 진행해줘"**로 승인. 실제로는 폰트 fix 도중 진짜 UI 버그를 발견해 범위가 조금 늘어났다.

1. **폰트 self-host**: `npm install pretendard`로 실제 파일 확보(variable woff2, weight 45~920, SIL OFL 1.1) → `app/fonts/PretendardVariable.woff2`에 복사 → `npm uninstall pretendard`(런타임엔 파일만 필요, 패키지 의존성 불필요). `app/fonts.ts`에 `next/font/local` 선언(`display: swap`, `variable: --font-pretendard`). `app/layout.tsx`에 적용, `globals.css`의 렌더블로킹 `@import` 제거하고 `font-family: var(--font-pretendard), ...`로 전환. 덤으로 `app/fonts/`에 있던 미사용 Geist 스타터 폰트 파일 2개(GeistVF.woff, GeistMonoVF.woff — 어디서도 import 안 됨, grep으로 확인)도 삭제.
2. **color-contrast**: Lighthouse JSON의 정확한 위반 노드·계산된 색상값을 직접 파싱해서 진짜 원인을 찾았다.
   - 로그인 버튼(`Header.tsx`)·사이드바 활성 항목(`Sidebar.tsx`)의 `bg-[var(--accent)]`가 다크모드 값(#818cf8) 기준 흰 텍스트와 2.98:1(미달) → 테마 무관 `bg-indigo-600`(6.29:1)으로 교체.
   - 홈 배지(`app/page.tsx`)의 `dark:text-gray-600`이 방향이 거꾸로(다크 배경엔 더 밝은 회색 필요) → `dark:text-gray-400`.
   - Footer(`bg-white` 하드코딩)의 `text-gray-400`(2.53:1) → `text-gray-500`(4.83:1).
3. **부수 발견(진짜 버그)**: `Header.tsx`·`BottomNav.tsx`가 `bg-[var(--bg-card)]/90`·`/95`를 쓰고 있었는데, **Tailwind가 `var()` 기반 arbitrary color에 opacity modifier를 적용 못 해 해당 유틸리티 클래스가 컴파일된 CSS에 아예 생성되지 않았다** — `npx tailwindcss -i ... -o ... --content ...`로 직접 컴파일해서 빈 결과를 확인, 추측이 아니라 검증된 사실. 즉 헤더·하단내비 배경이 완전히 투명하게 떠 있었다(단순 접근성 이슈가 아니라 실제 UI 버그). `globals.css`에 알파값을 미리 baked-in한 `--bg-card-translucent`(라이트: rgba(255,255,255,.95), 다크: rgba(28,32,48,.95))를 추가해 해결.

## 검증한 것

- tsc 0 · vitest 21 passed · build 27 routes
- **로컬 재측정**(Lighthouse, 동일 env 조건): Accessibility 95→**100**(color-contrast 0건, 재현 확인). CLS 0.359→0.097(font fix 효과 확인). FCP/Speed Index도 개선.
- **Performance 절대 수치는 신뢰 안 함**: 로컬에서 재측정할 때마다 LCP가 5.0s→13.5s로 널뛰었다 — 원인은 이 macOS 세션에 **사용자가 병렬로 띄운 다른 백그라운드 Claude Code 세션**(SEC-2 작업)이 같은 머신에서 CPU를 경합하고 있어서로 추정(`ps aux`로 다른 claude 프로세스 확인함). Performance의 최종 확정은 이 PR 배포 후 production에서 해야 한다고 TODO/HANDOFF에 명시해뒀다.
- 브라우저로 직접 라이트/다크 두 모드 다 스크린샷 확인 — 헤더·하단내비 배경 정상 렌더, 로그인 버튼 잘 보임, 푸터 텍스트 가독성 확인.

## 다음 구체 행동

1. **아직 커밋 안 함** — 다음 스텝: `40_dev/snapshots/lighthouse-measurement-2026-07-24.md`에 조치 내역 이미 기록해둠 → wrap → ship(같은 PR#18 브랜치에 추가 커밋, PR 자동 갱신됨)
2. 리뷰·머지 → **사람**: production 배포 후 Lighthouse 재측정으로 Performance 수치 최종 확인
3. GTM 콘솔 GA4 연결 (병행 가능, 별개 트랙)

## 막힌 것 / 주의

- **범위 관리**: color-contrast를 고치다가 "다크모드 텍스트 색이 전역적으로 `dark:` variant 없이 90여 곳 흩어져 있다"는 훨씬 큰 이슈를 발견했다. 전부 고치면 이번 요청("몇 곳만") 범위를 크게 넘어서므로, **Lighthouse가 실제로 잡은 것만 좁게 고치고 나머지는 스폰된 백그라운드 작업으로 분리**했다(task_870a06d3, PERF-2로 HANDOFF에도 기록). 같은 판단 기준(SEC-2 때와 동일)을 유지.
- 같은 `var()`+opacity 컴파일 실패 패턴이 `PostCard.tsx`(hover border)·`Header.tsx`(avatar ring)에도 남아있음 — 호버 전용이라 화면이 깨지진 않지만 의도한 효과가 안 먹고 있을 것. 위 스폰 작업에 포함시켜뒀다.

## 환경

- 로컬 스크래치: `/private/tmp/claude-501/.../scratchpad/lighthouse/*.json` (home.json=수정 전, home-after.json/home-after2.json=수정 후 재측정 2회 — LCP 노이즈 확인용)
- `app/fonts/PretendardVariable.woff2` 2.0MB — 저장소에 커밋됨(OFL 라이선스, 재배포 가능)

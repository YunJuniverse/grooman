# Checkpoint — GRM-016 다크모드·명암비 전역 감사

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Branch: `fix/dark-mode-contrast-audit` (PR 미생성 — 커밋 전, 사용자 승인 대기)

## 방금 한 것 (이번 세션)

지난 세션(PR#18)에서 스폰해 둔 다크모드 전역 감사 작업을 이 브랜치에서 완결. PERF-2로 등록돼 있던 두 갈래를 마무리하고, 자동 감사로 세 번째 근본원인까지 잡았다. **27파일 수정.**

1. **var()+opacity 컴파일 실패 잔존 2건 조치**: `npx tailwindcss -i app/globals.css -o … --content`로 직접 컴파일해, `hover:border-[var(--accent)]/40`(PostCard:43)·`group-hover:ring-[var(--accent)]/40`(Header:92)가 **CSS를 전혀 생성하지 않음**을 재확인(추측 아님, 컴파일 산출물로 확정 — `.bg-[var(--bg-card-translucent)]`는 생성되고 `/40` 붙은 것은 안 생김). `globals.css`에 알파 baked-in `--accent-translucent`(light rgba(79,70,229,.4)/dark rgba(129,140,248,.4)) 신설 후 두 곳을 opacity modifier 없는 `[var(--accent-translucent)]`로 교체. 재컴파일로 실제 rule 생성 확인. **저장소 전체 재grep → 잔존 0건.**

2. **명암비 위반 = "다크모드" 아니라 "컨테이너별 실제 배경" 문제로 재정의**: 두 부류로 갈라 조치.
   - (a) **테마 배경(`--bg-base`/`--bg-card`) 위 텍스트** — `dark:` variant 부재로 다크에서 파손(404의 `text-gray-900`은 사실상 비가시, 로그인 h1도). 여기에 `dark:text-gray-*` 추가.
   - (b) **하드코딩 흰 카드 안 텍스트**(AdminDashboard·PostDetail·LoginForm·CommentItem 등) — `text-gray-400`(2.5:1)이 **라이트모드에서도 위반**. 다크 무관하게 gray-500↑로 상향. Footer 흰배경 케이스와 동일 논리.
   - 컨테이너 판별은 실제 배경을 grep+육안으로 확인. Python 헬퍼(`scratchpad/contrast.py`)로 WCAG 비율 재계산해 목표색 결정.

3. **파생 버그(폼 컨트롤)**: Tailwind preflight 컴파일 결과를 직접 읽어보니 input/textarea에 `color: inherit`만 주고 배경은 UA 기본(흰 필드) — 다크모드에서 `--text-1`(거의 흰색) 글자가 흰 필드에 찍혀 **입력값이 안 보였다**(브라우저로 재현 확인). 처음엔 globals.css에 전역 `input{background:var(--bg-card)}`를 줬으나, *흰 카드 안 필드가 검게* 뜨는 역회귀를 브라우저에서 발견 → 되돌리고 **필드별로 컨테이너에 맞춰** 명시(흰 카드=라이트 고정, 테마 배경=토큰 추종).

4. **브라우저 자동 명암비 감사 하니스 작성**(핵심 산출물): iframe으로 각 경로를 로드→모든 텍스트노드의 *합성 배경*(부모 체인 rgba 알파 합성)까지 계산해 WCAG 비율<임계 노드를 뽑는 스크립트. 이걸로 육안이 못 잡은 3건 추가 발견·조치: BottomNav `HOT`(orange-500, 2.79:1)·HotBoard 활성탭(orange-600, 3.56:1)·홈 배지(gray-500 on `--bg-base`, 4.43:1 경계미달). **최종: 9경로×2테마(라이트/다크)×모바일뷰 = 위반 0건.**

## 검증한 것

- tsc 0 · vitest 21/21 · build 27라우트 모두 통과.
- 로컬 `next build && next start`(더미 Supabase env로 렌더만) + 브라우저 육안: 다크 홈/로그인/404 정상, 폼 입력값 가독 확인, 라이트모드 무회귀 확인.
- 자동 감사 하니스로 9경로×2테마 0건(위 4번).

## 다음 구체 행동

1. **아직 커밋 안 함** — 사용자 승인 후 커밋(제안 메시지: `fix(a11y): GRM-016 다크모드·명암비 전역 감사 — var()+opacity 잔존 조치·폼 컨트롤 버그·컨테이너별 대비 교정`) → PR. Class A.
2. 병행: **사람**(hayden) production 배포 후 Lighthouse 재측정으로 Performance 최종 확인(GRM-001 잔여 블로커).
3. GTM 콘솔 GA4 연결(별개 트랙, GRM-013 잔여).

## 막힌 것 / 주의

- **범위 경계**: PERF-3 신설 — `bg-white`/`bg-gray-50` 하드코딩 라이트 카드가 21파일에 `dark:` 없이 산재. 다크에서 어두운 페이지 위에 흰 카드가 그대로 떠 *명암비는 통과하나 테마가 반쪽*. 폼 필드도 이 카드에 맞춰 라이트로 고정해 둔 상태. 카드 배경 토큰화 + 내부 text-gray 전량 토큰화는 범위가 커서 **의도적으로 이번 작업에서 제외**(HANDOFF PERF-3).
- **일괄치환 주의**: `text-gray-400`→`text-gray-500` blanket replace가 내가 방금 넣은 `dark:text-gray-400`까지 삼켜 `dark:text-gray-500`(다크에서 3.84:1 fail)로 되돌린 사고 1회 — 발견·수정함. 이후 blanket replace 후엔 반드시 `dark:` 잔재 재grep.

## 환경

- 로컬 검증 시 worktree 루트에 더미 `.env.local` 생성했다가 **세션 끝에 삭제함**(`git status`에 안 뜸). 실제 Supabase 값 아님(127.0.0.1).
- 명암비 헬퍼: `scratchpad/contrast.py`, 자동 감사 스크립트: `scratchpad/audit.js`(둘 다 scratchpad, 저장소 밖).
- 이 worktree/main repo 둘 다 Vercel 미링크·`.env.local` 없음 → production env pull 불가(사람 필요).
